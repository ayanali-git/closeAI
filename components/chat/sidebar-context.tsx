'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Chat, chatService } from '@/lib/chat-service';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';

interface SidebarContextType {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  isChatsLoading: boolean;
  loadChats: () => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
}

const SidebarContext = createContext<SidebarContextType>({
  sidebarOpen: true,
  setSidebarOpen: () => {},
  toggleSidebar: () => {},
  chats: [],
  setChats: () => {},
  isChatsLoading: true,
  loadChats: async () => {},
  deleteChat: async () => {},
});

export function SidebarProvider({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(defaultOpen);
  const [mounted, setMounted] = useState<boolean>(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isChatsLoading, setIsChatsLoading] = useState<boolean>(true);
  const deletedChatIdsRef = useRef<Set<string>>(new Set());

  const loadChats = useCallback(async () => {
    if (!user) {
      setIsChatsLoading(false);
      return;
    }
    try {
      const userChats = await chatService.getUserChats(supabase, user.id);
      const filtered = userChats.filter((c) => !deletedChatIdsRef.current.has(c.id));
      setChats(filtered);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setIsChatsLoading(false);
    }
  }, [user]);

  const deleteChat = useCallback(
    async (chatIdToDelete: string) => {
      // 1. Immediately track as deleted
      deletedChatIdsRef.current.add(chatIdToDelete);
      // 2. Instantly remove from local sidebar state (0ms)
      setChats((prev) => prev.filter((c) => c.id !== chatIdToDelete));
      // 3. Delete in database asynchronously
      try {
        await chatService.deleteChat(supabase, chatIdToDelete);
        // Retain in deleted set for 5s to prevent concurrent loadChats races
        setTimeout(() => {
          deletedChatIdsRef.current.delete(chatIdToDelete);
        }, 5000);
      } catch (err) {
        console.error('Failed to delete chat in background:', err);
        deletedChatIdsRef.current.delete(chatIdToDelete);
        loadChats();
        throw err;
      }
    },
    [loadChats]
  );

  useEffect(() => {
    if (user) {
      loadChats();
    } else {
      setChats([]);
      setIsChatsLoading(false);
    }
  }, [user, loadChats]);

  // Sync state on client mount strictly for desktop from localStorage/cookie; mobile is always closed
  useEffect(() => {
    const isDesktop = window.innerWidth >= 1025;
    if (!isDesktop) {
      setSidebarOpen(false);
    } else {
      try {
        const stored = localStorage.getItem('sidebar_open');
        if (stored !== null) {
          setSidebarOpen(stored === 'true');
        }
      } catch (e) {}
    }
    setMounted(true);
  }, []);

  // Whenever user navigates on small screens (< 1025px), automatically close the sidebar
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1025) {
      setSidebarOpen(false);
    }
  }, [pathname]);

  // Handle window resize between mobile and desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1025) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save to localStorage AND document.cookie on desktop (>= 1025px)
  useEffect(() => {
    if (mounted && typeof window !== 'undefined' && window.innerWidth >= 1025) {
      try {
        localStorage.setItem('sidebar_open', String(sidebarOpen));
        document.cookie = `sidebar_open=${sidebarOpen}; path=/; max-age=31536000; SameSite=Lax`;
      } catch (e) {}
    }
  }, [sidebarOpen, mounted]);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <SidebarContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar,
        chats,
        setChats,
        isChatsLoading,
        loadChats,
        deleteChat,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarContext() {
  return useContext(SidebarContext);
}

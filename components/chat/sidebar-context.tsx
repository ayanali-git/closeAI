'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  sidebarOpen: true,
  setSidebarOpen: () => {},
  toggleSidebar: () => {},
});

export function SidebarProvider({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(defaultOpen);
  const [mounted, setMounted] = useState<boolean>(false);

  // Sync state on client mount strictly from localStorage
  useEffect(() => {
    // Clean up any old sidebar_open cookie from the browser
    if (typeof document !== 'undefined') {
      document.cookie = 'sidebar_open=; path=/; max-age=0; SameSite=Lax';
    }
    try {
      const stored = localStorage.getItem('sidebar_open');
      if (stored !== null) {
        setSidebarOpen(stored === 'true');
      } else {
        // Default to open on desktop (>= 1024px), closed on mobile
        const isDesktop = window.innerWidth >= 1024;
        setSidebarOpen(isDesktop);
        localStorage.setItem('sidebar_open', String(isDesktop));
      }
    } catch (e) {}
    setMounted(true);
  }, []);

  // Save to localStorage whenever sidebarOpen changes after mount
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('sidebar_open', String(sidebarOpen));
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
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarContext() {
  return useContext(SidebarContext);
}

"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { chatService, Chat } from "@/lib/chat-service";
import { Sidebar } from "@/components/chat/sidebar";
import { WelcomeScreen } from "@/components/chat/welcome-screen";
import { ChatInput } from "@/components/chat/chat-input";
import { Loader, PanelRight } from "lucide-react";
import { CloseAIIcon } from "@/components/brand/logo";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebarContext } from "@/components/chat/sidebar-context";
import toast from "@/lib/toast";

function NewChatContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryPrompt = searchParams?.get("q")?.trim() || "";

  const {
    sidebarOpen,
    toggleSidebar: handleToggleSidebar,
  } = useSidebarContext();
  const [isSidebarBtnHovered, setIsSidebarBtnHovered] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isChatsLoading, setIsChatsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAutoCreating, setIsAutoCreating] = useState(false);
  const [selectedModel, setSelectedModel] = useState("GPT-5.4");
  const [selectedModelTier, setSelectedModelTier] = useState(4);
  const autoCreateTriggeredRef = useRef(false);

  const handleAutoCreateAndSend = async (promptText: string) => {
    if (!user) return;
    setIsAutoCreating(true);
    try {
      const cleanPrompt = promptText.trim().replace(/\s+/g, " ");
      // 1. Create chat directly in Supabase
      const { data: newChat, error: chatError } = await supabase
        .from("chats")
        .insert({
          user_id: user.id,
          title: cleanPrompt,
          starred: false,
        })
        .select()
        .single();

      if (chatError || !newChat) {
        throw new Error(chatError?.message || "Failed to create chat");
      }

      // 2. Mark pending prompt for immediate AI trigger in [id]/page
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          `auto_send_${newChat.id}`,
          JSON.stringify({
            prompt: promptText,
            model: selectedModel,
          })
        );
      }

      // 3. Replace URL with active chat
      router.replace(`/c/${newChat.id}`);
    } catch (error: any) {
      console.error("Error auto-starting chat:", error);
      toast.error(error.message || "Failed to start chat");
      setIsAutoCreating(false);
      setMessage(promptText);
    }
  };

  useEffect(() => {
    if (loading) return;

    if (!user) {
      const pending = queryPrompt || (typeof window !== "undefined" ? sessionStorage.getItem("pending_prompt") : null);
      if (pending) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("pending_prompt", pending);
        }
      }
      router.push("/auth/login");
      return;
    }

    loadChats();

    // Check if we need to auto-create and send from query param or pending prompt
    const promptToSend =
      queryPrompt ||
      (typeof window !== "undefined"
        ? sessionStorage.getItem("pending_prompt")
        : null);

    if (promptToSend && promptToSend.trim() && !autoCreateTriggeredRef.current) {
      autoCreateTriggeredRef.current = true;
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("pending_prompt");
      }
      handleAutoCreateAndSend(promptToSend.trim());
    }
  }, [user, loading, queryPrompt, router]);

  const loadChats = async () => {
    if (!user) return;
    try {
      const userChats = await chatService.getUserChats(supabase, user.id);
      setChats(userChats);
    } catch (error) {
      console.error("Error loading chats:", error);
    } finally {
      setIsChatsLoading(false);
    }
  };

  const handleToggleArchive = async (id: string, archived: boolean) => {
    try {
      if (archived) {
        await chatService.toggleChatStar(supabase, id, false);
      }
      await chatService.toggleChatArchive(supabase, id, archived);
      await loadChats();
      toast.success(archived ? "Chat archived" : "Chat unarchived");
    } catch (e) {
      console.error("Error toggling archive:", e);
      toast.error("Failed to update chat archive status");
    }
  };

  const handleSend = async () => {
    if (!message.trim() && uploadedFiles.length === 0) return;
    if (!user) {
      toast.error("Please log in to chat");
      router.push("/auth/login");
      return;
    }

    const messageText = message;
    const filesToSend = [...uploadedFiles];
    setMessage("");
    setUploadedFiles([]);
    setIsTyping(true);

    try {
      const cleanPrompt = messageText.trim().replace(/\s+/g, " ");
      // 1. Create chat directly in Supabase immediately (<80ms)
      const { data: newChat, error: chatError } = await supabase
        .from("chats")
        .insert({
          user_id: user.id,
          title: cleanPrompt,
          starred: false,
        })
        .select()
        .single();

      if (chatError || !newChat) {
        throw new Error(chatError?.message || "Failed to create chat");
      }

      // 2. Mark pending prompt for immediate AI trigger in [id]/page
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          `auto_send_${newChat.id}`,
          JSON.stringify({
            prompt: messageText,
            model: selectedModel,
          })
        );
      }

      // 3. Instantly navigate to the active chat!
      router.push(`/c/${newChat.id}`);
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error(error.message || "Failed to send message");
      setMessage(messageText);
      setUploadedFiles(filesToSend);
      setIsTyping(false);
      setIsUploading(false);
    }
  };

  useEffect(() => {
    document.title = "CloseAI";
  }, []);

  return (
    <div className="flex h-full w-full bg-background text-foreground overflow-hidden">
      <title>CloseAI</title>
      {/* Sidebar (Expanded or Mini Rail) */}
      <Sidebar
        user={user}
        chats={chats}
        currentChatId={null}
        onChatSelect={(id) => router.push(`/c/${id}`)}
        onNewChat={() => {
          setMessage("");
          setUploadedFiles([]);
        }}
        onDeleteChat={async (id) => {
          await chatService.deleteChat(supabase, id);
          loadChats();
        }}
        onToggleStar={async (id, starred) => {
          if (starred) {
            await chatService.toggleChatArchive(supabase, id, false);
          }
          await chatService.toggleChatStar(supabase, id, starred);
          loadChats();
          toast.success(starred ? "Chat pinned" : "Chat unpinned");
        }}
        onToggleArchive={handleToggleArchive}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isOpen={sidebarOpen}
        onToggle={handleToggleSidebar}
        isLoading={isChatsLoading || loading}
      />

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        {/* Transparent Top Floating Header */}
        <header className="shrink-0 z-30 h-14 pt-[env(safe-area-inset-top,0px)] px-3 sm:px-4 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            {!sidebarOpen && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSidebarBtnHovered(false);
                      handleToggleSidebar();
                    }}
                    onMouseEnter={() => setIsSidebarBtnHovered(true)}
                    onMouseLeave={() => setIsSidebarBtnHovered(false)}
                    onBlur={() => setIsSidebarBtnHovered(false)}
                    className="xl:hidden w-9 h-9 rounded-xl bg-white/50 dark:bg-[#212121]/50 backdrop-blur-sm border border-border/50 dark:border-neutral-700/50 text-neutral-700 dark:text-neutral-200 hover:text-foreground dark:hover:text-foreground hover:bg-background dark:hover:bg-background flex items-center justify-center transition-colors cursor-pointer outline-none focus:outline-none"
                    aria-label="Open sidebar"
                  >
                      <PanelRight className="w-4 h-4 text-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="start" sideOffset={6} className="text-md">
                  Open sidebar
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </header>

        {/* Content Stream (Welcome Zero State) */}
        <div className="flex-1 flex flex-col justify-center overflow-y-auto px-2 sm:px-4 pb-[env(safe-area-inset-bottom,0px)] no-overscroll">
          {isAutoCreating || (queryPrompt && !autoCreateTriggeredRef.current) ? (
            <div className="flex-1 w-full h-full flex flex-col items-center justify-center space-y-3 pb-12 text-muted-foreground">
              <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <WelcomeScreen
              user={user}
              onPromptSelect={(prompt) => setMessage(prompt)}
            >
              <ChatInput
                message={message}
                onMessageChange={setMessage}
                onSend={handleSend}
                uploadedFiles={uploadedFiles}
                onFilesChange={setUploadedFiles}
                isTyping={isTyping}
                isUploading={isUploading}
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                selectedTier={selectedModelTier}
                onTierChange={setSelectedModelTier}
                centered={false}
                showDisclaimer={false}
              />
            </WelcomeScreen>
          )}
        </div>
      </div>
    </div>
  );
}

function NewChatFallback() {
  const { sidebarOpen } = useSidebarContext();
  return (
    <div className="flex h-full w-full bg-background text-foreground overflow-hidden">
      {sidebarOpen ? (
        <div className="hidden xl:flex w-[260px] h-full bg-sidebar border-r border-border/80 p-3 flex-col justify-between shrink-0">
          <div className="space-y-4 py-2">
            <div className="h-4 w-20 bg-muted-foreground/20 rounded animate-pulse ml-2" />
            <div className="space-y-2">
              <div className="h-8 w-full bg-secondary/80 dark:bg-neutral-800/60 rounded-xl animate-pulse" />
              <div className="h-8 w-[85%] bg-secondary/70 dark:bg-neutral-800/50 rounded-xl animate-pulse" />
              <div className="h-8 w-[92%] bg-secondary/70 dark:bg-neutral-800/50 rounded-xl animate-pulse" />
            </div>
          </div>
          <div className="w-full flex items-center gap-2.5 py-2 pl-[2px] pr-2 border-t border-border/80">
            <div className="w-9 h-9 rounded-full bg-secondary/80 dark:bg-neutral-800/80 animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-24 bg-secondary/80 dark:bg-neutral-800/80 rounded animate-pulse" />
              <div className="h-2.5 w-12 bg-secondary/60 dark:bg-neutral-800/60 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden xl:flex w-[56px] h-full bg-sidebar border-r border-border flex-col items-center justify-between p-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-secondary/80 dark:bg-neutral-800/60 animate-pulse mt-2" />
          <div className="w-9 h-9 rounded-full bg-secondary/80 dark:bg-neutral-800/80 animate-pulse mb-2" />
        </div>
      )}
      <div className="flex-1 flex flex-col items-center justify-center min-w-0">
        <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    </div>
  );
}

export default function NewChatPage() {
  return (
    <Suspense fallback={<NewChatFallback />}>
      <NewChatContent />
    </Suspense>
  );
}

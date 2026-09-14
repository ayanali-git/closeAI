"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { chatService, Chat, Message } from "@/lib/chat-service";
import { Sidebar } from "@/components/chat/sidebar";
import { MessageList } from "@/components/chat/message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { TocNavigator } from "@/components/chat/toc-navigator";
import {
  ChevronDown,
  Share2,
  Upload,
  MoreHorizontal,
  Folder,
  Pin,
  PinOff,
  Archive,
  ArchiveX,
  Trash2,
  Loader,
  ArrowDown,
  PanelRight,
} from "lucide-react";
import { CloseAIIcon } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebarContext } from "@/components/chat/sidebar-context";
import { cn } from "@/lib/utils";
import toast from "@/lib/toast";
import { DeleteModal } from "@/components/modals/delete-modal";

export default function ActiveChatPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const chatId = params.id as string;

  const {
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar: handleToggleSidebar,
    chats,
    setChats,
    isChatsLoading,
    loadChats,
  } = useSidebarContext();
  const [isSidebarBtnHovered, setIsSidebarBtnHovered] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [isChatLoading, setIsChatLoading] = useState(true);
  const [currentChatTitle, setCurrentChatTitle] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<{
    content: string;
    files: File[];
  } | null>(null);
  const [selectedModel, setSelectedModel] = useState("GPT-5.4");
  const [selectedModelTier, setSelectedModelTier] = useState(4);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const autoSendTriggeredRef = useRef(false);
  const isAutoScrollPinnedRef = useRef(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Handle scroll events to show/hide scroll-to-bottom button
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 80;
    setShowScrollBottom(isScrolledUp);
    isAutoScrollPinnedRef.current = !isScrolledUp;
  };

  const dockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dockRef.current) return;
    const ro = new ResizeObserver(() => handleScroll());
    ro.observe(dockRef.current);
    return () => ro.disconnect();
  }, []);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior,
      });
      if (behavior === "auto") {
        setShowScrollBottom(false);
        isAutoScrollPinnedRef.current = true;
      }
    }
  };

  const forceScrollToBottom = () => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollTop =
      scrollContainerRef.current.scrollHeight;
    setShowScrollBottom(false);
    isAutoScrollPinnedRef.current = true;
  };

  // Auto-scroll pinning effect when messages, typing, or pending prompt update
  useEffect(() => {
    if (isAutoScrollPinnedRef.current) {
      forceScrollToBottom();
      const t1 = setTimeout(forceScrollToBottom, 60);
      const t2 = setTimeout(forceScrollToBottom, 180);
      const t3 = setTimeout(forceScrollToBottom, 320);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [messages.length, isTyping, pendingMessage]);

  // Keep scroll glued to bottom on iOS Safari virtual keyboard resize
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;
    const onResize = () => {
      if (isAutoScrollPinnedRef.current) {
        forceScrollToBottom();
      }
    };
    window.visualViewport.addEventListener("resize", onResize);
    return () => window.visualViewport?.removeEventListener("resize", onResize);
  }, []);

  // Optimistically show pending message immediately if this chat was just auto-created
  useEffect(() => {
    if (typeof window !== "undefined" && chatId) {
      const autoKey = `auto_send_${chatId}`;
      const autoDataStr = sessionStorage.getItem(autoKey);
      if (autoDataStr) {
        try {
          const autoData = JSON.parse(autoDataStr);
          if (autoData?.model) {
            setSelectedModel(autoData.model);
          }
          if (autoData?.prompt) {
            setPendingMessage({ content: autoData.prompt, files: [] });
            setIsTyping(true);
          }
        } catch (e) {}
      }
    }
  }, [chatId]);

  useEffect(() => {
    setIsChatLoading(true);
    setMessages([]);
    setCurrentChatTitle("");
  }, [chatId]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    } else if (user && chatId) {
      loadChat();
      loadChats();
    }
  }, [user, loading, chatId, router]);

  // Auto-focus chat input on load / reload (matching s/[id] behavior)
  useEffect(() => {
    if (!isChatLoading) {
      const timer = setTimeout(() => {
        const textarea = document.querySelector(
          'textarea[placeholder="Ask anything"]'
        ) as HTMLTextAreaElement | null;
        if (textarea) {
          textarea.focus();
          const len = textarea.value.length;
          textarea.setSelectionRange(len, len);
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isChatLoading]);

  const handleToggleArchive = async (id: string, archived: boolean) => {
    if (archived) {
      await chatService.toggleChatStar(supabase, id, false);
    }
    await chatService.toggleChatArchive(supabase, id, archived);
    await loadChats();
    toast.success(archived ? "Chat archived" : "Chat unarchived");
  };

  const loadChat = async () => {
    if (!user || !chatId) return;
    try {
      const details = await chatService.getChatDetails(supabase, chatId);
      if (!details) {
        router.push("/c");
        return;
      }
      setCurrentChatTitle(details.title || "");
      setMessages(details.messages || []);

      // Auto-heal truncated titles for existing chats
      const firstMsg = details.messages
        ?.find((m: any) => m.role === "user")
        ?.content?.trim();
      if (
        firstMsg &&
        details.title !== firstMsg &&
        (details.title?.endsWith("...") ||
          details.title?.endsWith("…") ||
          details.title?.length < firstMsg.length)
      ) {
        supabase
          .from("chats")
          .update({ title: firstMsg })
          .eq("id", chatId)
          .then(() => {});
        setCurrentChatTitle(firstMsg);
        setChats((prev) =>
          prev.map((c) => (c.id === chatId ? { ...c, title: firstMsg } : c))
        );
      }

      // Check if this chat was just created with a pending auto-send prompt
      if (typeof window !== "undefined" && !autoSendTriggeredRef.current) {
        const autoKey = `auto_send_${chatId}`;
        const autoDataStr = sessionStorage.getItem(autoKey);
        if (autoDataStr) {
          sessionStorage.removeItem(autoKey);
          autoSendTriggeredRef.current = true;
          const autoData = JSON.parse(autoDataStr);
          if (autoData?.prompt) {
            if (autoData?.model) {
              setSelectedModel(autoData.model);
            }
            triggerAiGeneration(autoData.prompt, autoData?.model);
          }
        }
      }
    } catch (error) {
      console.error("Error loading chat:", error);
      toast.error("Failed to load chat");
      router.push("/c");
    } finally {
      setIsChatLoading(false);
    }
  };

  const streamAbortControllerRef = useRef<boolean>(false);

  const handleStop = () => {
    streamAbortControllerRef.current = true;
    setIsTyping(false);
  };

  const streamAssistantResponse = async (
    userMessage: any,
    fullAssistantMessage: any,
    baseMessages?: any[]
  ) => {
    streamAbortControllerRef.current = false;
    const fullText = fullAssistantMessage?.content || "";
    const assistantId = fullAssistantMessage?.id;

    // Remove optimistic pending message
    setPendingMessage(null);

    // Initial state with blank assistant message
    setMessages((prev) => {
      const list = baseMessages ? [...baseMessages] : [...prev];
      const filtered = list.filter((m) => m.id !== userMessage.id);
      return [
        ...filtered,
        userMessage,
        { ...fullAssistantMessage, content: "" },
      ];
    });

    setIsTyping(true);

    const tokens = fullText.split(/(\s+)/);
    if (tokens.length === 0) {
      setIsTyping(false);
      return;
    }

    let displayed = "";
    const step = Math.max(1, Math.min(3, Math.ceil(tokens.length / 100)));
    const intervalMs = 18;

    for (let i = 0; i < tokens.length; i += step) {
      if (streamAbortControllerRef.current) {
        displayed = fullText;
        break;
      }

      displayed += tokens.slice(i, i + step).join("");
      const snapshot = displayed;

      setMessages((prev) => {
        if (prev.length === 0) return prev;
        const copy = [...prev];
        const lastIdx = copy.length - 1;
        if (copy[lastIdx] && copy[lastIdx].id === assistantId) {
          copy[lastIdx] = { ...copy[lastIdx], content: snapshot };
        }
        return copy;
      });

      if (isAutoScrollPinnedRef.current && scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop =
          scrollContainerRef.current.scrollHeight;
      }
      await new Promise((r) => setTimeout(r, intervalMs));
    }

    // Final update with complete content
    setMessages((prev) => {
      const copy = [...prev];
      const lastIdx = copy.length - 1;
      if (copy[lastIdx] && copy[lastIdx].id === assistantId) {
        copy[lastIdx] = { ...copy[lastIdx], content: fullText };
      }
      return copy;
    });

    setIsTyping(false);
    if (isAutoScrollPinnedRef.current) {
      forceScrollToBottom();
    }
  };

  const triggerAiGeneration = async (
    promptText: string,
    modelOverride?: string
  ) => {
    setIsTyping(true);
    setPendingMessage({ content: promptText, files: [] });
    isAutoScrollPinnedRef.current = true;
    setShowScrollBottom(false);
    setTimeout(forceScrollToBottom, 0);
    setTimeout(forceScrollToBottom, 60);
    setTimeout(forceScrollToBottom, 180);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      let authToken = token;
      if (!authToken) {
        const { data: sessionData } = await supabase.auth.getSession();
        authToken = sessionData?.session?.access_token || null;
      }
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          chatId,
          message: promptText,
          files: [],
          model: modelOverride || selectedModel,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to generate response");
      }

      const result = await response.json();
      if (result.assistantMessage && result.userMessage) {
        await streamAssistantResponse(
          result.userMessage,
          result.assistantMessage
        );
      } else {
        const details = await chatService.getChatDetails(supabase, chatId);
        if (details?.messages) {
          setMessages(details.messages);
        }
        setIsTyping(false);
        setPendingMessage(null);
      }
      await loadChats();
    } catch (error: any) {
      console.error("AI generation error:", error);
      toast.error(error.message || "Failed to generate response");
      setInputValue(promptText);
      setIsTyping(false);
      setPendingMessage(null);
    }
  };

  const handleEditAndResend = async (
    messageId: string,
    newContent: string,
    messageIndex: number
  ) => {
    if (!newContent.trim() || !user || !chatId) return;

    // Abort active stream immediately if currently generating
    streamAbortControllerRef.current = true;

    // 1. Truncate local messages array up to messageIndex
    const remainingMessages = messages.slice(0, messageIndex);
    setMessages(remainingMessages);

    // 2. Set pending message and typing indicator
    setPendingMessage({ content: newContent, files: [] });
    setIsTyping(true);
    isAutoScrollPinnedRef.current = true;
    setShowScrollBottom(false);
    setTimeout(forceScrollToBottom, 0);
    setTimeout(forceScrollToBottom, 60);
    setTimeout(forceScrollToBottom, 180);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      let authToken = token;
      if (!authToken) {
        const { data: sessionData } = await supabase.auth.getSession();
        authToken = sessionData?.session?.access_token || null;
      }
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      // 3. Call /api/chat with truncateMessageId to prune DB messages from that point
      const response = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          chatId,
          message: newContent,
          files: [],
          truncateMessageId: messageId,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to regenerate response");
      }

      const result = await response.json();
      if (result.userMessage && result.assistantMessage) {
        await streamAssistantResponse(
          result.userMessage,
          result.assistantMessage,
          remainingMessages
        );
      } else {
        await loadChat();
        setIsTyping(false);
        setPendingMessage(null);
      }
      await loadChats();
    } catch (error: any) {
      console.error("Error editing message:", error);
      toast.error(error.message || "Failed to regenerate response");
      await loadChat();
      setIsTyping(false);
      setPendingMessage(null);
    }
  };

  const handleRegenerate = async (
    assistantMsg?: Message,
    assistantIndex?: number
  ) => {
    if (isTyping || !user || !chatId) return;

    let targetIdx =
      typeof assistantIndex === "number" ? assistantIndex : messages.length - 1;

    // Find the nearest preceding user message to regenerate from
    let userMsgIdx = -1;
    for (let i = targetIdx - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        userMsgIdx = i;
        break;
      }
    }

    if (userMsgIdx === -1) {
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === "user") {
          userMsgIdx = i;
          break;
        }
      }
    }

    if (userMsgIdx === -1) {
      toast.error("No prompt found to regenerate.");
      return;
    }

    const userMsg = messages[userMsgIdx];
    await handleEditAndResend(userMsg.id, userMsg.content, userMsgIdx);
  };

  const handleSend = async () => {
    if (!inputValue.trim() && uploadedFiles.length === 0) return;
    if (!user) return;

    const messageContent = inputValue;
    const currentFiles = [...uploadedFiles];

    setInputValue("");
    setUploadedFiles([]);
    setPendingMessage({ content: messageContent, files: currentFiles });
    setIsTyping(true);
    isAutoScrollPinnedRef.current = true;
    setShowScrollBottom(false);

    // Immediate scroll + interval scrolls through iOS Safari keyboard dismissal
    setTimeout(forceScrollToBottom, 0);
    setTimeout(forceScrollToBottom, 60);
    setTimeout(forceScrollToBottom, 150);
    setTimeout(forceScrollToBottom, 320);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      let fileData: any[] = [];
      if (currentFiles.length > 0) {
        setIsUploading(true);
        for (const file of currentFiles) {
          const formData = new FormData();
          formData.append("file", file);
          const uploadHeaders: Record<string, string> = {};
          if (token) {
            uploadHeaders["Authorization"] = `Bearer ${token}`;
          }

          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            headers: uploadHeaders,
            body: formData,
          });

          if (uploadRes.ok) {
            const result = await uploadRes.json();
            fileData.push(result.file);
          }
        }
        setIsUploading(false);
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          chatId,
          message: messageContent,
          files: fileData,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to send message");
      }

      const result = await response.json();
      if (result.userMessage && result.assistantMessage) {
        await streamAssistantResponse(
          result.userMessage,
          result.assistantMessage
        );
      } else {
        await loadChat();
        setIsTyping(false);
        setPendingMessage(null);
      }
      await loadChats();
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error(error.message || "Failed to send message");
      setInputValue(messageContent);
      setUploadedFiles(currentFiles);
      setIsTyping(false);
      setPendingMessage(null);
    } finally {
      setIsUploading(false);
    }
  };

  // Dynamic document title: "CloseAI — <chat full message>"
  const firstUserMsg = messages.find((m) => m.role === "user")?.content?.trim();
  const rawTitle =
    firstUserMsg ||
    pendingMessage?.content?.trim() ||
    currentChatTitle ||
    chats.find((c) => c.id === chatId)?.title ||
    "";
  const cleanTitle = rawTitle
    .replace(/(\.\.\.|\u2026)\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();

  useEffect(() => {
    if (cleanTitle) {
      document.title = `CloseAI \u007C ${cleanTitle}`;
    } else {
      document.title = "CloseAI";
    }
    return () => {
      document.title = "CloseAI";
    };
  }, [cleanTitle]);

  return (
    <div className="flex h-full w-full bg-background text-foreground overflow-hidden">
      <title>{cleanTitle ? `CloseAI \u007C ${cleanTitle}` : "CloseAI"}</title>
      {/* Sidebar */}
      <Sidebar
        user={user}
        chats={chats}
        currentChatId={chatId}
        onChatSelect={(id) => router.push(`/c/${id}`)}
        onNewChat={() => {
          if (typeof window !== "undefined" && window.innerWidth < 1025) {
            setSidebarOpen(false);
          }
          router.push("/c");
        }}
        onDeleteChat={async (id) => {
          await chatService.deleteChat(supabase, id);
          if (id === chatId) router.push("/c");
          else loadChats();
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

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        {/* Transparent Floating Header - Buttons float cleanly on top, no background bar/patti */}
        <header className="absolute top-0 left-0 right-0 z-30 h-14 pt-[env(safe-area-inset-top,0px)] px-3 sm:px-4 flex items-center justify-between select-none pointer-events-none bg-transparent">
          {/* Top gradient overlay — fades scrolled text behind header buttons */}
          <div className="absolute top-0 left-0 right-4 sm:right-5 h-20 pointer-events-none bg-gradient-to-b from-background via-background to-transparent -z-10" />
          <div className="flex items-center gap-2 pointer-events-auto mt-3 pl-3 sm:pl-0">
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
                    className="xl:hidden w-9 h-9 rounded-xl bg-white/50 dark:bg-[#212121]/50 backdrop-blur-sm border border-border/80 dark:border-none dark:border-neutral-700/80 text-neutral-700 dark:text-neutral-200 hover:text-foreground dark:hover:text-foreground flex items-center justify-center transition-colors cursor-pointer outline-none focus:outline-none"
                    aria-label="Open sidebar"
                  >
                    <PanelRight className="w-4 h-4 text-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  align="start"
                  sideOffset={6}
                  className="text-md"
                >
                  Open sidebar
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto mt-3 pr-3 sm:pr-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  disabled={isSharing}
                  onClick={async () => {
                    setIsSharing(true);
                    try {
                      const shareUrl = `${window.location.origin}/s/${chatId}`;
                      await navigator.clipboard.writeText(shareUrl);
                      toast.success("Public link copied to your clipboard", {
                        description:
                          "Anyone with this link can see this conversation",
                      });
                    } catch (e) {
                      toast.error("Failed to copy link");
                    } finally {
                      setTimeout(() => setIsSharing(false), 300);
                    }
                  }}
                  className="group h-9 px-2.5 sm:px-3 gap-1.5 rounded-xl bg-white/50 dark:bg-[#212121]/50 backdrop-blur-sm border border-border/80 dark:border-none dark:border-neutral-700/80 text-neutral-700 dark:text-neutral-200 hover:text-foreground dark:hover:text-foreground flex items-center justify-center text-base font-medium transition-colors cursor-pointer outline-none focus:outline-none disabled:opacity-70 disabled:pointer-events-auto disabled:cursor-not-allowed"
                >
                  {isSharing ? (
                    <Loader className="w-4 h-4 shrink-0 animate-spin text-muted-foreground group-hover:text-foreground" />
                  ) : (
                    <Upload className="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                  )}
                  <span className="inline">Share</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={6} className="text-md">
                Share conversation
              </TooltipContent>
            </Tooltip>

            {/* Three Dots Options Menu */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="group w-9 h-9 rounded-xl bg-white/50 dark:bg-[#212121]/50 backdrop-blur-sm border border-border/80 dark:border-none dark:border-neutral-700/80 text-neutral-700 dark:text-neutral-200 hover:text-foreground dark:hover:text-foreground flex items-center justify-center transition-colors cursor-pointer outline-none focus:outline-none"
                      aria-label="More options"
                    >
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  align="end"
                  sideOffset={6}
                  className="text-md"
                >
                  More options
                </TooltipContent>
              </Tooltip>

              <DropdownMenuContent
                align="end"
                sideOffset={6}
                className="w-52 rounded-xl p-1.5 bg-white/50 dark:bg-[#212121]/50 backdrop-blur-sm border border-border/80 dark:border-none dark:border-neutral-700/80"
              >
                <DropdownMenuItem
                  onClick={() => toast("No files attached to this chat")}
                  className="group flex items-center gap-2.5 px-3 py-2 rounded-xl text-[15px] font-normal cursor-pointer text-foreground hover:bg-secondary dark:hover:bg-[#2f2f2f] transition-colors"
                >
                  <Folder className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                  <span>View files in chat</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={async () => {
                    const currentChat = chats.find((c) => c.id === chatId);
                    const isStarred = !!currentChat?.starred;
                    if (!isStarred) {
                      await chatService.toggleChatArchive(
                        supabase,
                        chatId,
                        false
                      );
                    }
                    await chatService.toggleChatStar(
                      supabase,
                      chatId,
                      !isStarred
                    );
                    loadChats();
                    toast.success(isStarred ? "Chat unpinned" : "Chat pinned");
                  }}
                  className="group flex items-center gap-2.5 px-3 py-2 rounded-xl text-[15px] font-normal cursor-pointer text-foreground hover:bg-secondary dark:hover:bg-[#2f2f2f] transition-colors"
                >
                  {chats.find((c) => c.id === chatId)?.starred ? (
                    <>
                      <PinOff className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                      <span>Unpin</span>
                    </>
                  ) : (
                    <>
                      <Pin className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                      <span>Pin</span>
                    </>
                  )}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={async () => {
                    const currentChat = chats.find((c) => c.id === chatId);
                    const isArchived = !!currentChat?.archived;
                    await handleToggleArchive(chatId, !isArchived);
                  }}
                  className="group flex items-center gap-2.5 px-3 py-2 rounded-xl text-[15px] font-normal cursor-pointer text-foreground hover:bg-secondary dark:hover:bg-[#2f2f2f] transition-colors"
                >
                  {chats.find((c) => c.id === chatId)?.archived ? (
                    <ArchiveX className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                  ) : (
                    <Archive className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                  )}
                  <span>
                    {chats.find((c) => c.id === chatId)?.archived
                      ? "Unarchive"
                      : "Archive"}
                  </span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setShowDeleteModal(true)}
                  className="group flex items-center gap-2.5 px-3 py-2 rounded-xl text-[15px] font-normal cursor-pointer text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500 group-hover:text-red-600" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Full-Height Scrollable Message Stream — scrollbar runs full height without heading strip */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 w-full overflow-x-hidden relative no-overscroll flex flex-col pt-14 scroll-smooth overflow-y-scroll [scrollbar-gutter:stable]"
        >
          <div className="flex-1 flex flex-col min-h-full">
            {/* Messages Container or Loader */}
            {isChatLoading ? (
              <div className="flex-1 w-full h-full flex flex-col items-center justify-center pb-16 text-muted-foreground">
                <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="flex-1 pb-4 sm:pb-6">
                <MessageList
                  messages={messages}
                  user={user}
                  isTyping={isTyping}
                  pendingMessage={pendingMessage}
                  onRegenerate={handleRegenerate}
                  onEditAndResend={handleEditAndResend}
                />
              </div>
            )}
            {/* Right-Edge TOC Navigator */}
            {!isChatLoading && (
              <TocNavigator
                messages={messages}
                containerRef={scrollContainerRef}
              />
            )}

            {/* Floating Input Dock inside scroll container for 100% scrollbar-aware width alignment */}
            <div
              ref={dockRef}
              className="sticky bottom-0 left-0 right-4 sm:right-5 z-20 pointer-events-none pb-[max(env(safe-area-inset-bottom,0px),0.5rem)] bg-gradient-to-t from-background via-background/80 to-transparent pt-4 mt-auto"
            >
              <div className="pointer-events-auto">
                <ChatInput
                  message={inputValue}
                  onMessageChange={setInputValue}
                  onSend={handleSend}
                  onStop={handleStop}
                  uploadedFiles={uploadedFiles}
                  onFilesChange={setUploadedFiles}
                  isTyping={isTyping}
                  isUploading={isUploading}
                  showDisclaimer={true}
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                  selectedTier={selectedModelTier}
                  onTierChange={setSelectedModelTier}
                >
                  {/* Dynamic Floating Scroll-to-Bottom Button — stays right above input pill */}
                  <AnimatePresence>
                    {showScrollBottom && (
                      <div className="absolute bottom-full mb-3 inset-x-0 flex justify-center pointer-events-none z-30">
                        <div className="pointer-events-auto">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={() => {
                                  isAutoScrollPinnedRef.current = true;
                                  scrollToBottom("smooth");
                                }}
                                className="group w-10 h-10 rounded-full bg-white/50 dark:bg-[#212121]/50 backdrop-blur-sm border border-border/80 dark:border-none dark:border-neutral-700/80 text-neutral-700 dark:text-neutral-200 hover:text-foreground dark:hover:text-foreground hover:border-border/80 dark:hover:border-neutral-700/80 flex items-center justify-center transition-all cursor-pointer"
                                aria-label="Scroll to bottom"
                              >
                                <ArrowDown className="w-5 h-5 text-muted-foreground group-hover:text-foreground shrink-0" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              sideOffset={8}
                              className="text-md"
                            >
                              Scroll to bottom
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    )}
                  </AnimatePresence>
                </ChatInput>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeleteModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        itemTitle={currentChatTitle || "Chat"}
        onConfirm={async () => {
          await chatService.deleteChat(supabase, chatId);
          router.push("/c");
        }}
      />
    </div>
  );
}

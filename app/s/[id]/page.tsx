"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MessageList } from "@/components/chat/message-list";
import TocNavigator from "@/components/chat/toc-navigator";
import { chatService, Message } from "@/lib/chat-service";
import { supabase } from "@/lib/supabase";
import { CloseAIIcon } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  Loader,
  Plus,
  Upload,
  Brain,
  Mic,
  ArrowUp,
  ArrowDown,
  Maximize2,
  Minimize2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlusMenuContent } from "@/components/chat/plus-menu-content";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import toast from "@/lib/toast";

/**
 * Auto-scrolling marquee title for shared chat header on hover
 * Uses fixed container bounds so overflowWidth measures accurately, scrolling full text on hover without showing "..."
 */
function SharedHeaderTitleMarquee({
  title,
  isLoading = false,
  chatId,
}: {
  title: string;
  isLoading?: boolean;
  chatId?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflowWidth, setOverflowWidth] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  useEffect(() => {
    if (chatId && typeof window !== "undefined") {
      const storedW = localStorage.getItem(`shared_title_w_${chatId}`);
      if (storedW) {
        const parsed = parseInt(storedW, 10);
        if (!isNaN(parsed) && parsed > 0) {
          document.documentElement.style.setProperty(
            "--shared-title-w",
            `${parsed}px`
          );
          return;
        }
      }
      const storedTitle = localStorage.getItem(`shared_title_${chatId}`);
      if (storedTitle) {
        const w = Math.min(
          Math.max(48, Math.round(storedTitle.length * 8.5)),
          516
        );
        document.documentElement.style.setProperty(
          "--shared-title-w",
          `${w}px`
        );
      }
    }
  }, [chatId]);

  useEffect(() => {
    if (textRef.current && title && chatId && typeof window !== "undefined") {
      const actualWidth = Math.ceil(textRef.current.scrollWidth);
      if (actualWidth > 0) {
        document.documentElement.style.setProperty(
          "--shared-title-w",
          `${actualWidth}px`
        );
        document.cookie = `st_w_${chatId}=${actualWidth}; path=/; max-age=31536000; SameSite=Lax`;
        localStorage.setItem(`shared_title_w_${chatId}`, String(actualWidth));
        localStorage.setItem(`shared_title_${chatId}`, title);
      }
    }
  }, [title, chatId]);

  const measure = useCallback(() => {
    if (textRef.current && containerRef.current) {
      const diff =
        textRef.current.scrollWidth - containerRef.current.clientWidth;
      setOverflowWidth(diff > 0 ? diff : 0);
    }
  }, []);

  useEffect(() => {
    if (isLoading || !title) return;
    measure();
    const timer1 = setTimeout(measure, 100);
    const timer2 = setTimeout(measure, 500);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener("resize", measure);
    };
  }, [title, isLoading, measure]);

  const handleMouseEnter = () => {
    measure();
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  if (isLoading || !title) {
    return (
      <div className="relative flex-1 overflow-hidden min-w-0 max-w-[140px] min-[400px]:max-w-[200px] min-[600px]:max-w-[280px] md:max-w-[316px] lg:max-w-[416px] xl:max-w-[516px] py-1 select-none flex items-center">
        <div
          style={{ width: "var(--shared-title-w, 180px)" }}
          className="h-4 rounded-md bg-secondary/80 dark:bg-neutral-800/80 animate-pulse shrink-0 max-w-full"
        />
      </div>
    );
  }

  const duration = Math.max(1.8, overflowWidth / 24);

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative flex-1 overflow-hidden min-w-0 max-w-[140px] min-[400px]:max-w-[200px] min-[600px]:max-w-[280px] md:max-w-[316px] lg:max-w-[416px] xl:max-w-[516px] py-1 select-none"
    >
      <span
        ref={textRef}
        style={{
          transform:
            isHovered && overflowWidth > 0
              ? `translateX(-${overflowWidth + 10}px)`
              : "translateX(0px)",
          transition:
            isHovered && overflowWidth > 0
              ? `transform ${duration}s linear`
              : "transform 0.25s ease-out",
        }}
        className="inline-block whitespace-nowrap text-base sm:text-[15px] font-medium text-foreground select-none"
      >
        {title}
      </span>
    </div>
  );
}

/**
 * Bottom Chat Input Pill for Shared Page
 * Identical design, colors, focus states, and pill shape as the main ChatInput component,
 * with "Continue chatting" placeholder text and disabled "Think" mode button with tooltip.
 */
function SharedChatInputPill({
  chatId,
  showScrollBottom,
  onScrollToBottom,
}: {
  chatId: string;
  showScrollBottom?: boolean;
  onScrollToBottom?: () => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMultiLine, setIsMultiLine] = useState(false);
  const [isFullyExpanded, setIsFullyExpanded] = useState(false);
  const [menuSideOffset, setMenuSideOffset] = useState(14);
  const [menuAlignOffset, setMenuAlignOffset] = useState(0);
  const [menuWidth, setMenuWidth] = useState<number | undefined>(undefined);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const plusButtonRef = useRef<HTMLButtonElement>(null);
  const cursorPositionRef = useRef<number | null>(null);

  const lineCount = (prompt || "").split("\n").length;
  const isBigContent =
    lineCount >= 4 ||
    (prompt && prompt.trim().length >= 180) ||
    ((prompt || "").includes("\n") && (prompt || "").trim().length >= 80) ||
    isFullyExpanded;

  const isTextMultiLine = Boolean(
    prompt &&
      prompt.trim().length > 0 &&
      (prompt.includes("\n") || prompt.length > 25 || isMultiLine)
  );

  const isExpandedLayout = isFullyExpanded || isTextMultiLine;

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;

    if (!prompt || prompt.trim() === "") {
      el.style.height = "26px";
      el.style.overflowY = "hidden";
      setIsMultiLine(false);
      if (isFullyExpanded) setIsFullyExpanded(false);
      return;
    }

    el.style.height = "auto";
    const scrollH = el.scrollHeight;
    const maxH = isFullyExpanded ? 460 : 200;

    if (scrollH > 38 || prompt.includes("\n")) {
      setIsMultiLine(true);
      if (scrollH > maxH) {
        el.style.height = `${maxH}px`;
        el.style.overflowY = "auto";
      } else {
        el.style.height = `${Math.max(scrollH, 44)}px`;
        el.style.overflowY = "hidden";
      }
    } else {
      el.style.height = "26px";
      el.style.overflowY = "hidden";
      setIsMultiLine(false);
    }
  }, [prompt, isFullyExpanded]);

  useEffect(() => {
    adjustHeight();
  }, [adjustHeight]);

  // Keep focus and restore exact cursor position when layout expands or collapses
  useEffect(() => {
    const focusAndRestoreCursor = () => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const targetPos =
          cursorPositionRef.current !== null
            ? cursorPositionRef.current
            : textareaRef.current.value.length;
        try {
          textareaRef.current.setSelectionRange(targetPos, targetPos);
        } catch (e) {}
      }
    };

    focusAndRestoreCursor();
    const timer = setTimeout(focusAndRestoreCursor, 0);
    return () => clearTimeout(timer);
  }, [isExpandedLayout]);

  const handlePaste = () => {
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const len = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(len, len);
      }
    }, 0);
  };

  const handleContinue = () => {
    if (chatId) {
      if (prompt.trim()) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            `auto_send_${chatId}`,
            JSON.stringify({ prompt: prompt.trim() })
          );
        }
      }
      window.open(`/c/${chatId}`, "_blank");
    } else {
      window.open("/c", "_blank");
    }
  };

  const toggleDictation = async () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error(
        "Speech recognition is not supported in this browser. Please use Chrome or Edge."
      );
      return;
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (err: any) {
      toast.error(
        "Microphone access denied. Please allow microphone permission in your browser."
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = navigator.language || "en-US";

      const baseText = prompt.trim();

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        const updated = baseText ? `${baseText} ${transcript}` : transcript;
        setPrompt(updated);
      };

      recognition.onerror = (event: any) => {
        if (event.error !== "no-speech") {
          setIsListening(false);
          if (event.error === "not-allowed") {
            toast.error("Microphone permission denied.");
          }
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
      toast.success("Listening... Speak now");
    } catch (err: any) {
      toast.error("Could not start speech recognition.");
      setIsListening(false);
    }
  };

  const updateMenuPosition = useCallback(() => {
    if (plusButtonRef.current && pillRef.current) {
      const buttonRect = plusButtonRef.current.getBoundingClientRect();
      const pillRect = pillRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 1024;

      const distToPillTop = Math.max(0, buttonRect.top - pillRect.top);
      setMenuSideOffset(Math.round(distToPillTop + 10));

      const distToPillLeft = Math.max(0, buttonRect.left - pillRect.left);
      setMenuAlignOffset(-Math.round(distToPillLeft));

      if (isMobile) {
        setMenuWidth(Math.round(pillRect.width));
      } else {
        setMenuWidth(undefined);
      }
    }
  }, []);

  useEffect(() => {
    updateMenuPosition();
  }, [prompt, isExpandedLayout, plusMenuOpen, updateMenuPosition]);

  useEffect(() => {
    if (!pillRef.current) return;
    const ro = new ResizeObserver(() => updateMenuPosition());
    ro.observe(pillRef.current);
    window.addEventListener("resize", updateMenuPosition);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateMenuPosition);
    };
  }, [updateMenuPosition]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleContinue();
    }
  };

  const renderPlusButton = () => (
    <DropdownMenu
      open={plusMenuOpen}
      onOpenChange={(open) => {
        if (open) updateMenuPosition();
        setPlusMenuOpen(open);
      }}
    >
      <Tooltip open={plusMenuOpen ? false : undefined}>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button
              ref={plusButtonRef}
              type="button"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary dark:hover:bg-[#2f2f2f] transition-colors shrink-0 cursor-pointer outline-none focus:outline-none"
              aria-label="Add files & more"
            >
              <Plus className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent className="text-md">Add files & more</TooltipContent>
      </Tooltip>
      <DropdownMenuContent
        side="top"
        align="start"
        sideOffset={menuSideOffset}
        alignOffset={menuAlignOffset}
        avoidCollisions={true}
        collisionPadding={12}
        className={cn(
          "rounded-2xl p-1.5 bg-white/50 dark:bg-[#212121]/50 backdrop-blur-sm border border-border/50 dark:border-neutral-700/50 select-none outline-none z-50",
          menuWidth ? "" : "w-[244px] max-w-[calc(100vw-24px)]"
        )}
        style={{
          width: menuWidth ? `${menuWidth}px` : undefined,
        }}
      >
        <PlusMenuContent onAddFiles={handleContinue} isOpen={plusMenuOpen} />
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderRightActions = () => (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            style={{ cursor: "not-allowed" }}
            className="flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-full text-[13px] sm:text-[14px] font-medium text-muted-foreground/50 opacity-60 cursor-not-allowed select-none bg-transparent hover:bg-transparent shrink-0"
            aria-label="Think mode (Coming soon)"
          >
            <Brain className="w-5 h-5 text-muted-foreground/50 pointer-events-none" />
            <span className="pointer-events-none hidden sm:inline">Think</span>
          </button>
        </TooltipTrigger>
        <TooltipContent className="text-md">Coming soon</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={toggleDictation}
            className={cn(
              "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0",
              isListening
                ? "bg-red-500/15 text-red-500 animate-pulse"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
            aria-label={isListening ? "Stop dictation" : "Dictate"}
          >
            <Mic className="w-5 h-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="text-md">
          {isListening ? "Listening..." : "Dictate"}
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={prompt.trim() ? handleContinue : undefined}
            disabled={!prompt.trim()}
            className={cn(
              "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shrink-0",
              prompt.trim()
                ? "bg-foreground text-background cursor-pointer hover:opacity-90 active:scale-95"
                : "bg-neutral-300 dark:bg-[#383838] text-muted-foreground/50 cursor-not-allowed opacity-50"
            )}
            aria-label="Continue chatting"
          >
            <ArrowUp className="w-5 h-5 stroke-[3]" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="text-md">Continue chatting</TooltipContent>
      </Tooltip>
    </>
  );

  return (
    <div className="relative w-full max-w-3xl mx-auto px-6 select-none shrink-0">
      <AnimatePresence>
        {showScrollBottom && (
          <div className="absolute bottom-full mb-3 inset-x-0 flex justify-center pointer-events-none z-30">
            <div className="pointer-events-auto">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={onScrollToBottom}
                    className="group w-10 h-10 rounded-full bg-white/50 dark:bg-[#212121]/50 backdrop-blur-sm border border-border/50 dark:border-neutral-700/50 text-neutral-700 dark:text-neutral-200 hover:text-foreground dark:hover:text-foreground hover:bg-background dark:hover:bg-background flex items-center justify-center transition-all cursor-pointer"
                    aria-label="Scroll to bottom"
                  >
                    <ArrowDown className="w-5 h-5 text-muted-foreground group-hover:text-foreground shrink-0" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={8} className="text-md">
                  Scroll to bottom
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}
      </AnimatePresence>

      <div
        ref={pillRef}
        className={cn(
          "relative bg-white/50 dark:bg-[#212121]/50 backdrop-blur-sm border border-border/50 dark:border-neutral-700/50 transition-all duration-200",
          "focus-within:bg-background dark:focus-within:bg-background focus-within:text-foreground dark:focus-within:text-foreground",
          "rounded-3xl",
          isExpandedLayout
            ? "p-3.5 sm:p-4"
            : "px-2 sm:px-3 py-1.5 min-h-[48px] sm:min-h-[52px] flex items-center"
        )}
      >
        {isExpandedLayout ? (
          <div className="flex flex-col w-full">
            <div className="w-full px-1.5 sm:px-2 pt-0.5 pb-1 relative">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => {
                  cursorPositionRef.current = e.target.selectionEnd;
                  setPrompt(e.target.value);
                  const el = e.target;
                  el.style.height = "auto";
                  const scrollH = el.scrollHeight;
                  const maxH = isFullyExpanded ? 460 : 200;
                  if (scrollH > maxH) {
                    el.style.height = `${maxH}px`;
                    el.style.overflowY = "auto";
                  } else {
                    el.style.height = `${Math.max(scrollH, 44)}px`;
                    el.style.overflowY = "hidden";
                  }
                }}
                onSelect={(e) => {
                  cursorPositionRef.current = e.currentTarget.selectionEnd;
                }}
                onClick={(e) => {
                  cursorPositionRef.current = e.currentTarget.selectionEnd;
                }}
                onKeyUp={(e) => {
                  cursorPositionRef.current = e.currentTarget.selectionEnd;
                }}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder="Continue chatting"
                rows={1}
                className={cn(
                  "w-full min-w-0 bg-transparent border-0 p-0 text-[16px] sm:text-[16.5px] text-foreground placeholder:text-muted-foreground focus:placeholder:text-foreground transition-colors focus:outline-none focus:ring-0 resize-none leading-relaxed",
                  isFullyExpanded ? "min-h-[280px]" : "min-h-[44px]",
                  isBigContent && "pr-14 sm:pr-16"
                )}
              />

              {isBigContent && (
                <div className="absolute top-0.5 right-6 sm:right-8 z-10">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setIsFullyExpanded((prev) => !prev)}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all shrink-0 cursor-pointer"
                        aria-label={isFullyExpanded ? "Collapse" : "Expand"}
                      >
                        {isFullyExpanded ? (
                          <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="text-md">
                      {isFullyExpanded ? "Collapse" : "Expand"}
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between w-full pt-1">
              <div className="flex items-center pl-0.5">
                {renderPlusButton()}
              </div>

              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 pr-0.5">
                {renderRightActions()}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1 sm:gap-2 w-full">
            <div className="flex items-center shrink-0 pl-0.5 sm:pl-1">
              {renderPlusButton()}
            </div>

            <div className="flex-1 min-w-0 flex items-center">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => {
                  cursorPositionRef.current = e.target.selectionEnd;
                  setPrompt(e.target.value);
                  const el = e.target;
                  el.style.height = "auto";
                  const scrollH = el.scrollHeight;
                  if (scrollH > 38 || e.target.value.includes("\n")) {
                    setIsMultiLine(true);
                  }
                }}
                onSelect={(e) => {
                  cursorPositionRef.current = e.currentTarget.selectionEnd;
                }}
                onClick={(e) => {
                  cursorPositionRef.current = e.currentTarget.selectionEnd;
                }}
                onKeyUp={(e) => {
                  cursorPositionRef.current = e.currentTarget.selectionEnd;
                }}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder="Continue chatting"
                rows={1}
                className="w-full min-w-0 bg-transparent border-0 p-0 text-[16px] sm:text-[16.5px] text-foreground placeholder:text-muted-foreground focus:placeholder:text-foreground transition-colors focus:outline-none focus:ring-0 resize-none leading-normal h-[26px] overflow-hidden"
              />
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {renderRightActions()}
            </div>
          </div>
        )}
      </div>
      <p className="text-[13px] text-center sm:text-base text-muted-foreground font-normal tracking-tight leading-tight mt-2 select-none">
        CloseAI can make mistakes. Verify important info.
      </p>
    </div>
  );
}

export default function PublicSharedChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params?.id as string;

  const [chatTitle, setChatTitle] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 80;
    setShowScrollBottom(isScrolledUp);
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
      });
    }
  };

  // A shared conversation should open at the newest message after a reload.
  // Repeat across layout/asset settling so long markdown and images cannot
  // leave the reader stranded above the actual bottom.
  useEffect(() => {
    if (isLoading || isError || messages.length === 0) return;
    const scroll = () => scrollToBottom();
    scroll();
    const frames = [requestAnimationFrame(scroll), requestAnimationFrame(() => requestAnimationFrame(scroll))];
    const timers = [window.setTimeout(scroll, 80), window.setTimeout(scroll, 250), window.setTimeout(scroll, 600)];
    return () => {
      frames.forEach(cancelAnimationFrame);
      timers.forEach(clearTimeout);
    };
  }, [isLoading, isError, messages.length]);

  useEffect(() => {
    if (!chatId) return;

    const fetchSharedChat = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        let loadedMessages: Message[] = [];
        let loadedTitle = "";

        try {
          const details = await chatService.getChatDetails(supabase, chatId);
          if (details && details.messages && details.messages.length > 0) {
            loadedTitle = details.title;
            loadedMessages = details.messages;
          }
        } catch (e) {
          // Ignore RLS error for non-owner public shared users
        }

        if (loadedMessages.length === 0) {
          const res = await fetch(`/api/share/${chatId}`);
          if (res.ok) {
            const data = await res.json();
            loadedTitle = data.chat?.title || "";
            loadedMessages = data.messages || [];
          }
        }

        if (loadedMessages.length === 0) {
          throw new Error("Chat not found");
        }

        setChatTitle(loadedTitle);
        setMessages(loadedMessages);
      } catch (err) {
        console.error("Error loading chat:", err);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedChat();
  }, [chatId]);

  const handleShareClick = async () => {
    setIsSharing(true);
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Public link copied to your clipboard", {
        description: "Anyone with this link can see this conversation",
      });
    } catch (e) {
      toast.error("Failed to copy link");
    } finally {
      setTimeout(() => setIsSharing(false), 300);
    }
  };

  // Extract full user prompt text if available to prevent truncated trailing "..." from DB titles
  const firstUserMsg = messages.find((m) => m.role === "user")?.content?.trim();
  const displayTitle = (firstUserMsg || chatTitle)
    .replace(/(\.\.\.|\u2026)\s*$/, "")
    .trim();
  const cleanTitle = displayTitle.replace(/\s+/g, " ").trim();

  useEffect(() => {
    if (cleanTitle) {
      document.title = `CloseAI \u2014 ${cleanTitle}`;
    } else {
      document.title = "CloseAI";
    }
    return () => {
      document.title = "CloseAI";
    };
  }, [cleanTitle]);

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-background text-foreground overflow-hidden relative">
      <title>{cleanTitle ? `CloseAI \u2014 ${cleanTitle}` : "CloseAI"}</title>

      {/* Transparent Floating Header - Buttons float cleanly on top, matching c/[id] exactly */}
      <header className="absolute top-0 left-0 right-0 z-30 h-14 pt-[env(safe-area-inset-top,0px)] px-3 sm:px-4 flex items-center justify-between select-none pointer-events-none bg-transparent">
        <div className="absolute top-0 left-0 right-4 sm:right-5 h-16 pointer-events-none bg-gradient-to-b from-background via-background/90 to-transparent -z-10" />
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 pointer-events-auto ml-3 mt-3 mr-3 sm:ml-0.5">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-85 transition-opacity shrink-0"
          >
            <CloseAIIcon size={26} />
          </Link>
          <Separator
            orientation="vertical"
            className="h-4 bg-border mx-0.5 sm:mx-1 shrink-0"
          />
          <SharedHeaderTitleMarquee
            title={displayTitle}
            isLoading={isLoading}
            chatId={chatId}
          />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto mt-3 pr-3 sm:pr-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                disabled={isSharing}
                onClick={handleShareClick}
                className="group h-9 px-2.5 sm:px-3 gap-1.5 rounded-xl bg-white/50 dark:bg-[#212121]/50 backdrop-blur-sm border border-border/50 dark:border-neutral-700/50 text-neutral-700 dark:text-neutral-200 hover:text-foreground dark:hover:text-foreground hover:bg-background dark:hover:bg-background flex items-center justify-center text-base font-medium transition-colors cursor-pointer outline-none focus:outline-none disabled:opacity-70 disabled:pointer-events-auto disabled:cursor-not-allowed"
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

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => window.open("/c", "_blank")}
                className="group w-9 h-9 rounded-xl bg-white/50 dark:bg-[#212121]/50 backdrop-blur-sm border border-border/50 dark:border-neutral-700/50 text-neutral-700 dark:text-neutral-200 hover:text-foreground dark:hover:text-foreground hover:bg-background dark:hover:bg-background flex items-center justify-center transition-colors cursor-pointer outline-none focus:outline-none"
                aria-label="New chat"
              >
                <Plus className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              align="end"
              sideOffset={6}
              className="text-md"
            >
              New chat
            </TooltipContent>
          </Tooltip>
        </div>
      </header>

      {/* Full-Height Scrollable Content Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 w-full overflow-x-hidden relative no-overscroll flex flex-col pt-14 overflow-y-scroll [scrollbar-gutter:stable] scroll-smooth"
      >
        {/* Message Stream & Content */}
        <div className="flex-1 flex flex-col min-h-full items-center">
          {isError ? (
            <div className="flex-1 w-full flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground text-xl">
                ?
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">
                  Conversation not found
                </h2>
                <p className="text-sm text-muted-foreground max-w-sm">
                  This shared link may have been deleted or is unavailable.
                </p>
              </div>
              <Button
                onClick={() => router.push("/c")}
                className="rounded-xl cursor-pointer"
              >
                Start new chat
              </Button>
            </div>
          ) : (
            <>
              {isLoading ? (
                <div className="flex-1 w-full h-full flex flex-col items-center justify-center pb-16 text-muted-foreground">
                  <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="w-full max-w-4xl flex-1 pb-4 sm:pb-6">
                  <MessageList
                    messages={messages}
                    user={null}
                    isTyping={false}
                    pendingMessage={null}
                    showMessageActions={false}
                  />
                </div>
              )}

              {/* Floating Input Dock inside scroll container */}
              <div className="sticky bottom-0 left-0 right-0 z-20 pointer-events-none pb-[max(env(safe-area-inset-bottom,0px),0.5rem)] bg-gradient-to-t from-background via-background/90 to-transparent pt-4 mt-auto w-full">
                <div className="pointer-events-auto">
                  <SharedChatInputPill
                    chatId={chatId}
                    showScrollBottom={showScrollBottom}
                    onScrollToBottom={scrollToBottom}
                  />
                </div>
              </div>
            </>
          )}
        </div>
        {/* TOC Navigator — Table of Contents on Desktop */}
        <TocNavigator messages={messages} containerRef={scrollContainerRef} />
      </div>
    </div>
  );
}

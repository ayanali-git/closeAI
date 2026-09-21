"use client";

import React, { useState, useRef, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Chat } from "@/lib/chat-service";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/components/subscription-provider";
import { CloseAIIcon } from "@/components/brand/logo";
import {
  Plus,
  Search,
  Trash2,
  Pin,
  PinOff,
  Settings,
  LogOut,
  PanelLeft,
  PanelRight,
  Sparkles,
  Sun,
  Moon,
  Laptop,
  Check,
  User as UserIcon,
  HelpCircle,
  Clock,
  PenLine,
  ArrowDownCircle,
  Command,
  FileText,
  Info,
  Bug,
  LifeBuoy,
  ChevronRight,
  ChevronLeft,
  Archive,
  ArchiveX,
  Download,
  ArrowUpRight,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  AnimatedChevron,
  AnimatedSearchClose,
} from "@/components/ui/animated";
import { LogoutModal } from "@/components/modals/log-out-modal";
import { DeleteModal } from "@/components/modals/delete-chat-modal";
import toast from "@/lib/toast";

interface SidebarProps {
  user: User | null;
  chats: Chat[];
  currentChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onToggleStar: (chatId: string, starred: boolean) => void;
  onToggleArchive?: (chatId: string, archived: boolean) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  isLoading?: boolean;
}

/**
 * Auto-scrolling title on hover
 */
function ChatTitleMarquee({
  title,
  isHovered,
  isSelected,
}: {
  title: string;
  isHovered: boolean;
  isSelected: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflowWidth, setOverflowWidth] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (textRef.current && containerRef.current) {
        const isMobile = typeof window !== "undefined" && window.innerWidth < 1025;
        const actionSpace = isMobile ? 0 : 70;

        const diff =
          textRef.current.scrollWidth -
          containerRef.current.clientWidth +
          actionSpace;

        setOverflowWidth(Math.max(diff, 0));
      }
    };

    measure();

    window.addEventListener("resize", measure);

    return () => {
      window.removeEventListener("resize", measure);
    };
  }, [title]);

  const isScrolling = overflowWidth > 0 && isHovered;

  const duration = Math.max(3.2, (overflowWidth / 35) + 1.8);

  return (
    <div
      ref={containerRef}
      className="relative flex-1 min-w-0 overflow-hidden pr-1 max-[1025px]:mr-[78px]"
      style={{
        maskImage:
          overflowWidth > 0
            ? isScrolling
              ? "linear-gradient(to right, transparent 0%, black 5px, black calc(100% - 5px), transparent 100%)"
              : "linear-gradient(to right, black 0%, black calc(100% - 8px), transparent 100%)"
            : "none",

        WebkitMaskImage:
          overflowWidth > 0
            ? isScrolling
              ? "linear-gradient(to right, transparent 0%, black 5px, black calc(100% - 5px), transparent 100%)"
              : "linear-gradient(to right, black 0%, black calc(100% - 8px), transparent 100%)"
            : "none",
      }}
    >
      {/* Chat title */}
      <span
        ref={textRef}
        style={{
          '--marquee-dist': `${overflowWidth + 10}px`,
          animation: isScrolling
            ? `chat-title-marquee ${duration}s ease-in-out infinite`
            : "none",
          transform: isScrolling ? undefined : "translateX(0px)",
          transition: isScrolling ? "none" : "transform 0.25s ease-out",
        } as React.CSSProperties}
        className="inline-block whitespace-nowrap text-[15px] leading-snug select-none will-change-transform"
      >
        {title || "New chat"}
      </span>
    </div>
  );
}

const groupChats = (chats: Chat[]) => {
  const groups: Record<string, Chat[]> = {
    Pinned: [],
    Archived: [],
    Chats: [],
  };

  chats.forEach((chat) => {
    if (chat.starred) {
      groups["Pinned"].push(chat);
      return;
    }

    if (chat.archived) {
      groups["Archived"].push(chat);
      return;
    }

    groups["Chats"].push(chat);
  });

  return groups;
};

export function Sidebar({
  user,
  chats,
  currentChatId,
  onChatSelect,
  onNewChat,
  onDeleteChat,
  onToggleStar,
  onToggleArchive,
  searchQuery,
  onSearchChange,
  isOpen,
  onToggle,
  isLoading = false,
}: SidebarProps) {
  const { signOut } = useAuth();
  const { plan: userPlan } = useSubscription();
  const { theme, setTheme } = useTheme();
  const [showSearch, setShowSearch] = useState(false);
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
  const [pressedChatId, setPressedChatId] = useState<string | null>(null);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isCloseBtnHovered, setIsCloseBtnHovered] = useState(false);

  useEffect(() => {
    setIsLogoHovered(false);
    setIsCloseBtnHovered(false);
    if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [isOpen]);

  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({});
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null);

  // Close sidebar drawer on Escape key (matching FilesDrawer behavior)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showLogoutModal || chatToDelete) return;
        onToggle();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, showLogoutModal, chatToDelete, onToggle]);

  const toggleSection = (group: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  const filteredChats = chats.filter((chat) =>
    chat.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedChats = groupChats(filteredChats);
  const displayName =
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";
  const planDisplay =
    userPlan === "ultra" ? "Ultra Pro" : userPlan === "pro" ? "Pro" : "Free";
  const userEmail = user?.email || (user ? "" : "Not signed in");
  const avatarUrl =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  const [accountSubView, setAccountSubView] = useState<
    "main" | "theme" | "help" | "accounts"
  >("main");
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobileScreen(window.innerWidth <= 1025);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /**
   * Account Popover Menu Items (Responsive: Flyout on Desktop, In-Place on Mobile)
   */
  const renderAccountMenuItems = () => {
    // Mobile In-Place Subviews
    if (isMobileScreen && accountSubView === "theme") {
      return (
        <div className="space-y-1 p-0.5">
          <button
            type="button"
            onClick={(e) => {
              (e.currentTarget as HTMLElement)?.blur();
              setAccountSubView("main");
            }}
            className="flex items-center gap-2 px-2 py-2 text-md font-medium text-foreground [@media(hover:hover)]:hover:bg-secondary active:bg-secondary/80 rounded-xl cursor-pointer w-full text-left transition-colors outline-none focus:outline-none focus:bg-transparent focus-visible:outline-none"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Theme</span>
          </button>
          <div className="h-[1px] bg-neutral-200 dark:bg-[#383838] my-1" />
          {[
            { label: "Light", value: "light", icon: Sun },
            { label: "Dark", value: "dark", icon: Moon },
            { label: "System", value: "system", icon: Laptop },
          ].map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={(e) => {
                (e.currentTarget as HTMLElement)?.blur();
                setTheme(t.value);
              }}
              className="w-full flex items-center justify-between px-2 py-2 rounded-xl text-md text-foreground [@media(hover:hover)]:hover:bg-secondary active:bg-secondary/80 cursor-pointer transition-colors outline-none focus:outline-none focus:bg-transparent focus-visible:outline-none text-left"
            >
              <div className="flex items-center gap-2.5">
                <t.icon className="w-4 h-4 text-muted-foreground" />
                <span>{t.label}</span>
              </div>
              {theme === t.value && (
                <Check className="w-4 h-4 text-foreground" />
              )}
            </button>
          ))}
        </div>
      );
    }

    if (isMobileScreen && accountSubView === "help") {
      return (
        <div className="space-y-1 p-0.5">
          <button
            type="button"
            onClick={(e) => {
              (e.currentTarget as HTMLElement)?.blur();
              setAccountSubView("main");
            }}
            className="flex items-center gap-2 px-2 py-2 text-md font-medium text-foreground [@media(hover:hover)]:hover:bg-secondary active:bg-secondary/80 rounded-xl cursor-pointer w-full text-left transition-colors outline-none focus:outline-none focus:bg-transparent focus-visible:outline-none"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Help</span>
          </button>
          <div className="h-[1px] bg-neutral-200 dark:bg-[#383838] my-1" />
          <Link
            href="/support/help"
            className="flex items-center gap-2.5 px-2 py-2 rounded-xl text-md text-foreground [@media(hover:hover)]:hover:bg-secondary active:bg-secondary/80 transition-colors outline-none focus:outline-none focus:bg-transparent focus-visible:outline-none"
          >
            <HelpCircle className="w-4 h-4 text-muted-foreground" />
            <span>Help center</span>
          </Link>
          <Link
            href="/company/blog"
            className="flex items-center gap-2.5 px-2 py-2 rounded-xl text-md text-foreground [@media(hover:hover)]:hover:bg-secondary active:bg-secondary/80 transition-colors outline-none focus:outline-none focus:bg-transparent focus-visible:outline-none"
          >
            <PenLine className="w-4 h-4 text-muted-foreground" />
            <span>Release notes</span>
          </Link>
          <button
            type="button"
            onClick={() => toast.info("CloseAI app coming soon")}
            className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-md font-medium transition-colors outline-none focus:outline-none focus:bg-transparent focus-visible:outline-none whitespace-nowrap text-left cursor-pointer select-none text-foreground [@media(hover:hover)]:hover:bg-secondary dark:[@media(hover:hover)]:hover:bg-[#2f2f2f]"
          >
            <Download className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>Download app</span>
          </button>
          <Link
            href="/settings"
            className="flex items-center gap-2.5 px-2 py-2 rounded-xl text-md text-foreground [@media(hover:hover)]:hover:bg-secondary active:bg-secondary/80 transition-colors outline-none focus:outline-none focus:bg-transparent focus-visible:outline-none"
          >
            <Command className="w-4 h-4 text-muted-foreground" />
            <span>Keyboard shortcuts</span>
          </Link>
          <div className="h-[1px] bg-neutral-200 dark:bg-[#383838] my-1" />
          <Link
            href="/support/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between px-2 py-2 rounded-xl text-md text-foreground [@media(hover:hover)]:hover:bg-secondary active:bg-secondary/80 transition-colors outline-none focus:outline-none focus:bg-transparent focus-visible:outline-none"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
              <span>Terms of Use</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0 ml-auto transition-opacity duration-150 opacity-100 min-[1025px]:opacity-0 min-[1025px]:group-hover:opacity-100" />
          </Link>
          <Link
            href="/support/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between px-2 py-2 rounded-xl text-md text-foreground [@media(hover:hover)]:hover:bg-secondary active:bg-secondary/80 transition-colors outline-none focus:outline-none focus:bg-transparent focus-visible:outline-none"
          >
            <div className="flex items-center gap-2.5">
              <Info className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
              <span>Privacy Policy</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0 ml-auto transition-opacity duration-150 opacity-100 min-[1025px]:opacity-0 min-[1025px]:group-hover:opacity-100" />
          </Link>
          <Link
            href="/company/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between px-2 py-2 rounded-xl text-md text-foreground [@media(hover:hover)]:hover:bg-secondary active:bg-secondary/80 transition-colors outline-none focus:outline-none focus:bg-transparent focus-visible:outline-none"
          >
            <div className="flex items-center gap-2.5">
              <Bug className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
              <span>Report a bug</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0 ml-auto transition-opacity duration-150 opacity-100 min-[1025px]:opacity-0 min-[1025px]:group-hover:opacity-100" />
          </Link>
        </div>
      );
    }

    if (isMobileScreen && accountSubView === "accounts") {
      return (
        <div className="space-y-1 p-0.5">
          <button
            type="button"
            onClick={(e) => {
              (e.currentTarget as HTMLElement)?.blur();
              setAccountSubView("main");
            }}
            className="flex items-center gap-2 px-2 py-2 text-md font-medium text-foreground [@media(hover:hover)]:hover:bg-secondary active:bg-secondary/80 rounded-xl cursor-pointer w-full text-left transition-colors outline-none focus:outline-none focus:bg-transparent focus-visible:outline-none"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Accounts</span>
          </button>
          <div className="h-[1px] bg-neutral-200 dark:bg-[#383838] my-1" />
          <div className="flex items-center gap-2 px-2 py-1.5 text-base text-muted-foreground hover:text-foreground select-none">
            <UserIcon className="w-4 h-4 shrink-0" />
            <span className="truncate">{userEmail}</span>
          </div>
          <div className="flex items-center justify-between px-2 py-2 rounded-xl bg-secondary/50">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="w-8 h-8 rounded-full border border-border shrink-0">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-[14px] font-semibold">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-md font-medium truncate">
                {displayName}
              </span>
            </div>
            <Check className="w-4 h-4 text-foreground shrink-0 ml-2" />
          </div>
          <div className="h-[1px] bg-neutral-200 dark:bg-[#383838] my-1" />
          <Link
            href="/auth/login"
            className="flex items-center gap-2.5 px-2 py-2 rounded-xl text-md text-foreground [@media(hover:hover)]:hover:bg-secondary active:bg-secondary/80 transition-colors outline-none focus:outline-none focus:bg-transparent focus-visible:outline-none"
          >
            <Plus className="w-4 h-4 text-muted-foreground" />
            <span>Add account</span>
          </Link>
        </div>
      );
    }

    // Default Main View (Desktop uses DropdownMenuSub, Mobile uses Clickable Rows)
    return (
      <div className="space-y-0.5 p-0.5">
        {/* Account Info Button */}
        {isMobileScreen ? (
          <button
            type="button"
            onClick={(e) => {
              (e.currentTarget as HTMLElement)?.blur();
              setAccountSubView("accounts");
            }}
            className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl [@media(hover:hover)]:hover:bg-secondary active:bg-secondary/80 text-left transition-colors cursor-pointer outline-none focus:outline-none focus:bg-transparent focus-visible:outline-none"
          >
            <Avatar className="w-8 h-8 rounded-full border border-border shrink-0">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="text-md font-semibold bg-secondary text-foreground">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-md font-medium truncate text-foreground leading-tight">
                {displayName}
              </p>
              <p className="text-sm text-muted-foreground leading-tight">
                {planDisplay}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto shrink-0" />
          </button>
        ) : (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2.5 px-2 py-2 text-md rounded-xl cursor-pointer">
              <Avatar className="w-8 h-8 rounded-full border border-border shrink-0">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-md font-semibold bg-secondary text-foreground">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-md font-medium truncate text-foreground leading-tight">
                  {displayName}
                </p>
                <p className="text-sm text-muted-foreground leading-tight">
                  {planDisplay}
                </p>
              </div>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent
              sideOffset={2}
              alignOffset={-97}
              className="w-64 rounded-2xl p-1.5 bg-white/50 dark:bg-[#212121]/50 backdrop-blur-sm border border-border/80 dark:border-none"
            >
              <div className="flex items-center gap-2 px-2 py-2 text-md text-muted-foreground hover:text-foreground select-none">
                <UserIcon className="w-4 h-4 shrink-0" />
                <span className="truncate">{userEmail}</span>
              </div>
              <DropdownMenuItem className="flex items-center justify-between px-2 py-2 rounded-xl cursor-pointer">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="w-8 h-8 rounded-full border border-border shrink-0">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="text-[14px] font-semibold">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-md font-medium truncate">
                    {displayName}
                  </span>
                </div>
                <Check className="w-4 h-4 text-foreground shrink-0 ml-2" />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/auth/login"
                  className="flex items-center gap-2.5 px-2 py-2 cursor-pointer rounded-xl text-md"
                >
                  <Plus className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                  <span>Add account</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}

        <div className="h-[1px] bg-neutral-200 dark:bg-[#383838] my-1 -mx-1.5" />

        {/* Upgrade plan */}
        <DropdownMenuItem asChild>
          <Link
            href="/upgrade"
            className="flex items-center gap-2.5 px-2 py-2 rounded-xl text-md cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
            <span>
              {userPlan && userPlan !== "free" ? "Manage plan" : "Upgrade plan"}
            </span>
          </Link>
        </DropdownMenuItem>

        {/* Personalization */}
        <DropdownMenuItem asChild>
          <Link
            href="/settings"
            className="flex items-center gap-2.5 px-2 py-2 rounded-xl text-md cursor-pointer"
          >
            <Clock className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
            <span>Personalization</span>
          </Link>
        </DropdownMenuItem>

        {/* Profile */}
        <DropdownMenuItem asChild>
          <Link
            href="/settings"
            className="flex items-center gap-2.5 px-2 py-2 rounded-xl text-md cursor-pointer"
          >
            <UserIcon className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>

        {/* Settings */}
        <DropdownMenuItem asChild>
          <Link
            href="/settings"
            className="flex items-center gap-2.5 px-2 py-2 rounded-xl text-md cursor-pointer"
          >
            <Settings className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>

        <div className="h-[1px] bg-neutral-200 dark:bg-[#383838] my-1 -mx-1.5" />

        {/* Theme Button / Dropdown */}
        {isMobileScreen ? (
          <button
            type="button"
            onClick={(e) => {
              (e.currentTarget as HTMLElement)?.blur();
              setAccountSubView("theme");
            }}
            className="w-full flex items-center justify-between px-2 py-2 rounded-xl text-md text-foreground [@media(hover:hover)]:hover:bg-secondary active:bg-secondary/80 transition-colors cursor-pointer outline-none focus:outline-none focus:bg-transparent focus-visible:outline-none"
          >
            <div className="flex items-center gap-2.5">
              <Sun className="w-4 h-4 dark:hidden text-muted-foreground" />
              <Moon className="w-4 h-4 hidden dark:block text-muted-foreground" />
              <span>Theme</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ) : (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2.5 px-2 py-2 text-md rounded-xl cursor-pointer">
              <Sun className="w-4 h-4 dark:hidden text-muted-foreground group-hover:text-foreground" />
              <Moon className="w-4 h-4 hidden dark:block text-muted-foreground group-hover:text-foreground" />
              <span>Theme</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent
              sideOffset={2}
              alignOffset={-89}
              className="w-40 rounded-2xl p-1.5 bg-white/50 dark:bg-[#212121]/50 backdrop-blur-sm border border-border/80 dark:border-none"
            >
              <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                <DropdownMenuRadioItem value="light">
                  Light
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system">
                  System
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}

        {/* Help Button / Dropdown */}
        {isMobileScreen ? (
          <button
            type="button"
            onClick={(e) => {
              (e.currentTarget as HTMLElement)?.blur();
              setAccountSubView("help");
            }}
            className="w-full flex items-center justify-between px-2 py-2 rounded-xl text-md text-foreground [@media(hover:hover)]:hover:bg-secondary active:bg-secondary/80 transition-colors cursor-pointer outline-none focus:outline-none focus:bg-transparent focus-visible:outline-none"
          >
            <div className="flex items-center gap-2.5">
              <LifeBuoy className="w-4 h-4 text-muted-foreground" />
              <span>Help</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ) : (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2.5 px-2 py-2 text-md rounded-xl cursor-pointer">
              <LifeBuoy className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
              <span>Help</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent
              sideOffset={2}
              alignOffset={-261}
              className="w-56 rounded-2xl p-1.5 bg-white/50 dark:bg-[#212121]/50 backdrop-blur-sm border border-border/80 dark:border-none"
            >
              <DropdownMenuItem asChild>
                <Link
                  href="/support/help"
                  className="flex items-center gap-2.5 px-2 py-2 cursor-pointer rounded-xl text-md"
                >
                  <HelpCircle className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                  <span>Help center</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/company/blog"
                  className="flex items-center gap-2.5 px-2 py-2 cursor-pointer rounded-xl text-md"
                >
                  <PenLine className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                  <span>Release notes</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  toast.info("CloseAI app coming soon");
                }}
                className="flex items-center gap-2.5 px-2 py-2 rounded-xl text-md font-medium transition-colors outline-none focus:outline-none focus:bg-transparent focus-visible:outline-none whitespace-nowrap text-left cursor-pointer select-none text-foreground [@media(hover:hover)]:hover:bg-secondary dark:[@media(hover:hover)]:hover:bg-[#2f2f2f]"
              >
                <Download className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>Download app</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/settings"
                  className="flex items-center gap-2.5 px-2 py-2 cursor-pointer rounded-xl text-md"
                >
                  <Command className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                  <span>Keyboard shortcuts</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/support/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between px-2 py-2 cursor-pointer rounded-xl text-md text-foreground"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                    <span>Terms of Use</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0 ml-auto transition-opacity duration-150 opacity-100 min-[1025px]:opacity-0 min-[1025px]:group-hover:opacity-100" />
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/support/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between px-2 py-2 cursor-pointer rounded-xl text-md text-foreground"
                >
                  <div className="flex items-center gap-2.5">
                    <Info className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                    <span>Privacy Policy</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0 ml-auto transition-opacity duration-150 opacity-100 min-[1025px]:opacity-0 min-[1025px]:group-hover:opacity-100" />
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/company/contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between px-2 py-2 cursor-pointer rounded-xl text-md text-foreground"
                >
                  <div className="flex items-center gap-2.5">
                    <Bug className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                    <span>Report a bug</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0 ml-auto transition-opacity duration-150 opacity-100 min-[1025px]:opacity-0 min-[1025px]:group-hover:opacity-100" />
                </Link>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}

        <div className="h-[1px] bg-neutral-200 dark:bg-[#383838] my-1 -mx-1.5" />

        {/* Log out */}
        <DropdownMenuItem
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center gap-2.5 px-2 py-2 cursor-pointer rounded-xl"
        >
          <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
          <span>Log out</span>
        </DropdownMenuItem>
      </div>
    );
  };

  const renderChatItem = (chat: Chat) => {
    const isHovered = hoveredChatId === chat.id;
    const isPressed = pressedChatId === chat.id;
    const isSelected = currentChatId === chat.id;
    const isHighlighted = isSelected || isHovered || isPressed;

    return (
      <div
        key={chat.id}
        onClick={() => {
          onChatSelect(chat.id);
          if (typeof window !== "undefined" && window.innerWidth < 1025) {
            onToggle();
          }
        }}
        onMouseEnter={() => setHoveredChatId(chat.id)}
        onMouseLeave={() => {
          setHoveredChatId(null);
          setPressedChatId(null);
        }}
        onTouchStart={() => setPressedChatId(chat.id)}
        onTouchEnd={() => setPressedChatId(null)}
        onTouchCancel={() => setPressedChatId(null)}
        className={cn(
          "group relative flex items-center justify-between px-2 py-2 rounded-xl text-md cursor-pointer transition-all duration-150",
          isSelected
            ? "bg-secondary text-foreground"
            : cn(
                "text-muted-foreground hover:bg-secondary active:bg-secondary",
                isPressed && "bg-secondary"
              )
        )}
      >
        {/* Title with Smooth Marquee on Hover */}
        <ChatTitleMarquee
          title={chat.title || "New chat"}
          isHovered={isHovered}
          isSelected={isSelected}
        />

        {/* Status indicators when not hovered (hidden on mobile where action buttons are always visible) */}
        {chat.starred && !isHovered && (
          <PinOff className="w-4 h-4 text-muted-foreground shrink-0 ml-1.5 max-[1025px]:hidden" />
        )}
        {chat.archived && !chat.starred && !isHovered && (
          <ArchiveX className="w-4 h-4 text-muted-foreground shrink-0 ml-1.5 max-[1025px]:hidden" />
        )}

        {/* Actions */}
        <div
          className={cn(
            "absolute right-2 inset-y-0 flex items-center gap-0.5 z-10 pointer-events-none",
            // Desktop (>= 1025px): full-height smooth gradient fade matching hover box
            "min-[1025px]:right-0 min-[1025px]:pl-12 min-[1025px]:pr-2 min-[1025px]:rounded-r-xl",
            "min-[1025px]:bg-gradient-to-l min-[1025px]:from-secondary min-[1025px]:via-secondary min-[1025px]:to-transparent",
            // Small screens (< 1025px): completely transparent, no gradient box, seamless with hover box!
            "max-[1025px]:bg-transparent max-[1025px]:bg-none max-[1025px]:opacity-100",
            // Desktop visibility: shown on hover or when selected
            isSelected
              ? "opacity-100"
              : "min-[1025px]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStar(chat.id, !chat.starred);
                }}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer pointer-events-auto"
              >
                {chat.starred ? (
                  <PinOff className="w-4 h-4 text-foreground" />
                ) : (
                  <Pin className="w-4 h-4" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent className="text-md">
              {chat.starred ? "Unpin" : "Pin"}
            </TooltipContent>
          </Tooltip>

          {onToggleArchive && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleArchive(chat.id, !chat.archived);
                  }}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer pointer-events-auto"
                >
                  {chat.archived ? (
                    <ArchiveX className="w-4 h-4" />
                  ) : (
                    <Archive className="w-4 h-4" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent className="text-md">
                {chat.archived ? "Unarchive" : "Archive"}
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setChatToDelete(chat);
                }}
                className="p-1 rounded-md text-muted-foreground hover:text-red-500 transition-colors cursor-pointer pointer-events-auto"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="text-md">Delete</TooltipContent>
          </Tooltip>
        </div>
      </div>
    );
  };

  const renderAvatarContent = () => (
    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-secondary flex items-center justify-center select-none">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={displayName}
          className="w-full h-full object-cover select-none"
          loading="eager"
          decoding="sync"
        />
      ) : (
        <span className="text-md font-semibold text-foreground select-none">
          {displayName.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );

  // ----------------------------------------------------
  // Both Sidebar variants (Collapsed Rail + Expanded) are rendered from this
  // single return so the Logout/Delete modals always mount, regardless of
  // whether the sidebar itself is open or collapsed to the 60px rail.
  // Previously the modals lived only after the expanded <aside>, so opening
  // them from the collapsed rail's dropdown set state with nothing mounted
  // to render it.
  // ----------------------------------------------------
  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-sidebar/50 xl:hidden"
          onClick={onToggle}
        />
      )}

      {/* Main Sidebar (Expands smoothly from 50px to 250px on Desktop, slides over on Mobile) */}
      <aside
        className={cn(
          "h-[100dvh] max-h-[100dvh] bg-sidebar border-r border-border/80 flex flex-col shrink-0 select-none overflow-hidden relative group/sidebar",
          "transition-[width] duration-300 ease-in-out will-change-[width]",
          isOpen
            ? "fixed xl:relative inset-y-0 left-0 z-50 xl:z-20 w-full sm:w-[250px] animate-in slide-in-from-left-full xl:animate-none"
            : "hidden xl:flex xl:relative xl:w-[50px]"
        )}
      >
        {/* Full-height border resize/toggle handle */}
        <div
          onClick={onToggle}
          style={{ cursor: "ew-resize" }}
          className="absolute -right-[3px] top-0 bottom-0 w-[6px] z-30 hover:bg-foreground/15 transition-colors cursor-ew-resize"
        />

        {/* Middle Navigation & Chats Area */}
        <div className="flex-1 min-h-0 relative overflow-hidden">
          {/* Collapsed Rail Body (50px) */}
          <div
            className={cn(
              "w-[50px] h-full flex flex-col items-center shrink-0 absolute top-0 left-0 transition-opacity duration-200 z-10",
              !isOpen
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            )}
            aria-hidden={isOpen}
            onMouseLeave={() => setIsLogoHovered(false)}
          >
            <div className="flex flex-col items-center gap-2 pt-3.5 relative z-20">
              {/* Brand Emblem / Expand (Open Sidebar Button) */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={(e) => {
                      (e.currentTarget as HTMLElement)?.blur();
                      setIsLogoHovered(false);
                      onToggle();
                    }}
                    onMouseEnter={() => setIsLogoHovered(true)}
                    onMouseLeave={() => setIsLogoHovered(false)}
                    onBlur={() => setIsLogoHovered(false)}
                    style={{ cursor: "ew-resize" }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-foreground hover:bg-secondary transition-colors !cursor-ew-resize [&_*]:!cursor-ew-resize"
                    aria-label="Open sidebar"
                  >
                    {isLogoHovered ? (
                      <PanelRight className="w-4 h-4 text-foreground pointer-events-none" />
                    ) : (
                      <CloseAIIcon size={26} className="pointer-events-none" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8} className="text-md">
                  Open sidebar
                </TooltipContent>
              </Tooltip>

              {/* Search */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      onToggle();
                      setShowSearch(true);
                    }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                    aria-label="Search chats"
                  >
                    <AnimatedSearchClose open={showSearch} size={18} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-md">
                  Search chats
                </TooltipContent>
              </Tooltip>

              {/* New Chat */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      onNewChat();
                      if (
                        typeof window !== "undefined" &&
                        window.innerWidth < 1025
                      ) {
                        onToggle();
                      }
                    }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                    aria-label="New chat"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-md">
                  New chat
                </TooltipContent>
              </Tooltip>

              {/* Pinned Shortcut */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onToggle}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                    aria-label="Pinned chats"
                  >
                    <Pin className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-md">
                  Pinned chats
                </TooltipContent>
              </Tooltip>

              {/* Archived Shortcut */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onToggle}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                    aria-label="Archived chats"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-md">
                  Archived chats
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Expanded Sidebar View (250px) */}
          <div
            className={cn(
              "w-full sm:w-[250px] h-full flex flex-col shrink-0 absolute top-0 left-0 transition-opacity duration-200 z-10",
              isOpen
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            )}
            aria-hidden={!isOpen}
          >
          {/* Top Header */}
          <div className="p-3 pb-2 pt-[max(env(safe-area-inset-top),0.75rem)] flex items-center justify-between relative z-20">
              <Link
                href="/"
                className="flex items-center gap-2 px-1 hover:opacity-85 transition-opacity"
              >
                <span className="font-semibold text-xl tracking-tight text-foreground">
                  CloseAI
                </span>
              </Link>

              <div className="flex items-center gap-0.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
                      onClick={() => setShowSearch(!showSearch)}
                    >
                      <AnimatedSearchClose open={showSearch} size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    sideOffset={6}
                    className="text-md"
                  >
                    Search chats
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      style={{ cursor: "ew-resize" }}
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary !cursor-ew-resize [&_*]:!cursor-ew-resize"
                      onClick={(e) => {
                        (e.currentTarget as HTMLElement)?.blur();
                        setIsCloseBtnHovered(false);
                        setIsLogoHovered(false);
                        onToggle();
                      }}
                      onMouseEnter={() => setIsCloseBtnHovered(true)}
                      onMouseLeave={() => setIsCloseBtnHovered(false)}
                    >
                      <PanelLeft className="w-4 h-4 pointer-events-none" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    sideOffset={6}
                    className="text-md"
                  >
                    Close sidebar
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* New Chat Button */}
            <div className="px-2 pt-1 pb-2 space-y-2 relative z-20">
              {showSearch && (
                <div className="relative group">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search anything"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-9 pr-3 h-10 text-md bg-secondary rounded-xl text-foreground placeholder:text-muted-foreground focus:placeholder:text-foreground focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 border-0 transition-colors"
                    autoFocus
                  />
                </div>
              )}

              <button
                onClick={() => {
                  onNewChat();
                  if (
                    typeof window !== "undefined" &&
                    window.innerWidth < 1025
                  ) {
                    onToggle();
                  }
                }}
                className="w-full flex items-center justify-between h-10 px-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground text-md group cursor-pointer transition-all duration-150"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                  <span>New chat</span>
                </div>
              </button>
            </div>

            {/* Chat History Stream */}
            <div className="flex-1 px-2 overflow-y-auto border-t border-border/80 sidebar-scroll min-h-0">
              {isLoading ? (
                <div className="space-y-5 py-3 px-1 select-none">
                  {/* PINNED Skeleton Group */}
                  <div className="space-y-2">
                    <div className="h-3 w-20 bg-muted-foreground/20 rounded animate-pulse ml-2" />
                    <div className="space-y-1.5">
                      <div className="h-8 w-full bg-secondary/80 dark:bg-neutral-800/60 rounded-xl animate-pulse" />
                    </div>
                  </div>

                  {/* ARCHIVED Skeleton Group */}
                  <div className="space-y-2 pt-1">
                    <div className="h-3 w-24 bg-muted-foreground/20 rounded animate-pulse ml-2" />
                    <div className="space-y-1.5">
                      <div className="h-8 w-full bg-secondary/70 dark:bg-neutral-800/50 rounded-xl animate-pulse" />
                    </div>
                  </div>

                  {/* TODAY Skeleton Group */}
                  <div className="space-y-2 pt-1">
                    <div className="h-3 w-16 bg-muted-foreground/20 rounded animate-pulse ml-2" />
                    <div className="space-y-1.5">
                      <div className="h-8 w-full bg-secondary/70 dark:bg-neutral-800/50 rounded-xl animate-pulse" />
                      <div className="h-8 w-full bg-secondary/70 dark:bg-neutral-800/50 rounded-xl animate-pulse" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-2">
                  {/* Pinned Section */}
                  <div className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => toggleSection("Pinned")}
                      className="w-full flex items-center justify-between px-2 py-1 text-[15px] font-semibold tracking-wider text-muted-foreground hover:text-foreground select-none cursor-pointer transition-colors group/section text-left"
                    >
                      <span>Pinned</span>
                      <AnimatedChevron
                        open={!collapsedSections["Pinned"]}
                        disableHover
                        orientation="right-down"
                        size={18}
                        className="text-muted-foreground group-hover/section:text-foreground shrink-0 xl:opacity-0 xl:group-hover/section:opacity-100 transition-opacity duration-150"
                      />
                    </button>
                    {!collapsedSections["Pinned"] && (
                      <>
                        {(groupedChats["Pinned"] || []).length === 0 ? (
                          <div className="px-2 py-1 text-[13.5px] text-muted-foreground/60 select-none font-normal">
                            No pinned chats
                          </div>
                        ) : (
                          groupedChats["Pinned"].map((chat) =>
                            renderChatItem(chat)
                          )
                        )}
                      </>
                    )}
                  </div>

                  {/* Archived Section */}
                  <div className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => toggleSection("Archived")}
                      className="w-full flex items-center justify-between px-2 py-1 text-[15px] font-semibold tracking-wider text-muted-foreground hover:text-foreground select-none cursor-pointer transition-colors group/section text-left"
                    >
                      <span>Archived</span>
                      <AnimatedChevron
                        open={!collapsedSections["Archived"]}
                        disableHover
                        orientation="right-down"
                        size={18}
                        className="text-muted-foreground group-hover/section:text-foreground shrink-0 xl:opacity-0 xl:group-hover/section:opacity-100 transition-opacity duration-150"
                      />
                    </button>
                    {!collapsedSections["Archived"] && (
                      <>
                        {(groupedChats["Archived"] || []).length === 0 ? (
                          <div className="px-2 py-1 text-[13.5px] text-muted-foreground/60 select-none font-normal">
                            No archived chats
                          </div>
                        ) : (
                          groupedChats["Archived"].map((chat) =>
                            renderChatItem(chat)
                          )
                        )}
                      </>
                    )}
                  </div>

                  {/* Chats Section */}
                  <div className="space-y-0.5">
                    <div className="px-2 py-1 text-[15px] font-semibold tracking-wider text-foreground select-none">
                      Chats
                    </div>

                    {groupedChats["Chats"].length === 0 ? (
                      <div className="px-2 py-1 text-[13.5px] text-muted-foreground/60 select-none font-normal">
                        {searchQuery ? "No chats found" : "No chats"}
                      </div>
                    ) : (
                      groupedChats["Chats"].map((chat) => renderChatItem(chat))
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Bottom User Profile Dock (Unified & Persistent — Zero Blinking & Stable Avatar) */}
        <div
          className={cn(
            "w-full px-[5px] pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 mt-auto relative z-20 transition-colors duration-200",
            isOpen ? "border-t border-border/80" : "border-t border-transparent"
          )}
        >
          {/* Collapsed View Download Button (Stacked above avatar in rail view) */}
          <div
            className={cn(
              "w-full flex justify-center transition-all duration-200 overflow-hidden",
              !isOpen
                ? "h-10 opacity-100 mb-2 pointer-events-auto"
                : "h-0 opacity-0 mb-0 pointer-events-none"
            )}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => toast.info("CloseAI app coming soon")}
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-transparent hover:bg-secondary dark:hover:bg-[#212121] text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
                  aria-label="Download app"
                >
                  <Store className="w-5 h-5 shrink-0" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8} className="text-md">
                Download app
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Profile Row */}
          <div className="w-full h-10 flex items-center justify-between relative">
            {isLoading || !user ? (
              <div className="w-full h-10 flex items-center gap-2 select-none">
                <div className="w-8 h-8 rounded-full ml-1 bg-secondary/80 dark:bg-neutral-800/80 animate-pulse shrink-0" />
                <div
                  className={cn(
                    "flex-1 min-w-0 space-y-1.5 transition-all duration-200 overflow-hidden",
                    isOpen ? "opacity-100" : "w-0 opacity-0 pointer-events-none hidden"
                  )}
                >
                  <div className="h-3.5 w-20 bg-secondary/80 dark:bg-neutral-800/80 rounded animate-pulse" />
                  <div className="h-2.5 w-10 bg-secondary/60 dark:bg-neutral-800/60 rounded animate-pulse" />
                </div>
                <div
                  className={cn(
                    "shrink-0 transition-all duration-200 overflow-hidden pr-0.5",
                    isOpen ? "w-8 opacity-100 pointer-events-auto" : "w-0 opacity-0 pointer-events-none hidden"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toast.info("CloseAI app coming soon")}
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-muted-foreground hover:text-foreground bg-transparent hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer select-none"
                    aria-label="Download app"
                  >
                    <Store className="w-5 h-5 shrink-0" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <DropdownMenu
                  onOpenChange={(open) => {
                    if (!open) setAccountSubView("main");
                  }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <button
                          className={cn(
                            "h-10 flex items-center justify-start rounded-xl hover:bg-secondary transition-[width,background-color] duration-200 cursor-pointer select-none outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 ring-0 border-0 pl-0",
                            isOpen
                              ? "flex-1 min-w-0 pr-1 gap-2 text-left"
                              : "w-10 pr-0"
                          )}
                        >
                          {/* Rock-solid, non-blinking avatar — perfectly stationary at 9px from sidebar left */}
                          <div className="ml-1 shrink-0">
                            {renderAvatarContent()}
                          </div>

                          {/* Expanded User Details */}
                          <div
                            className={cn(
                              "flex-1 min-w-0 transition-all duration-200 overflow-hidden whitespace-nowrap",
                              isOpen
                                ? "opacity-100"
                                : "w-0 opacity-0 pointer-events-none hidden"
                            )}
                          >
                            <p className="text-md font-medium text-foreground truncate leading-snug">
                              {displayName}
                            </p>
                            <p
                              className="text-sm text-muted-foreground leading-none"
                              suppressHydrationWarning
                            >
                              {planDisplay}
                            </p>
                          </div>
                        </button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    {!isOpen && (
                      <TooltipContent side="right" className="text-md">
                        {displayName}
                      </TooltipContent>
                    )}
                  </Tooltip>

                  <DropdownMenuContent
                    side="top"
                    align="start"
                    alignOffset={isOpen ? 0 : -4}
                    sideOffset={6}
                    className={cn(
                      "rounded-2xl p-1.5 bg-white/50 dark:bg-[#212121]/50 backdrop-blur-sm border border-border/80 dark:border-none outline-none focus:outline-none ring-0",
                      isOpen
                        ? "w-[calc(100vw-1rem)] sm:w-[234px] max-h-[calc(100dvh-5rem)] overflow-y-auto"
                        : "w-64"
                    )}
                  >
                    {renderAccountMenuItems()}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Expanded Download App Button (on right side of profile row) */}
                <div
                  className={cn(
                    "shrink-0 transition-all duration-200 overflow-hidden pr-0.5",
                    isOpen
                      ? "w-8 opacity-100 pointer-events-auto"
                      : "w-0 opacity-0 pointer-events-none hidden"
                  )}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => toast.info("CloseAI app coming soon")}
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-muted-foreground hover:text-foreground bg-transparent hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer select-none"
                        aria-label="Download app"
                      >
                        <Store className="w-5 h-5 shrink-0" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={8} className="text-md">
                      Download app
                    </TooltipContent>
                  </Tooltip>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal — mounted here, outside the isOpen branch,
          so it renders whether the sidebar is expanded or collapsed to the rail. */}
      <LogoutModal
        open={showLogoutModal}
        onOpenChange={setShowLogoutModal}
        onConfirm={signOut}
        userName={displayName}
        userEmail={userEmail}
        userAvatar={avatarUrl}
      />

      {/* Delete Confirmation Modal — same reasoning as above. */}
      <DeleteModal
        open={!!chatToDelete}
        onOpenChange={(open) => {
          if (!open) setChatToDelete(null);
        }}
        itemTitle={chatToDelete?.title || "New chat"}
        onConfirm={() => {
          if (chatToDelete) {
            onDeleteChat(chatToDelete.id);
            setChatToDelete(null);
          }
        }}
      />
    </>
  );
}

export default Sidebar;

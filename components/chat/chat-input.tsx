"use client";

import React, { useRef, useEffect, useState, useCallback, forwardRef } from "react";
import {
  Plus,
  ArrowUp,
  X,
  Mic,
  MicOff,
  Brain,
  FileText,
  Code,
  Image as ImageIcon,
  Film,
  Music,
  Loader,
  Sparkles,
  Check,
  Paperclip,
  Square,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
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
import { PlusMenuContent } from "./plus-menu-content";
import { FilePreviewModal } from "@/components/modals/file-preview-modal";
import { ImagePreview } from "@/components/ui/image-preview";
import { getFileIconInfo } from "@/lib/file-utils";
import { cn } from "@/lib/utils";
import toast from "@/lib/toast";

interface ChatInputProps {
  message: string;
  onMessageChange: (msg: string) => void;
  onSend: () => void;
  onStop?: () => void;
  uploadedFiles: File[];
  onFilesChange: (files: File[]) => void;
  isTyping: boolean;
  isUploading: boolean;
  centered?: boolean;
  showDisclaimer?: boolean;
  children?: React.ReactNode;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  selectedTier?: number;
  onTierChange?: (tier: number) => void;
  thinkMode?: boolean;
  onThinkModeChange?: (enabled: boolean) => void;
}

/** preview card with thumbnail or code icon */
function FilePreviewCard({
  file,
  onRemove,
  onPreview,
}: {
  file: File;
  onRemove: () => void;
  onPreview?: () => void;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const isImage =
    file.type.startsWith("image/") ||
    /\.(jpg|jpeg|png|webp|gif|svg|bmp|ico|avif)$/i.test(file.name);

  useEffect(() => {
    if (isImage) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file, isImage]);

  const { Icon, label, colorClass, badgeBg } = getFileIconInfo(file);

  // For images: show ONLY preview without details
  if (isImage) {
    return (
      <div
        className="relative group inline-block select-none"
        title={`Preview ${file.name}`}
      >
        <ImagePreview src={imageUrl || ""} alt={file.name}>
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-[#262626] border border-neutral-200/90 dark:border-white/10 flex items-center justify-center shrink-0 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={file.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Icon className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
            )}
          </div>
        </ImagePreview>
        {/* Remove button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm border border-neutral-300/90 dark:border-white/20 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-white dark:hover:bg-neutral-700 flex items-center justify-center cursor-pointer transition-transform z-10"
          aria-label="Remove image"
        >
          <X className="w-2.5 h-2.5 stroke-[2.5]" />
        </button>
      </div>
    );
  }

  // For non-image files: show full details (file icon, name, type)
  return (
    <div
      onClick={onPreview}
      className="relative group flex items-center gap-2.5 bg-neutral-100 dark:bg-[#262626] hover:bg-neutral-200/80 dark:hover:bg-[#303030] border border-neutral-200/90 dark:border-white/10 rounded-2xl p-2 pr-4 text-foreground min-w-0 cursor-pointer select-none transition-colors"
      title={`Preview ${file.name}`}
    >
      {/* File type icon */}
      <div className="w-10 h-10 rounded-xl overflow-hidden bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-white/5 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-neutral-700 dark:text-neutral-300" weight="fill" />
      </div>

      {/* File info */}
      <div className="flex flex-col min-w-0 pr-0.5 justify-center">
        <span className="text-[14.5px] font-semibold text-neutral-900 dark:text-neutral-100 truncate max-w-[140px] sm:max-w-[180px] leading-tight">
          {file.name}
        </span>
      </div>

      {/* Remove button — frosted glass circle with same design as scroll-to-bottom button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm border border-neutral-300/90 dark:border-white/20 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-white dark:hover:bg-neutral-700 flex items-center justify-center cursor-pointer transition-transform z-10"
        aria-label="Remove file"
      >
        <X className="w-2.5 h-2.5 stroke-[2.5]" />
      </button>
    </div>
  );
}

export const ChatInput = forwardRef<HTMLDivElement, ChatInputProps>(function ChatInput(
  {
    message,
    onMessageChange,
    onSend,
    onStop,
    uploadedFiles,
    onFilesChange,
    isTyping,
    isUploading,
    centered = false,
    showDisclaimer = false,
    children,
    selectedModel = "GPT-5.4",
    onModelChange,
    selectedTier = 4,
    onTierChange,
    thinkMode = false,
    onThinkModeChange,
  },
  ref
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const plusButtonRef = useRef<HTMLButtonElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const [isMultiLine, setIsMultiLine] = useState(false);
  const [isFullyExpanded, setIsFullyExpanded] = useState(false);
  const [menuSideOffset, setMenuSideOffset] = useState(14);
  const [menuAlignOffset, setMenuAlignOffset] = useState(0);
  const [menuWidth, setMenuWidth] = useState<number | undefined>(undefined);
  const recognitionRef = useRef<any>(null);
  const cursorPositionRef = useRef<number | null>(null);
  const [currentModel, setCurrentModel] = useState(selectedModel);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  useEffect(() => {
    if (selectedModel) {
      setCurrentModel(selectedModel);
    }
  }, [selectedModel]);

  const handleSelectModel = (modelName: string) => {
    setCurrentModel(modelName);
    onModelChange?.(modelName);
    toast.success(`Switched to ${modelName}`);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      onFilesChange([...uploadedFiles, ...acceptedFiles]);
    },
    noClick: true,
    noKeyboard: true,
  });

  // Check if content is bigger (e.g. 5-10 lines or one-two paragraphs)
  const lineCount = (message || "").split("\n").length;
  const isBigContent =
    lineCount >= 4 ||
    (message && message.trim().length >= 180) ||
    ((message || "").includes("\n") && (message || "").trim().length >= 80) ||
    isFullyExpanded;

  // Check if content dynamically requires multiline layout
  const isTextMultiLine = Boolean(
    message &&
    message.trim().length > 0 &&
    (message.includes("\n") || message.length > 25 || isMultiLine)
  );

  const isExpandedLayout =
    isFullyExpanded ||
    uploadedFiles.length > 0 ||
    isTextMultiLine;

  // Auto-resize textarea height smoothly
  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;

    // When message is cleared or empty, immediately collapse
    if (!message || message.trim() === "") {
      el.style.height = "26px";
      el.style.overflowY = "hidden";
      setIsMultiLine(false);
      if (isFullyExpanded) setIsFullyExpanded(false);
      return;
    }

    // Reset height to measure scrollHeight accurately
    el.style.height = "auto";
    const scrollH = el.scrollHeight;
    const maxH = isFullyExpanded ? 600 : 300;

    if (scrollH > 38 || message.includes("\n")) {
      setIsMultiLine(true);
      if (scrollH > maxH) {
        el.style.height = `${maxH}px`;
        el.style.overflowY = "auto";
      } else {
        // Expand smoothly to exact height without micro-overflow
        el.style.height = `${Math.max(scrollH, 44)}px`;
        el.style.overflowY = "hidden";
      }
    } else {
      el.style.height = "26px";
      el.style.overflowY = "hidden";
      setIsMultiLine(false);
    }
  }, [message, isFullyExpanded]);

  useEffect(() => {
    adjustHeight();
  }, [adjustHeight]);

  useEffect(() => {
    window.addEventListener("resize", adjustHeight);
    return () => window.removeEventListener("resize", adjustHeight);
  }, [adjustHeight]);

  // Auto-focus textarea on mount / page reload (matching s/[id] behavior)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const len = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(len, len);
      }
    }, 50);
    return () => clearTimeout(timer);
  }, []);

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

  // Calculate dynamic menu sideOffset & alignOffset so it is ALWAYS positioned above the chat input pill
  const updateMenuPosition = useCallback(() => {
    if (plusButtonRef.current && pillRef.current) {
      const buttonRect = plusButtonRef.current.getBoundingClientRect();
      const pillRect = pillRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 1025;

      // Distance from top of the + button to the top of the chat input pill:
      const distToPillTop = Math.max(0, buttonRect.top - pillRect.top);
      // Place the dropdown 10px above the top border of the chat input pill:
      setMenuSideOffset(Math.round(distToPillTop + 10));

      // Always align cleanly with the left edge of the chat input pill:
      const distToPillLeft = Math.max(0, buttonRect.left - pillRect.left);
      setMenuAlignOffset(-Math.round(distToPillLeft));

      if (isMobile) {
        // On small screen devices, match the exact width of the input pill so left & right edges align
        setMenuWidth(Math.round(pillRect.width));
      } else {
        setMenuWidth(undefined);
      }
    }
  }, []);

  useEffect(() => {
    updateMenuPosition();
  }, [message, isExpandedLayout, uploadedFiles.length, plusMenuOpen, updateMenuPosition]);

  useEffect(() => {
    if (!pillRef.current) return;
    const ro = new ResizeObserver(() => {
      updateMenuPosition();
    });
    ro.observe(pillRef.current);
    window.addEventListener("resize", updateMenuPosition);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateMenuPosition);
    };
  }, [updateMenuPosition]);

  // Speech Recognition (Web Speech API)
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
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    try {
      // First prompt for microphone permission if needed
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (err: any) {
      console.error("Microphone access error:", err);
      toast.error("Microphone access denied. Please allow microphone permission in your browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = navigator.language || "en-US";

      const baseText = message.trim();

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        const updated = baseText ? `${baseText} ${transcript}` : transcript;
        onMessageChange(updated);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
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
      console.error("Failed to start speech recognition:", err);
      toast.error("Could not start speech recognition.");
      setIsListening(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && isFullyExpanded) {
      e.preventDefault();
      setIsFullyExpanded(false);
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (
        (message.trim() || uploadedFiles.length > 0) &&
        !isTyping &&
        !isUploading
      ) {
        setIsFullyExpanded(false);
        onSend();
      }
    }
  };

  // Support clipboard image pasting (Ctrl+V screenshots/images)
  const handlePaste = (e: React.ClipboardEvent) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    const items = clipboardData.items;
    const filesToAdd: File[] = [];

    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith("image/") || item.kind === "file") {
          const file = item.getAsFile();
          if (file) {
            const ext = file.type.split("/")[1] || "png";
            const namedFile =
              file.name && file.name !== "image.png"
                ? file
                : new File([file], `Pasted_Image_${Date.now()}.${ext}`, {
                    type: file.type || "image/png",
                  });
            filesToAdd.push(namedFile);
          }
        }
      }
    }

    if (filesToAdd.length === 0 && clipboardData.files && clipboardData.files.length > 0) {
      for (let i = 0; i < clipboardData.files.length; i++) {
        const file = clipboardData.files[i];
        if (file.type.startsWith("image/")) {
          filesToAdd.push(file);
        }
      }
    }

    if (filesToAdd.length > 0) {
      e.preventDefault();
      e.stopPropagation();
      onFilesChange([...uploadedFiles, ...filesToAdd]);
      toast.success(
        filesToAdd.length === 1
          ? "Image attached from clipboard"
          : `${filesToAdd.length} images attached from clipboard`
      );
    }

    // Always preserve focus on text paste
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const removeFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  const hasContent = message.trim().length > 0 || uploadedFiles.length > 0;

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
              disabled={isTyping || isUploading}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary dark:hover:bg-[#2f2f2f] transition-colors shrink-0 cursor-pointer outline-none focus:outline-none"
              aria-label="Add files and more"
            >
              <Plus className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent className="text-md">
          Attach and more
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent
        side="top"
        align="start"
        sideOffset={menuSideOffset}
        alignOffset={menuAlignOffset}
        avoidCollisions={true}
        collisionPadding={12}
        className={cn(
          "rounded-2xl p-1.5 bg-white/50 dark:bg-[#212121]/50 backdrop-blur-sm border border-border/80 dark:border-none select-none outline-none",
          menuWidth ? "" : "w-[244px] max-w-[calc(100vw-24px)]"
        )}
        style={{
          width: menuWidth ? `${menuWidth}px` : undefined,
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        }}
      >
        <PlusMenuContent
          onAddFiles={() => {
            fileInputRef.current?.click();
            setPlusMenuOpen(false);
          }}
          selectedModel={currentModel}
          onModelChange={(newModel) => {
            handleSelectModel(newModel);
          }}
          selectedTier={selectedTier}
          onTierChange={onTierChange}
          isOpen={plusMenuOpen}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderRightActions = () => (
    <>
      {/* Think Mode Pill Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => onThinkModeChange?.(!thinkMode)}
            className={cn(
              "h-9 sm:h-10 px-2.5 sm:px-3 rounded-full flex items-center justify-center gap-1.5 text-[13px] sm:text-[14px] font-medium select-none transition-all shrink-0 cursor-pointer",
              thinkMode
                ? "bg-foreground dark:bg-[#2F2F2F] text-background dark:text-foreground hover:opacity-90"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
            aria-label="Think"
          >
            <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Think</span>
          </button>
        </TooltipTrigger>
        <TooltipContent className="text-md">
          Think
        </TooltipContent>
      </Tooltip>

      {/* Dictate / Mic */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={toggleDictation}
            className={cn(
              "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0",
              isListening
                ? "bg-red-500/15 text-red-500 hover:bg-red-500/25 ring-red-500/30"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
            aria-label={isListening ? "Stop dictation" : "Dictate"}
          >
            {isListening ? (
              <MicOff className="w-5 h-5 text-red-500" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent className="text-md">
          {isListening ? "Stop dictation" : "Dictate"}
        </TooltipContent>
      </Tooltip>

      {/* Send / Stop Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={isTyping ? onStop : () => { setIsFullyExpanded(false); onSend(); }}
            disabled={(!hasContent && !isTyping) || isUploading}
            className={cn(
              "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shrink-0",
              isTyping
                ? "bg-foreground text-background cursor-pointer hover:opacity-85 active:scale-95"
                : isUploading
                ? "bg-secondary dark:bg-neutral-800 text-foreground cursor-wait opacity-90"
                : hasContent
                ? "bg-foreground text-background cursor-pointer hover:opacity-90 active:scale-95"
                : "bg-neutral-300 dark:bg-[#383838] text-muted-foreground/50 cursor-not-allowed opacity-50"
            )}
            aria-label={isTyping ? "Stop generating" : "Send message"}
          >
            {isTyping ? (
              <Square className="w-4 h-4 fill-current" />
            ) : isUploading ? (
              <Loader className="w-5 h-5 animate-spin text-foreground" />
            ) : (
              <ArrowUp className="w-5 h-5 stroke-[3]" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent className="text-md">
          {isTyping ? "Stop generating" : isUploading ? "Uploading files..." : "Send message"}
        </TooltipContent>
      </Tooltip>
    </>
  );

  return (
    <div
      ref={ref}
      className={cn(
        "w-full select-none transition-all duration-200 relative",
        centered ? "max-w-2xl mx-auto px-6" : "max-w-3xl mx-auto px-6"
      )}
    >
      {children}
      <div
        {...getRootProps()}
        ref={pillRef}
        className={cn(
          "relative bg-white/50 dark:bg-[#212121]/50 backdrop-blur-sm border border-border/80 dark:border-none transition-all duration-200",
          "focus-within:text-foreground dark:focus-within:text-foreground",
          "rounded-3xl",
          isExpandedLayout
            ? "p-3.5 sm:p-4"
            : "px-2 sm:px-3 py-1.5 min-h-[48px] sm:min-h-[52px] flex items-center",
          isDragActive && "ring-2 ring-primary border-primary"
        )}
      >
        <input {...getInputProps()} />
        {/* Attachment Button */}
        <input
          type="file"
          multiple
          className="hidden"
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files) {
              onFilesChange([
                ...uploadedFiles,
                ...Array.from(e.target.files),
              ]);
            }
          }}
        />

        {/* Attached Files Preview —  cards (Image 3) */}
        {uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 px-1 pt-1 pb-2">
            {uploadedFiles.map((file, i) => (
              <FilePreviewCard
                key={i}
                file={file}
                onRemove={() => removeFile(i)}
                onPreview={() => setPreviewFile(file)}
              />
            ))}
          </div>
        )}

        {isExpandedLayout ? (
          /* Multiline Layout: full-width textarea on top, bottom toolbar with + on left and tools on right */
          <div className="flex flex-col w-full">
            <div className="w-full px-1.5 sm:px-2 pt-0.5 pb-1 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => {
                  cursorPositionRef.current = e.target.selectionEnd;
                  onMessageChange(e.target.value);
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
                placeholder="Ask anything"
                rows={1}
                disabled={isTyping || isUploading}
                className={cn(
                  "w-full min-w-0 bg-transparent border-0 p-0 text-[16px] sm:text-[16.5px] text-foreground placeholder:text-muted-foreground focus:placeholder:text-foreground transition-colors focus:outline-none focus:ring-0 resize-none leading-relaxed",
                  isFullyExpanded ? "min-h-[280px]" : "min-h-[44px]",
                  isBigContent && "pr-14 sm:pr-16"
                )}
              />

              {/* Expand / Collapse button: matches Add files & Dictate button style & tooltip */}
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

            {/* Bottom Toolbar Row: + button placed down side like others buttons */}
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
          /* Single-line Layout: sleek single row with + on left, textarea in center, tools on right */
          <div className="flex items-center gap-1 sm:gap-2 w-full">
            <div className="flex items-center shrink-0 pl-0.5 sm:pl-1">
              {renderPlusButton()}
            </div>

            <div className="flex-1 min-w-0 flex items-center">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => {
                  cursorPositionRef.current = e.target.selectionEnd;
                  onMessageChange(e.target.value);
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
                placeholder="Ask anything"
                rows={1}
                disabled={isTyping || isUploading}
                className="w-full min-w-0 bg-transparent border-0 px-0.5 sm:px-1 py-0 text-[16px] sm:text-[16.5px] text-foreground placeholder:text-muted-foreground focus:placeholder:text-foreground transition-colors focus:outline-none focus:ring-0 resize-none h-[26px] leading-[26px] overflow-hidden scrollbar-none"
              />
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 pr-0.5 sm:pr-1">
              {renderRightActions()}
            </div>
          </div>
        )}
      </div>

      {/* Responsive Disclaimer */}
      {showDisclaimer && (
        <div className="text-center pt-2 pb-0.5 px-3 select-none">
          <p className="text-[13px] sm:text-base text-muted-foreground font-normal tracking-tight leading-tight">
            CloseAI can make mistakes. Verify important info.
          </p>
        </div>
      )}

      <FilePreviewModal
        open={!!previewFile}
        onOpenChange={(open) => {
          if (!open) setPreviewFile(null);
        }}
        file={previewFile}
      />
    </div>
  );
});

export default ChatInput;

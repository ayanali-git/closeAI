"use client";

import React, { useEffect, useState } from "react";
import {
  LinkedinLogoIcon,
  XLogoIcon,
  LinkIcon,
  CheckIcon,
  XIcon,
  DotsThreeIcon,
  PaperclipIcon,
  FilePdfIcon,
  FileDocIcon,
  FileCsvIcon,
  FileTextIcon,
  FileCodeIcon,
  FileZipIcon,
  FileAudioIcon,
  FileVideoIcon,
  FileIcon,
} from "@phosphor-icons/react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { cn } from "@/lib/utils";
import toast from "@/lib/toast";

export interface SharePromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promptText: string;
  files?: any[];
}

/** Same image-detection logic used for real message attachments (by mime type or filename/url extension) */
function isImageFile(file: any, fileUrl?: string): boolean {
  if (
    file?.type &&
    typeof file.type === "string" &&
    file.type.toLowerCase().startsWith("image/")
  ) {
    return true;
  }
  const name = file?.filename || file?.name || fileUrl || "";
  return (
    typeof name === "string" &&
    /\.(png|jpe?g|webp|gif|svg|bmp|ico|avif)(\?.*)?$/i.test(name)
  );
}

/** Resolve the file's extension from mime type or filename/url, lowercased and without the dot */
function getFileExtension(file: any, fileUrl?: string): string {
  const mime = file?.type && typeof file.type === "string" ? file.type : "";
  const mimeMap: Record<string, string> = {
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "text/csv": "csv",
    "application/vnd.ms-excel": "csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "text/plain": "txt",
    "application/zip": "zip",
    "application/x-zip-compressed": "zip",
  };
  if (mime && mimeMap[mime]) return mimeMap[mime];
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("video/")) return "video";

  const name = file?.filename || file?.name || fileUrl || "";
  const match = typeof name === "string" ? name.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/) : null;
  return match ? match[1].toLowerCase() : "";
}

/** Maps a file extension to the matching Phosphor file-type icon */
function getFileIcon(ext: string) {
  switch (ext) {
    case "pdf":
      return FilePdfIcon;
    case "doc":
    case "docx":
      return FileDocIcon;
    case "csv":
    case "xlsx":
    case "xls":
      return FileCsvIcon;
    case "txt":
    case "md":
      return FileTextIcon;
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
    case "py":
    case "json":
    case "html":
    case "css":
      return FileCodeIcon;
    case "zip":
    case "rar":
    case "7z":
      return FileZipIcon;
    case "audio":
    case "mp3":
    case "wav":
      return FileAudioIcon;
    case "video":
    case "mp4":
    case "mov":
      return FileVideoIcon;
    default:
      return FileIcon;
  }
}

export function SharePromptModal({
  open,
  onOpenChange,
  promptText,
  files,
}: SharePromptModalProps) {
  const [linkCopied, setLinkCopied] = useState(false);
  const [isCopyingLink, setIsCopyingLink] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  // Mirrors BottomSheet's own breakpoint so the header X only shows on desktop,
  // where BottomSheet renders as a centered modal with no other close affordance.
  // On mobile it renders as a bottom sheet with a drag handle + backdrop tap to dismiss.
  useEffect(() => {
    const checkMobile = () => setIsMobileScreen(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = promptText.length > 200 ? promptText.slice(0, 200) + "…" : promptText;

  const handleCopyLink = async () => {
    if (isCopyingLink) return;
    setIsCopyingLink(true);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setLinkCopied(false), 2000);
    } finally {
      setIsCopyingLink(false);
    }
  };

  const handleShareX = () => {
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareMore = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Shared prompt — CloseAI",
          text: shareText,
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      // Fallback: just copy
      handleCopyLink();
    }
  };

  const hasFiles = files && files.length > 0;

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={["auto"]}
      className="max-w-[600px]"
    >
      <div className="flex flex-col space-y-5 pt-1 pb-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Share prompt
          </h2>
          {!isMobileScreen && (
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="p-1.5 rounded-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer shrink-0"
              aria-label="Close"
            >
              <XIcon className="w-4 h-4" weight="bold" />
            </button>
          )}
        </div>

        {/* Preview Card — renders the prompt exactly like a real sent message */}
        <div className="relative w-full rounded-2xl overflow-hidden dark:bg-neutral-800 dark:bg-[#1a1a1a]">
          {/* Bottom gradient overlay — fades into the CloseAI branding */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 z-10 pointer-events-none bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          <div
            className={cn(
              "relative z-0 min-h-[300px] sm:min-h-[330px] flex flex-col items-end justify-start gap-2.5 px-5 sm:px-6 pt-5 sm:pt-6 pb-12 sm:pb-14",
              // Both states pin to the top of the card, share preview — no vertical centering gap above the content.
            )}
          >
            {/* Files Preview — same small-thumbnail treatment as a real message attachment, not a big stretched square */}
            {hasFiles && (
              <div className="flex flex-wrap gap-1.5 justify-end items-end select-none">
                {files!.map((file: any, i: number) => {
                  const fileUrl = file.url || file.publicUrl;
                  const isImage = isImageFile(file, fileUrl);
                  const ext = getFileExtension(file, fileUrl);
                  const FileTypeIcon = getFileIcon(ext);
                  return (
                    <div
                      key={file.id || i}
                      className={cn(
                        "overflow-hidden rounded-full bg-secondary border border-border/80",
                        isImage ? "max-w-[100px] sm:max-w-[150px]" : "max-w-full"
                      )}
                    >
                      {isImage && fileUrl ? (
                        <img
                          src={fileUrl}
                          alt={file.name || "Attachment"}
                          className="w-full max-h-[180px] sm:max-h-[220px] object-cover rounded-2xl"
                        />
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm text-foreground">
                          <FileTypeIcon
                            className="w-4 h-4 shrink-0 text-muted-foreground"
                            weight="fill"
                          />
                          <span className="whitespace-nowrap">
                            {file.name || file.filename || "File"}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Prompt Text — identical bubble styling (bg / rounding / padding) to a real sent message bubble */}
            {promptText && (
              <p className="bg-bubble dark:bg-[#2F2F2F] text-foreground text-[15px] sm:text-[15.5px] leading-relaxed rounded-2xl sm:rounded-3xl px-4 sm:px-5 py-2.5 sm:py-3 max-w-[85%] whitespace-pre-wrap break-words">
                {promptText}
              </p>
            )}
          </div>

          {/* CloseAI Branding */}
          <div className="absolute right-5 sm:right-6 bottom-4 sm:bottom-5 z-20">
            <span className="text-2xl font-bold text-muted-foreground tracking-tight select-none">
              CloseAI
            </span>
          </div>
        </div>

        {/* Share Buttons Row */}
        <div className="flex items-center justify-center gap-4 sm:gap-10 pt-4 sm:pt-10">
          {/* Copy */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-foreground text-background flex items-center justify-center transition-opacity group-hover:opacity-80">
              {linkCopied ? (
                <CheckIcon className="w-6 h-6" weight="bold" />
              ) : (
                <LinkIcon className="w-6 h-6" weight="bold" />
              )}
            </div>
            <span className="text-xs font-medium text-foreground select-none">
              {linkCopied ? "Copied!" : "Copy"}
            </span>
          </button>

          {/* X (Twitter) */}
          <button
            type="button"
            onClick={handleShareX}
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-foreground text-background flex items-center justify-center transition-opacity group-hover:opacity-80">
              <XLogoIcon className="w-6 h-6" weight="bold" />
            </div>
            <span className="text-xs font-medium text-foreground select-none">X</span>
          </button>

          {/* LinkedIn */}
          <button
            type="button"
            onClick={handleShareLinkedIn}
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-foreground text-background flex items-center justify-center transition-opacity group-hover:opacity-80">
              <LinkedinLogoIcon className="w-6 h-6" weight="bold" />
            </div>
            <span className="text-xs font-medium text-foreground select-none">
              LinkedIn
            </span>
          </button>

          {/* More (system share) */}
          <button
            type="button"
            onClick={handleShareMore}
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-foreground text-background flex items-center justify-center transition-opacity group-hover:opacity-80">
              <DotsThreeIcon className="w-6 h-6" weight="bold" />
            </div>
            <span className="text-xs font-medium text-foreground select-none">
              More
            </span>
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
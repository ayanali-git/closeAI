"use client";

import React, { useState } from "react";
import { X, Download, ExternalLink } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

export interface ImagePreviewProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ImagePreview({
  src,
  alt = "Preview image",
  width = 400,
  height = 400,
  className = "cursor-pointer rounded-xl hover:opacity-90 transition-opacity",
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ImagePreviewProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setIsOpen = (next: boolean) => {
    if (!isControlled) {
      setInternalOpen(next);
    }
    controlledOnOpenChange?.(next);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!src) return;
    const a = document.createElement("a");
    a.href = src;
    a.download = alt || "image";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      {children ? (
        <div onClick={() => setIsOpen(true)} className="cursor-pointer">
          {children}
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={cn("cursor-pointer select-none", className)}
          onClick={() => setIsOpen(true)}
        />
      )}

      <DialogPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
        <DialogPrimitive.Portal>
          {/* Simple dark backdrop without animation */}
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm" />

          {/* Simple content container without zoom animations */}
          <DialogPrimitive.Content
            className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 max-w-[85vw] max-h-[85vh] w-auto h-auto p-0 bg-transparent border-0 outline-none focus:outline-none flex items-center justify-center"
            onPointerDownOutside={() => setIsOpen(false)}
          >
            <DialogPrimitive.Title className="sr-only">
              {alt || "Image preview"}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              Preview image full size
            </DialogPrimitive.Description>

            {/* Image Preview Container */}
            <div className="relative inline-block max-w-[85vw] max-h-[85vh] overflow-hidden rounded-2xl">
              {/* Top-Right Toolbar — inside the image preview container with comfortable padding */}
              <div className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-20 flex items-center gap-1 p-1 rounded-2xl bg-card backdrop-blur-sm select-none">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-sm hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </button>
              </div>

              {/* Image */}
              <img
                src={src}
                alt={alt}
                className="max-h-[85vh] max-w-[85vw] object-contain rounded-2xl select-none block"
              />
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}

export default ImagePreview;

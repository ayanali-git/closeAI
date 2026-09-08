"use client";

import React from "react";
import { Info } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";

export interface DeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemTitle?: string;
}

export function DeleteModal({
  open,
  onOpenChange,
  onConfirm,
  itemTitle,
}: DeleteModalProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={["auto"]}
      className="max-w-[400px]"
    >
      <div className="flex flex-col items-center text-center space-y-4 pt-2 pb-1">
        {/* Title */}
        <h2 className="text-xl font-bold tracking-tight text-foreground px-2">
          Are you sure you want to delete?
        </h2>

        {/* Item Title Preview */}
        {itemTitle && (
          <div className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-border/80 bg-secondary/30 text-left">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground select-none">Deleting chat</p>
              <p className="text-sm font-semibold text-foreground truncate leading-snug select-none">
                {itemTitle}
              </p>
            </div>
          </div>
        )}

        {/* Info Box Note */}
        <div className="w-full flex items-start gap-2.5 p-3.5 rounded-2xl bg-secondary/50 text-left text-xs text-muted-foreground">
          <Info className="w-4 h-4 shrink-0 text-muted-foreground mt-0.5" />
          <span className="leading-normal">This will permanently delete this conversation.</span>
        </div>

        {/* Action Buttons (Stacked Full Width Pills) */}
        <div className="w-full space-y-2.5 pt-1">
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onConfirm();
            }}
            className="w-full h-11 rounded-full bg-red-600 text-background font-semibold text-sm hover:bg-red-500 transition-all cursor-pointer select-none"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full h-11 rounded-full border border-border/80 bg-transparent text-foreground font-semibold text-sm hover:bg-secondary/60 transition-all cursor-pointer select-none"
          >
            Cancel
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

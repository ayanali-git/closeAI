"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface LogoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  userEmail?: string;
  userName?: string;
  userAvatar?: string;
}

export function LogoutModal({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  userEmail,
  userName,
  userAvatar,
}: LogoutModalProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={["auto"]}
      className="max-w-[600px]"
    >
      <div className="flex flex-col space-y-4 pt-1 pb-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {title || "Log out?"}
          </h2>
        </div>

        <div className="relative w-full overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-[30%] min-h-[95px] sm:min-h-[105px] z-10 pointer-events-none" />

          <div
            className={cn(
              "relative z-0 max-h-[100px] sm:max-h-[200px] min-h-[100px] sm:min-h-[200px] flex items-center justify-center p-5 sm:p-6 overflow-hidden select-text"
            )}
          >
            {(userName || userEmail) && (
              <div className="flex items-center gap-3.5 select-none">
                <Avatar className="w-20 h-20 rounded-full border border-border/80 shrink-0">
                  <AvatarImage src={userAvatar} />
                  <AvatarFallback className="text-sm font-semibold bg-secondary text-foreground">
                    {userName}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 text-left">
                  {userName && (
                    <p className="text-[20px] font-semibold text-foreground truncate leading-snug">
                      {userName}
                    </p>
                  )}
                  {userEmail && (
                    <p className="text-base text-muted-foreground truncate leading-tight mt-0.5">
                      {userEmail}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Warning / Info Box */}
        <div className="w-full flex items-start gap-2.5 p-3 rounded-2xl bg-secondary/50 text-left text-xs text-muted-foreground">
          <AlertTriangle className="w-4 h-4 shrink-0 text-muted-foreground mt-0.5" />
          <span className="leading-normal">
            {description || "This will log you out across all CloseAI platforms."}
          </span>
        </div>

        {/* Action Buttons — Stacked Full-Width Pills */}
        <div className="w-full space-y-2 pt-1">
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onConfirm();
            }}
            className="w-full h-11 rounded-full bg-foreground text-background font-semibold text-sm hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer select-none"
          >
            Log out
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full h-11 rounded-full border border-border/80 bg-transparent text-foreground font-normal text-sm hover:bg-secondary/60 transition-all cursor-pointer select-none"
          >
            Cancel
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

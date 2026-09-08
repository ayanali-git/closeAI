"use client";

import React from "react";
import { Info } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface LogoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  userEmail?: string;
  userName?: string;
  userAvatar?: string;
}

export function LogoutModal({
  open,
  onOpenChange,
  onConfirm,
  userEmail,
  userName,
  userAvatar,
}: LogoutModalProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={["auto"]}
      className="max-w-[400px]"
    >
      <div className="flex flex-col items-center text-center space-y-4 pt-2 pb-1">
        {/* Title */}
        <div className="text-xl font-bold tracking-tight text-foreground px-2">
          Are you sure you want to log out?
        </div>

        {/* User Card */}
        {(userName || userEmail) && (
          <div className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-border/80 bg-secondary/30 text-left">
            <Avatar className="w-9 h-9 rounded-full border border-border shrink-0 select-none">
              <AvatarImage src={userAvatar} />
              <AvatarFallback className="text-sm font-semibold bg-secondary text-foreground">
                {userName ? userName.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              {userName && (
                <p className="text-sm font-semibold text-foreground truncate leading-snug select-none">
                  {userName}
                </p>
              )}
              {userEmail && (
                <p className="text-xs text-muted-foreground truncate leading-tight select-none">
                  {userEmail}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="w-full flex items-start gap-2.5 p-3.5 rounded-2xl bg-secondary/50 text-left text-xs text-muted-foreground">
          <Info className="w-4 h-4 shrink-0 text-muted-foreground mt-0.5" />
          <span className="leading-normal">This will also log you out of CloseAI Platform.</span>
        </div>

        {/* Action Buttons (Stacked Full Width Pills) */}
        <div className="w-full space-y-2.5 pt-1">
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onConfirm();
            }}
            className="w-full h-11 rounded-full bg-foreground text-background font-semibold text-sm hover:opacity-90 transition-all cursor-pointer select-none"
          >
            Log out
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

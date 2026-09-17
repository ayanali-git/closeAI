"use client";

import React, { useRef, useState, useEffect } from "react";
import { Camera, Loader, Info } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import toast from "@/lib/toast";

export interface ProfileImageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAvatarUrl?: string | null;
  userName?: string;
  userEmail?: string;
  onAvatarUpdated: (newUrl: string | null) => void;
}

export function ProfileImageModal({
  open,
  onOpenChange,
  currentAvatarUrl,
  userName,
  userEmail,
  onAvatarUpdated,
}: ProfileImageModalProps) {
  const { refreshSession } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up preview blob URL when modal closes
  useEffect(() => {
    if (!open) {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl(null);
      setLoading(false);
    }
  }, [open, previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!selectedFile) {
      toast.error("Please select an image first");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image");
      }

      const newAvatarUrl = data.avatar_url;

      // 1. Update client-side Supabase user metadata so session and auth context reflect immediately
      try {
        await supabase.auth.updateUser({
          data: { avatar_url: newAvatarUrl },
        });
      } catch (clientErr) {
        console.error("Failed to updateUser on client:", clientErr);
      }

      // 2. Refresh auth session to ensure sync
      try {
        await refreshSession();
      } catch (refreshErr) {
        console.error("Failed to refresh session:", refreshErr);
      }

      // 3. Inform parent component
      onAvatarUpdated(newAvatarUrl);

      toast.success("Profile picture updated!");
      onOpenChange(false);
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      toast.error(err.message || "Failed to update profile picture");
    } finally {
      setLoading(false);
    }
  };

  const displayAvatar = previewUrl || currentAvatarUrl || undefined;
  const initialChar = userName?.[0]?.toUpperCase() || userEmail?.[0]?.toUpperCase() || "U";

  return (
    <BottomSheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!loading) onOpenChange(isOpen);
      }}
      snapPoints={["auto"]}
      className="max-w-[400px]"
    >
      <div className="flex flex-col items-center text-center space-y-4 pt-2 pb-1">
        {/* Title */}
        <div className="text-xl font-bold tracking-tight text-foreground px-2">
          Update profile picture
        </div>

        {/* Big Rounded Profile Image with Camera Badge (loader at camera) */}
        <div className="flex flex-col items-center justify-center my-1">
          <div
            onClick={() => !loading && fileInputRef.current?.click()}
            className="relative cursor-pointer select-none group"
          >
            <Avatar className="w-28 h-28 rounded-full overflow-hidden transition-transform">
              <AvatarImage src={displayAvatar} className="object-cover w-full h-full" />
              <AvatarFallback className="text-4xl font-bold bg-secondary text-foreground">
                {initialChar}
              </AvatarFallback>
            </Avatar>

            {/* Camera badge button at bottom-right (loader spins here on save) */}
            <div className="absolute bottom-0 right-1 w-7 h-7 rounded-full bg-white/50 dark:bg-[#212121]/50 backdrop-blur-sm border border-border/80 dark:border-none flex items-center justify-center transition-transform">
              {loading ? (
                <Loader className="w-5 h-5 animate-spin text-muted-foreground hover:text-foreground" />
              ) : (
                <Camera className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              )}
            </div>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={loading}
        />

        {/* Info Box Note */}
        <div className="w-full flex items-start gap-2.5 p-3.5 rounded-2xl bg-secondary/50 text-left text-xs text-muted-foreground">
          <Info className="w-4 h-4 shrink-0 text-muted-foreground mt-0.5" />
          <span className="leading-normal">This will be update your profile picture across all CloseAI Platforms.</span>
        </div>

        {/* Action Buttons: Save changes and Cancel */}
        <div className="w-full space-y-2.5 pt-1">
          <button
            type="button"
            onClick={selectedFile ? handleSave : () => fileInputRef.current?.click()}
            disabled={loading}
            className="w-full h-11 rounded-full bg-foreground text-background font-semibold text-sm hover:opacity-90 transition-all cursor-pointer select-none flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {selectedFile ? "Save changes" : "Choose photo"}
          </button>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="w-full h-11 rounded-full border border-border/80 bg-transparent text-foreground font-normal text-sm hover:bg-secondary/60 transition-all cursor-pointer select-none"
          >
            Cancel
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

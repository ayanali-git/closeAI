"use client";

import React, { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";

interface WelcomeScreenProps {
  user?: User | null;
  onPromptSelect?: (prompt: string) => void;
  children?: React.ReactNode;
}

export function WelcomeScreen({
  user,
  onPromptSelect,
  children,
}: WelcomeScreenProps) {
  const [dynamicTitle, setDynamicTitle] = useState<string>(
    "What would you like to explore?"
  );

  useEffect(() => {
    const rawName =
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split("@")[0] ||
      "";

    // Format user name cleanly (e.g., "Ayan Ali" -> "Ayan")
    const formattedName = rawName
      ? rawName
          .split(" ")
          .map((n: string) => n.charAt(0).toUpperCase() + n.slice(1))
          .join(" ")
      : "";
    const firstName = formattedName ? formattedName.split(" ")[0] : "";
    const nameToUse = firstName || formattedName;

    const titlesWithUser = nameToUse
      ? [
          `Hey, ${nameToUse}. Ready to dive in?`,
          `Welcome back, ${nameToUse}. What are we working on today?`,
          `Good to see you, ${nameToUse}. Where should we begin?`,
          `Hey ${nameToUse}, what’s on your mind today?`,
          `What would you like to explore today, ${nameToUse}?`,
          `What are we building today, ${nameToUse}?`,
          `Ready to create something great, ${nameToUse}?`,
          `Hey ${nameToUse}, how can I help you today?`,
          `What idea are we exploring today, ${nameToUse}?`,
          `Where shall we start today, ${nameToUse}?`,
          `What’s on the agenda today, ${nameToUse}?`,
          `Hey ${nameToUse}, what can I assist you with?`,
          `Let’s make something today, ${nameToUse}.`,
          `What can we solve together today, ${nameToUse}?`,
        ]
      : [
          "Where should we begin?",
          "What can I help with today?",
          "What’s on your mind?",
          "Where shall we start?",
          "What would you like to explore?",
          "How can I help you today?",
          "What are we working on today?",
          "What idea are we exploring today?",
          "What do you want to create?",
          "What are we building today?",
        ];

    const randomIndex = Math.floor(Math.random() * titlesWithUser.length);
    setDynamicTitle(titlesWithUser[randomIndex]);
  }, [user]);

  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center text-center select-none pb-6 sm:pb-8">
      <div className="w-full max-w-3xl flex flex-col items-center justify-center space-y-6">
        {/* Dynamic Title */}
        <div className="w-full px-6">
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-foreground/90 animate-in fade-in-50 duration-300">
            {dynamicTitle}
          </h1>
        </div>

        {/* Centered Floating Input Bar */}
        {children && <div className="w-full">{children}</div>}
      </div>
    </div>
  );
}

export default WelcomeScreen;

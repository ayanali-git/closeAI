"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Input } from "@/components/ui/input";
import { AlertCircle, X } from "lucide-react";
import toast from "@/lib/toast";
import { getAuthCallbackUrl } from "@/lib/url";
import { cn } from "@/lib/utils";

interface LoginFormErrors {
  email?: string;
  password?: string;
}

export interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after the user clicks "Sign Up" link — parent can open the signup modal */
  onSwitchToSignup?: () => void;
  /** When true, always render as centered modal (not bottom sheet on mobile) */
  forceModal?: boolean;
  /** Initial error message to display inside the modal */
  initialError?: string | null;
}

export function LoginModal({
  open,
  onOpenChange,
  onSwitchToSignup,
  forceModal,
  initialError,
}: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(initialError || null);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (fields?: Partial<Record<keyof LoginFormErrors, string>>) => {
    const e = fields?.email !== undefined ? fields.email : email;
    const p = fields?.password !== undefined ? fields.password : password;
    const newErrors: LoginFormErrors = {};

    if (!e.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim())) {
      newErrors.email = "Please enter a valid email";
    }

    if (!p) {
      newErrors.password = "Password is required";
    } else if (p.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const handleBlur = (field: keyof LoginFormErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate());
  };

  const handleChange = (
    field: keyof LoginFormErrors,
    value: string,
    setter: (v: string) => void
  ) => {
    setter(value);
    if (touched[field] || submitted) {
      setErrors(validate({ [field]: value }));
    }
  };

  // Sync initialError if provided from parent
  useEffect(() => {
    if (initialError) {
      setAuthError(initialError);
    }
  }, [initialError]);

  // Read URL params when modal opens if an error occurred during OAuth redirect
  useEffect(() => {
    if (open && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const error = params.get("error");
      const errorCode = params.get("error_code");
      const errorDesc = params.get("error_description");
      if (error || errorCode || errorDesc) {
        let message = "Unable to complete sign in. Please try again.";
        if (errorCode === "bad_oauth_state" || errorDesc?.toLowerCase().includes("state")) {
          message = "Your sign-in session expired or was interrupted. Please try signing in again.";
        } else if (errorCode === "access_denied" || error === "access_denied") {
          message = "Sign-in was cancelled. Please try again when ready.";
        } else if (errorDesc) {
          message = decodeURIComponent(errorDesc.replace(/\+/g, " "));
        }
        setAuthError(message);
      }
    }
  }, [open]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setEmail("");
      setPassword("");
      setErrors({});
      setTouched({});
      setSubmitted(false);
      setLoading(false);
      setAuthError(null);
    }
  }, [open]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTouched({ email: true, password: true });

    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;
      onOpenChange(false);
      window.location.href = "/c";
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Clear existing session so the provider always shows the account chooser
      await supabase.auth.signOut();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getAuthCallbackUrl("/c"),
          queryParams: {
            access_type: "offline",
            prompt: "consent select_account",
          },
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with Google");
    }
  };

  const handleGithubLogin = async () => {
    try {
      // Clear existing session so the provider always shows the account chooser
      await supabase.auth.signOut();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: getAuthCallbackUrl("/c"),
          queryParams: {
            prompt: "consent",
          },
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with GitHub");
    }
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={["auto"]}
      className="max-w-[440px]"
      forceModal={forceModal}
    >
      <div className="flex flex-col space-y-5 pt-1 pb-2 relative">
        {/* Top-Right Close Button */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute -top-1.5 -right-2 p-3 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-normal tracking-tight text-foreground">
            Log In
          </h2>
          <p className="text-base text-muted-foreground mt-0.5">
            To continue with CloseAI
          </p>
        </div>

        {/* OAuth Error Alert Banner */}
        {authError && (
          <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-3 relative animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm leading-relaxed font-normal">
              {authError}
            </div>
            <button
              type="button"
              onClick={() => setAuthError(null)}
              className="text-destructive/70 hover:text-destructive hover:bg-destructive/15 p-1 rounded-full border border-transparent hover:bg-destructive/30 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-card transition-colors cursor-pointer shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full h-11 rounded-full bg-foreground text-background font-medium text-base flex items-center justify-center gap-2.5 hover:opacity-90 active:scale-[0.99] border border-transparent focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-card transition-all cursor-pointer select-none"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            Continue with Google
          </button>

          <button
            type="button"
            onClick={handleGithubLogin}
            className="w-full h-11 rounded-full bg-foreground text-background font-medium text-base flex items-center justify-center gap-2.5 hover:opacity-90 active:scale-[0.99] border border-transparent focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-card transition-all cursor-pointer select-none"
          >
            <svg
              className="w-4 h-4 shrink-0 fill-current"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            Continue with GitHub
          </button>
        </div>

        {/* OR Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-base">
            <span className="bg-card px-3 text-muted-foreground font-normal tracking-wider">
              or
            </span>
          </div>
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleEmailLogin} noValidate className="space-y-3">
          <div>
            <Input
              type="email"
              value={email}
              onChange={(e) => handleChange("email", e.target.value, setEmail)}
              onBlur={() => handleBlur("email")}
              placeholder="Email"
              className={cn(
                "h-11 rounded-full bg-card border px-4 placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-card focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-card transition-all",
                errors.email && touched.email
                  ? "border-red-500/80 focus:ring-red-500 focus-visible:ring-red-500"
                  : "border-border/80 focus:ring-blue-500 focus-visible:ring-blue-500"
              )}
            />
            {errors.email && touched.email && (
              <p className="mt-1 text-xs text-red-500 px-3">{errors.email}</p>
            )}
          </div>
          <div>
            <Input
              type="password"
              value={password}
              onChange={(e) => handleChange("password", e.target.value, setPassword)}
              onBlur={() => handleBlur("password")}
              placeholder="Password"
              className={cn(
                "h-11 rounded-full bg-card border px-4 placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-card focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-card transition-all",
                errors.password && touched.password
                  ? "border-red-500/80 focus:ring-red-500 focus-visible:ring-red-500"
                  : "border-border/80 focus:ring-blue-500 focus-visible:ring-blue-500"
              )}
            />
            {errors.password && touched.password && (
              <p className="mt-1 text-xs text-red-500 px-3">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-full bg-foreground text-background font-medium text-base hover:opacity-90 active:scale-[0.99] border border-transparent focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-card transition-all cursor-pointer select-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Logging In..." : "Log In"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground pt-1">
          Don&apos;t have an account?{" "}
          {onSwitchToSignup ? (
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onSwitchToSignup();
              }}
              className="font-normal text-muted-foreground hover:text-foreground cursor-pointer rounded-sm border border-transparent focus-visible:border-blue-500 focus:outline-none focus-visible:outline-none transition-colors"
            >
              Sign Up
            </button>
          ) : (
            <Link
              href="/?auth=signup"
              onClick={() => onOpenChange(false)}
              className="font-normal text-muted-foreground hover:text-foreground rounded-sm border border-transparent focus-visible:border-blue-500 focus:outline-none focus-visible:outline-none transition-colors"
            >
              Sign Up
            </Link>
          )}
        </p>
      </div>
    </BottomSheet>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import toast from "@/lib/toast";
import { getAuthCallbackUrl } from "@/lib/url";
import { AnimatedArrowUpRight } from "@/components/ui/animated";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignupFormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreed?: string;
}

export interface SignupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after the user clicks "Log In" link — parent can open the login modal */
  onSwitchToLogin?: () => void;
  /** When true, always render as centered modal (not bottom sheet on mobile) */
  forceModal?: boolean;
}

export function SignupModal({
  open,
  onOpenChange,
  onSwitchToLogin,
  forceModal,
}: SignupModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<SignupFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (
    fields?: Partial<{
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
      agreed: boolean;
    }>
  ) => {
    const n = fields?.name !== undefined ? fields.name : name;
    const e = fields?.email !== undefined ? fields.email : email;
    const p = fields?.password !== undefined ? fields.password : password;
    const cp = fields?.confirmPassword !== undefined ? fields.confirmPassword : confirmPassword;
    const a = fields?.agreed !== undefined ? fields.agreed : agreed;

    const newErrors: SignupFormErrors = {};

    if (!n.trim()) {
      newErrors.name = "Name is required";
    } else if (n.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

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

    if (!cp) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (p && cp !== p) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!a) {
      newErrors.agreed = "You must agree to the Terms of Use and Privacy Policy";
    }

    return newErrors;
  };

  const handleBlur = (field: keyof SignupFormErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate());
  };

  const handleChange = (
    field: keyof SignupFormErrors,
    value: string,
    setter: (v: string) => void
  ) => {
    setter(value);
    if (touched[field] || submitted) {
      setErrors(validate({ [field]: value }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (touched.password || submitted || touched.confirmPassword) {
      setErrors(validate({ password: value }));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (touched.confirmPassword || submitted) {
      setErrors(validate({ confirmPassword: value }));
    }
  };

  const handleAgreeChange = (checked: boolean) => {
    setAgreed(checked);
    if (touched.agreed || submitted) {
      setErrors(validate({ agreed: checked }));
    }
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setAgreed(false);
      setErrors({});
      setTouched({});
      setSubmitted(false);
      setLoading(false);
    }
  }, [open]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      agreed: true,
    });

    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
          emailRedirectTo: getAuthCallbackUrl("/c"),
        },
      });

      if (error) throw error;

      if (data?.user && !data?.session) {
        toast.success(
          "Account created! Please check your email to confirm your account."
        );
        onOpenChange(false);
        router.push("/?auth=login");
      } else {
        toast.success("Account created successfully");
        onOpenChange(false);
        window.location.href = "/c";
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
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
      toast.error(error.message || "Failed to sign up with Google");
    }
  };

  const handleGithubSignup = async () => {
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
      toast.error(error.message || "Failed to sign up with GitHub");
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
            Log In or Sign Up
          </h2>
          <p className="text-base text-muted-foreground mt-1.5">
            To start with CloseAI
          </p>
        </div>

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

        {/* Signup Form */}
        <form onSubmit={handleSignup} noValidate className="space-y-2.5">
          <div>
            <Input
              type="text"
              value={name}
              onChange={(e) => handleChange("name", e.target.value, setName)}
              onBlur={() => handleBlur("name")}
              placeholder="Name"
              className={cn(
                "h-11 rounded-full bg-card border px-4 placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-card focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-card transition-all",
                errors.name && touched.name
                  ? "border-red-500/80 focus:ring-red-500 focus-visible:ring-red-500"
                  : "border-border/80 focus:ring-blue-500 focus-visible:ring-blue-500"
              )}
            />
            {errors.name && touched.name && (
              <p className="mt-1 text-xs text-red-500 px-3">{errors.name}</p>
            )}
          </div>
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
              onChange={(e) => handlePasswordChange(e.target.value)}
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
          <div>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
              onBlur={() => handleBlur("confirmPassword")}
              placeholder="Confirm password"
              className={cn(
                "h-11 rounded-full bg-card border px-4 placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-card focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-card transition-all",
                errors.confirmPassword && touched.confirmPassword
                  ? "border-red-500/80 focus:ring-red-500 focus-visible:ring-red-500"
                  : "border-border/80 focus:ring-blue-500 focus-visible:ring-blue-500"
              )}
            />
            {errors.confirmPassword && touched.confirmPassword && (
              <p className="mt-1 text-xs text-red-500 px-3">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Terms checkbox */}
          <div>
            <div className="flex items-start space-x-2.5 pt-0.5">
              <Checkbox
                id="signup-terms"
                checked={agreed}
                onCheckedChange={(checked) => handleAgreeChange(checked === true)}
                onBlur={() => handleBlur("agreed")}
                className={cn(
                  "mt-0.5 focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-card focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-card transition-all",
                  errors.agreed && touched.agreed
                    ? "border-red-500 focus:ring-red-500 focus-visible:ring-red-500"
                    : "focus:ring-blue-500 focus-visible:ring-blue-500"
                )}
              />
              <label
                htmlFor="signup-terms"
                className="text-sm text-muted-foreground leading-snug cursor-pointer select-none"
              >
                I agree to the{" "}
                <Link
                  href="/support/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 align-baseline text-muted-foreground hover:text-foreground font-normal rounded-sm border border-transparent focus-visible:border-blue-500 focus:outline-none focus-visible:outline-none transition-colors"
                >
                  Terms of Use
                  <AnimatedArrowUpRight size={18} className="shrink-0" />
                </Link>{" "}
                and{" "}
                <Link
                  href="/support/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 align-baseline text-muted-foreground hover:text-foreground font-normal rounded-sm border border-transparent focus-visible:border-blue-500 focus:outline-none focus-visible:outline-none transition-colors"
                >
                  Privacy Policy
                  <AnimatedArrowUpRight size={18} className="shrink-0" />
                </Link>
              </label>
            </div>
            {errors.agreed && touched.agreed && (
              <p className="mt-1 text-xs text-red-500 px-1">{errors.agreed}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-full bg-foreground text-background font-medium text-base hover:opacity-90 active:scale-[0.99] border border-transparent focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-card transition-all cursor-pointer select-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground pt-1">
          Already have an account?{" "}
          {onSwitchToLogin ? (
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onSwitchToLogin();
              }}
              className="font-normal text-muted-foreground hover:text-foreground cursor-pointer rounded-sm border border-transparent focus-visible:border-blue-500 focus:outline-none focus-visible:outline-none transition-colors"
            >
              Log In
            </button>
          ) : (
            <Link
              href="/?auth=login"
              onClick={() => onOpenChange(false)}
              className="font-normal text-muted-foreground hover:text-foreground rounded-sm border border-transparent focus-visible:border-blue-500 focus:outline-none focus-visible:outline-none transition-colors"
            >
              Log In
            </Link>
          )}
        </p>
      </div>
    </BottomSheet>
  );
}

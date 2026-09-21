"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { CloseAIIcon } from "@/components/brand/logo";
import toast from "@/lib/toast";
import { getAuthCallbackUrl } from "@/lib/url";
import { AnimatedArrowUpRight } from "@/components/ui/animated";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!agreed) {
      toast.error("Please agree to the Terms of Service");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: getAuthCallbackUrl("/c"),
        },
      });

      if (error) throw error;

      if (data?.user && !data?.session) {
        toast.success(
          "Account created! Please check your email to confirm your account."
        );
        router.push("/auth/login");
      } else {
        toast.success("Account created successfully");
        window.location.href = "/c";
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getAuthCallbackUrl("/c"),
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
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
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: getAuthCallbackUrl("/c"),
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up with GitHub");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-8 select-none">
      <div className="max-w-[520px] w-full bg-card text-card-foreground p-8 rounded-3xl border border-border">
        {/* Header */}
        <div className="text-center mb-7 flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-card flex items-center justify-center mb-4 border border-border/80">
            <CloseAIIcon size={26} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
            Sign Up
          </h1>
          <p className="text-md text-muted-foreground">
            To Start with CloseAI
          </p>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-2.5 mb-5">
          <Button
            variant="outline"
            type="button"
            className="w-full h-11 rounded-xl border border-border font-medium hover:bg-secondary text-muted-foreground group-hover:text-foreground transition-colors flex items-center justify-center gap-2.5"
            onClick={handleGoogleSignup}
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
            <span className="text-md">Continue with Google</span>
          </Button>

          <Button
            variant="outline"
            type="button"
            className="w-full h-11 rounded-xl border border-border font-medium hover:bg-secondary text-muted-foreground group-hover:text-foreground transition-colors flex items-center justify-center gap-2.5"
            onClick={handleGithubSignup}
          >
            <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span className="text-md">Continue with GitHub</span>
          </Button>
        </div>

        {/* Divider */}
        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-md">
            <span className="bg-card px-3 text-muted-foreground uppercase font-semibold text-[15px] tracking-wider">
              or
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-3.5">
          <div className="space-y-1.5">
            <Label
              htmlFor="name"
              className="text-md font-semibold text-foreground"
            >
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              className="h-10 rounded-xl bg-card focus:bg-secondary border border-border/80 placeholder:text-muted-foreground focus:placeholder:text-foreground transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="text-md font-semibold text-foreground"
            >
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="h-10 rounded-xl bg-card focus:bg-secondary border border-border/80 placeholder:text-muted-foreground focus:placeholder:text-foreground transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="password"
              className="text-md font-semibold text-foreground"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="h-10 rounded-xl bg-card focus:bg-secondary border border-border/80 placeholder:text-muted-foreground focus:placeholder:text-foreground transition-colors"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="confirmPassword"
              className="text-md font-semibold text-foreground"
            >
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Enter your password again"
              required
              className="h-10 rounded-xl bg-card focus:bg-secondary border border-border/80 placeholder:text-muted-foreground focus:placeholder:text-foreground transition-colors"
            />
          </div>

          <div className="flex items-start space-x-2.5 pt-1">
            <Checkbox
              id="terms"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked === true)}
              className="mt-0.5"
            />
            <label
              htmlFor="terms"
              className="text-base text-foreground leading-snug cursor-pointer select-none"
            >
              I agree to the{" "}
              <Link
                href="/support/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground font-normal"
              >
                Terms of Use
                <AnimatedArrowUpRight className="w-3 h-3 inline-block mr-1" />
              </Link>{" "}
              and{" "}
              <Link
                href="/support/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground font-normal"
              >
                Privacy Policy
                <AnimatedArrowUpRight className="w-3 h-3 inline-block" />
              </Link>
            </label>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-foreground text-background hover:bg-foreground/90 font-medium rounded-xl mt-3 transition-all cursor-pointer"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-md text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-muted-foreground hover:text-foreground"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}

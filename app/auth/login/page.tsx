'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { CloseAIIcon } from '@/components/brand/logo';
import toast from '@/lib/toast';
import { getAuthCallbackUrl } from '@/lib/url';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      window.location.href = '/c';
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getAuthCallbackUrl('/c'),
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline',
          },
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with Google');
    }
  };

  const handleGithubLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: getAuthCallbackUrl('/c'),
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with GitHub');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center  p-4 select-none">
      <div className="max-w-[520px] w-full bg-card text-card-foreground p-8 rounded-3xl border border-border">
        {/* Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-4 border border-border/80 dark:border-none">
            <CloseAIIcon size={26} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Welcome back</h1>
          <p className="text-md text-muted-foreground">Sign in to continue to closeAI</p>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-2.5 mb-5">
          <Button 
            variant="outline" 
            type="button" 
            className="w-full h-11 rounded-xl border border-border font-medium  hover:bg-secondary text-foreground transition-colors flex items-center justify-center gap-2.5"
            onClick={handleGoogleLogin}
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
            className="w-full h-11 rounded-xl border border-border font-medium  hover:bg-secondary text-foreground transition-colors flex items-center justify-center gap-2.5"
            onClick={handleGithubLogin}
          >
            <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
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
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-md font-semibold text-foreground">
              Email address
            </Label>
            <Input 
              id="email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required 
              className="h-11 rounded-xl border-border text-foreground placeholder:text-muted-foreground focus:placeholder:text-foreground transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-md font-semibold text-foreground">
                Password
              </Label>
            </div>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required 
                className="h-11 rounded-xl border-border text-foreground placeholder:text-muted-foreground focus:placeholder:text-foreground transition-colors"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full h-11 bg-foreground text-background hover:bg-foreground/90 font-medium rounded-xl mt-3 transition-all cursor-pointer disabled:pointer-events-auto disabled:cursor-not-allowed cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-md text-muted-foreground mt-6">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="font-semibold text-muted-foreground hover:text-foreground">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
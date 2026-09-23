'use client';
import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/components/subscription-provider';
import { supabase } from '@/lib/supabase';
import { toast } from '@/lib/toast';
import {
  ChevronLeft,
  Camera,
  User,
  Shield,
  Bell,
  Loader,
  Check,
  Upload,
  Pencil,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ProfileImageModal } from '@/components/modals/profile-image-modal';

export default function SettingsPage() {
  const { user, loading, refreshSession } = useAuth();
  const { plan: userPlan } = useSubscription();
  const [profile, setProfile] = useState({ name: '', email: '', plan: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const router = useRouter();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  const planLabels: { [key: string]: string } = {
    'free': 'Free',
    'pro': 'Pro',
    'ultra': 'Ultra Pro',
    'plus': 'Plus'
  };

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.user_metadata?.name || user.user_metadata?.full_name || '',
        email: user.email || '',
        plan: user.user_metadata?.plan || 'free',
      });
      setAvatarUrl(user.user_metadata?.avatar_url || null);
    }
  }, [user]);

  const initialName = user?.user_metadata?.name || user?.user_metadata?.full_name || '';
  const isNameChanged = profile.name.trim() !== initialName.trim();
  const isSaveDisabled = saving || !profile.name.trim() || !isNameChanged;

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaveDisabled) return;
    setSaving(true);
    try {
      const trimmedName = profile.name.trim();

      // 1. Update profiles table in Supabase
      if (user?.id) {
        await supabase
          .from('profiles')
          .update({ name: trimmedName })
          .eq('id', user.id);
      }

      // 2. Update Supabase Auth user metadata (both name and full_name)
      const { error } = await supabase.auth.updateUser({
        data: {
          name: trimmedName,
          full_name: trimmedName,
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        // 3. Immediately refresh session so Sidebar, Header, etc. update dynamically
        await refreshSession();
        router.refresh();
        toast.success('Profile updated!');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Password changed successfully!');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="chat-selection-theme selection:bg-secondary selection:text-foreground min-h-screen bg-background">
      <div className="border-b border-border sticky top-0 z-10 bg-background">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-foreground cursor-pointer group/btn"
            onClick={() => router.push('/c')}
          >
            <ChevronLeft className="w-4 h-4 mr-1 text-muted-foreground group-hover/btn:text-foreground" />
            Back
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-foreground mb-1">Settings</h1>
        <p className="text-md text-muted-foreground mb-8">Manage your profile and account</p>

        <div className="space-y-8">
          {/* Profile Section */}
          <div>
            <h2 className="text-base font-medium text-foreground mb-4 flex items-center gap-2">
              Profile
            </h2>
            <div className="border border-border rounded-2xl p-6 space-y-6">
              <div className="flex items-center gap-6">
                <div className="group relative">
                  <Avatar 
                    className="w-20 h-20 border border-border cursor-pointer transition-opacity"
                    onClick={() => setIsImageModalOpen(true)}
                  >
                    <AvatarImage src={avatarUrl || undefined} />
                    <AvatarFallback className="bg-secondary text-foreground text-xl font-medium">
                      {profile.name}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={() => setIsImageModalOpen(true)}
                    className="absolute bottom-1 right-0 w-5 h-5 rounded-full bg-white/50 dark:bg-[#212121]/50 backdrop-blur-sm border border-border/80 dark:border-none flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Update profile picture"
                  >
                    <Pencil className="w-3 h-3 text-muted-foreground group-hover:text-foreground" />
                  </button>
                </div>
                <div>
                  <p className="text-base font-medium text-foreground">Update profile picture</p>
                  <p className="text-sm text-muted-foreground">Click avatar to update</p>
                </div>
              </div>

              <Separator />

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={profile.email} disabled className="text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Email cannot be changed</p>
                </div>
                <Button
                  type="submit"
                  className="w-full cursor-pointer disabled:pointer-events-auto disabled:cursor-not-allowed"
                  disabled={isSaveDisabled}
                >
                  {saving ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Save changes</span>
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Subscription */}
          <div>
            <h2 className="text-base font-medium text-foreground mb-4">Subscription</h2>
            <div className="border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-medium text-foreground">
                    Current plan: {planLabels[userPlan] || 'Free'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {userPlan === 'free'
                      ? 'Upgrade to unlock more features'
                      : 'You have access to premium features'}
                  </p>
                </div>
                <Button
                  variant={userPlan === 'free' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => router.push('/upgrade')}
                >
                  {userPlan === 'free' ? 'Upgrade' : 'Manage'}
                </Button>
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <h2 className="text-base font-medium text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Password
            </h2>
            <div className="border border-border rounded-2xl p-6">
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full cursor-pointer disabled:pointer-events-auto disabled:cursor-not-allowed"
                  disabled={saving || !newPassword || !confirmPassword}
                >
                  {saving ? <Loader className="w-4 h-4 animate-spin" /> : 'Update password'}
                </Button>
              </form>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h2 className="text-base font-medium text-foreground mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </h2>
            <div className="border border-border rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-medium text-foreground">Email notifications</p>
                  <p className="text-sm text-muted-foreground">Receive updates about your conversations</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-medium text-foreground">Marketing emails</p>
                  <p className="text-sm text-muted-foreground">Receive news and promotional content</p>
                </div>
                <Switch checked={marketingEmails} onCheckedChange={setMarketingEmails} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProfileImageModal
        open={isImageModalOpen}
        onOpenChange={setIsImageModalOpen}
        currentAvatarUrl={avatarUrl}
        userName={profile.name}
        userEmail={profile.email}
        onAvatarUpdated={(newUrl) => setAvatarUrl(newUrl)}
      />
    </div>
  );
}
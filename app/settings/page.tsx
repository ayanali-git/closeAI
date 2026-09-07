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
  Upload
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const { plan: userPlan } = useSubscription();
  const [profile, setProfile] = useState({ name: '', email: '', plan: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
        name: user.user_metadata?.name || '',
        email: user.email || '',
        plan: user.user_metadata?.plan || 'free',
      });
      setAvatarUrl(user.user_metadata?.avatar_url || null);
    }
  }, [user]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('bucket')) {
          const reader = new FileReader();
          reader.onload = async (e) => {
            const base64Url = e.target?.result as string;
            const { error: updateError } = await supabase.auth.updateUser({
              data: { avatar_url: base64Url },
            });
            if (updateError) throw updateError;
            setAvatarUrl(base64Url);
            toast.success('Profile picture updated!');
          };
          reader.readAsDataURL(file);
          return;
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) throw updateError;
      setAvatarUrl(publicUrl);
      toast.success('Profile picture updated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name: profile.name },
      });
      if (error) {
        toast.error(error.message);
      } else {
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
    <div className="min-h-screen bg-background">
      <div className="border-b border-border sticky top-0 z-10 bg-background">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => router.push('/c')}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
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
              <User className="w-4 h-4" />
              Profile
            </h2>
            <div className="border border-border rounded-2xl p-6 space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={avatarUrl || undefined} />
                    <AvatarFallback className="bg-secondary text-foreground text-xl font-medium">
                      {profile.name?.[0] || profile.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 text-white" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                <div>
                  <p className="text-md font-medium text-foreground">Profile picture</p>
                  <p className="text-md text-muted-foreground mb-2">Click avatar to change</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="w-4 h-4 mr-1.5" />
                    Upload
                  </Button>
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
                  <p className="text-md text-muted-foreground">Email cannot be changed</p>
                </div>
                <Button type="submit" className="w-full disabled:pointer-events-auto disabled:cursor-not-allowed cursor-not-allowed" disabled={saving}>
                  {saving ? (
                    <><Loader className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                  ) : (
                    <><Check className="w-4 h-4 mr-2" />Save changes</>
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
                  <p className="text-md font-medium text-foreground">
                    Current plan: {planLabels[userPlan] || 'Free'}
                  </p>
                  <p className="text-md text-muted-foreground mt-1">
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

          {/* Security */}
          <div>
            <h2 className="text-base font-medium text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
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
                  className="w-full"
                  disabled={saving || !newPassword || !confirmPassword}
                >
                  {saving ? 'Updating...' : 'Update password'}
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
                  <p className="text-md font-medium text-foreground">Email notifications</p>
                  <p className="text-md text-muted-foreground">Receive updates about your conversations</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-md font-medium text-foreground">Marketing emails</p>
                  <p className="text-md text-muted-foreground">Receive news and promotional content</p>
                </div>
                <Switch checked={marketingEmails} onCheckedChange={setMarketingEmails} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Palette, 
  Shield, 
  LogOut, 
  Loader2, 
  Camera,
  Save,
  Trash2
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Settings() {
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Profile Form State
  const [formData, setFormData] = useState({
    fullName: '',
    headline: '',
    bio: '',
    website: '',
    avatarUrl: ''
  });

  // Load initial data
  useEffect(() => {
    if (user) {
      // 1. Try to get data from metadata (if stored there)
      const meta = user.user_metadata || {};
      
      // 2. Or fetch from a 'profiles' table if you have one
      // For this example, we'll rely on auth metadata to keep it simple
      setFormData({
        fullName: meta.full_name || '',
        headline: meta.headline || '',
        bio: meta.bio || '',
        website: meta.website || '',
        avatarUrl: meta.avatar_url || ''
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    try {
      // Update Supabase Auth Metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          headline: formData.headline,
          bio: formData.bio,
          website: formData.website,
          avatar_url: formData.avatarUrl
        }
      });

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    const email = user?.email;
    if (!email) return;
    
    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/auth/update-password',
      });
      toast.success('Password reset email sent!');
    } catch (error) {
      toast.error('Failed to send reset email');
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-10">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500 mt-2">Manage your account preferences and profile.</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full justify-start bg-transparent border-b border-slate-200 rounded-none h-auto p-0 gap-6">
            <TabsTrigger 
              value="profile" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-0 py-3"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="account" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-0 py-3"
            >
              Account
            </TabsTrigger>
            <TabsTrigger 
              value="appearance" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-0 py-3"
            >
              Appearance
            </TabsTrigger>
          </TabsList>

          {/* --- PROFILE TAB --- */}
          <TabsContent value="profile" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Public Profile</CardTitle>
                <CardDescription>This is how others will see you on the platform.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Avatar Upload */}
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                      <AvatarImage src={formData.avatarUrl} />
                      <AvatarFallback className="text-2xl bg-indigo-50 text-indigo-600">
                        {user?.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium">Profile Picture</h3>
                    <p className="text-xs text-slate-500">JPG, GIF or PNG. Max size of 2MB.</p>
                    <Button variant="outline" size="sm" className="mt-2">Upload New</Button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input 
                      value={formData.fullName} 
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                      placeholder="e.g. Jane Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Headline / Job Title</Label>
                    <Input 
                      value={formData.headline} 
                      onChange={(e) => setFormData({...formData, headline: e.target.value})} 
                      placeholder="e.g. Senior React Developer"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea 
                    value={formData.bio} 
                    onChange={(e) => setFormData({...formData, bio: e.target.value})} 
                    placeholder="Tell us a little about yourself..."
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-slate-400 text-right">
                    {formData.bio.length}/300 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Portfolio / Website</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">https://</span>
                    <Input 
                      className="pl-16" 
                      value={formData.website} 
                      onChange={(e) => setFormData({...formData, website: e.target.value})} 
                      placeholder="your-portfolio.com"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-slate-100 pt-6 flex justify-end">
                <Button onClick={handleUpdateProfile} disabled={isSaving} className="bg-slate-900 text-white">
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* --- ACCOUNT TAB --- */}
          <TabsContent value="account" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Manage your email and password.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <div className="flex gap-2">
                    <Input value={user?.email} disabled className="bg-slate-50 text-slate-500" />
                    <Button variant="outline" disabled>Verified</Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="font-medium mb-2">Password</h3>
                  <p className="text-sm text-slate-500 mb-4">You can reset your password by receiving a link on your email.</p>
                  <Button variant="outline" onClick={handlePasswordReset}>
                    <Lock className="w-4 h-4 mr-2" />
                    Send Password Reset Email
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-100 bg-red-50/30">
              <CardHeader>
                <CardTitle className="text-red-700">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Delete Account</p>
                  <p className="text-sm text-slate-500">Permanently remove your account and all of its content.</p>
                </div>
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- APPEARANCE TAB --- */}
          <TabsContent value="appearance" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how the app looks on your device.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Dark Mode</Label>
                    <p className="text-sm text-slate-500">Switch between light and dark themes</p>
                  </div>
                  <Switch disabled /> {/* Placeholder for now */}
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Reduced Motion</Label>
                    <p className="text-sm text-slate-500">Disable complex animations</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </MainLayout>
  );
}
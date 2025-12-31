import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Award, MessageSquare, ThumbsUp, Save, Loader2, Check, Settings } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useProgressStats } from '@/hooks/useUserProgress';
import { useUserSettings, useUpdateSettings } from '@/hooks/useUserSettings';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const availableTracks = [
  { id: 'frontend', title: 'Frontend', color: 'from-blue-500 to-cyan-500' },
  { id: 'backend', title: 'Backend', color: 'from-green-500 to-emerald-500' },
  { id: 'devops', title: 'DevOps', color: 'from-orange-500 to-amber-500' },
  { id: 'system-design', title: 'System Design', color: 'from-purple-500 to-violet-500' },
  { id: 'data-structures', title: 'Data Structures', color: 'from-pink-500 to-rose-500' },
  { id: 'algorithms', title: 'Algorithms', color: 'from-indigo-500 to-blue-500' },
  { id: 'security', title: 'Security', color: 'from-red-500 to-orange-500' },
  { id: 'mobile', title: 'Mobile', color: 'from-teal-500 to-cyan-500' },
  { id: 'web', title: 'Web Fundamentals', color: 'from-yellow-500 to-orange-500' },
];

export default function Profile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const progressStats = useProgressStats();
  const { data: settings } = useUserSettings();
  const updateSettings = useUpdateSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);

  // Fetch profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      if (data) {
        setDisplayName(data.name || '');
        setAvatarUrl(data.avatar_url || '');
      }
      return data;
    },
    enabled: !!user
  });

  // Initialize selected tracks from settings
  useState(() => {
    if (settings?.interested_categories) {
      setSelectedTracks(settings.interested_categories);
    }
  });

  // Fetch user's contributed questions count
  const { data: userQuestions } = useQuery({
    queryKey: ['user-questions-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('created_by_id', user.id);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user
  });

  // Fetch user's votes count
  const { data: userVotes } = useQuery({
    queryKey: ['user-votes-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from('question_votes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async ({ name, avatar_url }: { name: string; avatar_url: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('profiles')
        .update({ name, avatar_url })
        .eq('id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile');
    }
  });

  const handleSave = () => {
    updateProfile.mutate({ name: displayName, avatar_url: avatarUrl });
  };

  const toggleTrack = (trackId: string) => {
    const newTracks = selectedTracks.includes(trackId)
      ? selectedTracks.filter(id => id !== trackId)
      : [...selectedTracks, trackId];
    
    setSelectedTracks(newTracks);
  };

  const saveTrackPreferences = async () => {
    try {
      await updateSettings.mutateAsync({
        interested_categories: selectedTracks.length > 0 ? selectedTracks : null
      });
      toast.success('Track preferences saved!');
    } catch (error) {
      toast.error('Failed to save preferences');
    }
  };

  const memberSince = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      })
    : 'Unknown';

  const masteryPercentage = progressStats.percentComplete;

  if (!user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Please log in to view your profile.</p>
        </div>
      </MainLayout>
    );
  }

  // Sync selected tracks with settings
  if (settings?.interested_categories && selectedTracks.length === 0) {
    setSelectedTracks(settings.interested_categories);
  }

  return (
    <MainLayout>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="space-y-8 max-w-4xl mx-auto"
      >
        {/* Header */}
        <div>
          <h1 className="text-3xl lg:text-4xl font-serif font-bold text-foreground mb-2">
            Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        {/* Profile Card */}
        <div className="soft-card p-6 flex flex-col md:flex-row gap-8 items-start">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-24 h-24 border-2 border-primary/30">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                {(profile?.name || user.email)?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            {!isEditing && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </div>

          {/* Info Section */}
          <div className="flex-1 space-y-6">
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatarUrl">Avatar URL</Label>
                  <Input
                    id="avatarUrl"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSave}
                    disabled={updateProfile.isPending}
                    className="gap-2"
                  >
                    {updateProfile.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      setDisplayName(profile?.name || '');
                      setAvatarUrl(profile?.avatar_url || '');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium text-foreground">{profile?.name || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Member since</p>
                    <p className="font-medium text-foreground">{memberSince}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* My Tracks Section */}
        <div className="soft-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-serif font-semibold text-foreground">My Tracks</h3>
            </div>
            {selectedTracks.length > 0 && (
              <Button
                size="sm"
                onClick={saveTrackPreferences}
                disabled={updateSettings.isPending}
              >
                {updateSettings.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Save Preferences'
                )}
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Select the topics you want to focus on. Content will be filtered based on your selection.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableTracks.map((track) => {
              const isSelected = selectedTracks.includes(track.id);
              return (
                <button
                  key={track.id}
                  onClick={() => toggleTrack(track.id)}
                  className={cn(
                    "relative px-4 py-3 rounded-xl border-2 text-left transition-all duration-200",
                    isSelected 
                      ? "border-primary bg-primary/5" 
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                  <span className={cn(
                    "font-medium text-sm",
                    isSelected ? "text-primary" : "text-foreground"
                  )}>
                    {track.title}
                  </span>
                </button>
              );
            })}
          </div>
          {selectedTracks.length === 0 && (
            <p className="text-xs text-muted-foreground mt-3">
              No tracks selected — you'll see all content.
            </p>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="soft-card p-6 text-center"
          >
            <MessageSquare className="w-8 h-8 text-primary mx-auto mb-3" />
            <p className="text-3xl font-serif font-bold text-foreground">
              {userQuestions || 0}
            </p>
            <p className="text-sm text-muted-foreground">Questions Added</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="soft-card p-6 text-center"
          >
            <ThumbsUp className="w-8 h-8 text-primary mx-auto mb-3" />
            <p className="text-3xl font-serif font-bold text-foreground">
              {userVotes || 0}
            </p>
            <p className="text-sm text-muted-foreground">Votes Cast</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="soft-card p-6 text-center"
          >
            <Award className="w-8 h-8 text-success mx-auto mb-3" />
            <p className="text-3xl font-serif font-bold text-success">
              {masteryPercentage}%
            </p>
            <p className="text-sm text-muted-foreground">Mastery Progress</p>
          </motion.div>
        </div>

        {/* Progress Overview */}
        <div className="soft-card p-6">
          <h3 className="text-lg font-serif font-semibold text-foreground mb-4">Learning Progress</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <p className="text-2xl font-serif font-bold text-foreground">{progressStats.totalQuestions}</p>
              <p className="text-xs text-muted-foreground">Total Questions</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-success/10">
              <p className="text-2xl font-serif font-bold text-success">{progressStats.mastered}</p>
              <p className="text-xs text-muted-foreground">Mastered</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-warning/10">
              <p className="text-2xl font-serif font-bold text-warning">{progressStats.review}</p>
              <p className="text-xs text-muted-foreground">In Review</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <p className="text-2xl font-serif font-bold text-muted-foreground">{progressStats.newQuestions}</p>
              <p className="text-xs text-muted-foreground">Not Started</p>
            </div>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
}

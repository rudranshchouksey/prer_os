import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Award, MessageSquare, ThumbsUp, Save, Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useProgressStats } from '@/hooks/useUserProgress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export default function Profile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const progressStats = useProgressStats();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

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
          <h1 className="text-3xl lg:text-4xl font-bold gradient-text mb-2">
            Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your account and view your stats
          </p>
        </div>

        {/* Profile Card */}
        <GlassCard className="flex flex-col md:flex-row gap-8 items-start">
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
                    className="bg-dark-800 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatarUrl">Avatar URL</Label>
                  <Input
                    id="avatarUrl"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="bg-dark-800 border-border"
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
                    <p className="font-medium">{profile?.name || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Member since</p>
                    <p className="font-medium">{memberSince}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard className="text-center">
              <MessageSquare className="w-8 h-8 text-secondary mx-auto mb-3" />
              <p className="text-3xl font-bold font-mono text-secondary">
                {userQuestions || 0}
              </p>
              <p className="text-sm text-muted-foreground">Questions Added</p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="text-center">
              <ThumbsUp className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="text-3xl font-bold font-mono text-primary">
                {userVotes || 0}
              </p>
              <p className="text-sm text-muted-foreground">Votes Cast</p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="text-center">
              <Award className="w-8 h-8 text-success mx-auto mb-3" />
              <p className="text-3xl font-bold font-mono text-success">
                {masteryPercentage}%
              </p>
              <p className="text-sm text-muted-foreground">Mastery Progress</p>
            </GlassCard>
          </motion.div>
        </div>

        {/* Progress Overview */}
        <GlassCard>
          <h3 className="text-lg font-semibold mb-4">Learning Progress</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-xl bg-dark-800/50">
              <p className="text-2xl font-bold font-mono">{progressStats.totalQuestions}</p>
              <p className="text-xs text-muted-foreground">Total Questions</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-dark-800/50">
              <p className="text-2xl font-bold font-mono text-success">{progressStats.mastered}</p>
              <p className="text-xs text-muted-foreground">Mastered</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-dark-800/50">
              <p className="text-2xl font-bold font-mono text-warning">{progressStats.review}</p>
              <p className="text-xs text-muted-foreground">In Review</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-dark-800/50">
              <p className="text-2xl font-bold font-mono text-muted-foreground">{progressStats.newQuestions}</p>
              <p className="text-xs text-muted-foreground">Not Started</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </MainLayout>
  );
}

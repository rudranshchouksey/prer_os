import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Calendar, 
  Award, 
  MessageSquare, 
  ThumbsUp, 
  Save, 
  Loader2, 
  Check, 
  Settings,
  Edit2,
  Camera,
  Target,
  Zap,
  BookOpen
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
  { id: 'frontend', title: 'Frontend', color: 'bg-blue-500', icon: 'Layout' },
  { id: 'backend', title: 'Backend', color: 'bg-green-500', icon: 'Server' },
  { id: 'devops', title: 'DevOps', color: 'bg-orange-500', icon: 'Cloud' },
  { id: 'system-design', title: 'System Design', color: 'bg-purple-500', icon: 'Box' },
  { id: 'data-structures', title: 'Data Structures', color: 'bg-pink-500', icon: 'Database' },
  { id: 'algorithms', title: 'Algorithms', color: 'bg-indigo-500', icon: 'Code' },
  { id: 'security', title: 'Security', color: 'bg-red-500', icon: 'Shield' },
  { id: 'mobile', title: 'Mobile', color: 'bg-teal-500', icon: 'Smartphone' },
  { id: 'web', title: 'Web Fundamentals', color: 'bg-yellow-500', icon: 'Globe' },
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
  const { data: profile } = useQuery({
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

  // Sync state with settings
  useState(() => {
    if (settings?.interested_categories) {
      setSelectedTracks(settings.interested_categories);
    }
  });

  // Fetch stats
  const { data: userQuestions } = useQuery({
    queryKey: ['user-questions-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('created_by_id', user.id);
      return count || 0;
    },
    enabled: !!user
  });

  const { data: userVotes } = useQuery({
    queryKey: ['user-votes-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await supabase.from('question_votes').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
      return count || 0;
    },
    enabled: !!user
  });

  // Mutations
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
      toast.success('Profile updated');
      setIsEditing(false);
    },
    onError: () => toast.error('Failed to update profile')
  });

  const handleSave = () => updateProfile.mutate({ name: displayName, avatar_url: avatarUrl });

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
      toast.success('Preferences saved');
    } catch {
      toast.error('Failed to save preferences');
    }
  };

  const memberSince = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Unknown';

  if (!user) return <MainLayout><div className="flex items-center justify-center h-96">Please log in.</div></MainLayout>;

  return (
    <MainLayout className="bg-slate-50/50">
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="max-w-5xl mx-auto space-y-8 p-4 md:p-8 pb-24"
      >
        {/* --- Profile Header Card --- */}
        <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Cover Banner */}
          <div className="h-32 bg-gradient-to-r from-purple-100 to-blue-100 border-b border-slate-100" />
          
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row gap-6 items-start -mt-12">
              
              {/* Avatar */}
              <div className="relative group">
                <Avatar className="w-28 h-28 border-4 border-white shadow-md bg-white">
                  <AvatarImage src={profile?.avatar_url || undefined} className="object-cover" />
                  <AvatarFallback className="bg-slate-100 text-slate-400 text-3xl font-bold">
                    {(profile?.name || user.email)?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 mt-2 md:mt-12 space-y-1">
                {isEditing ? (
                  <div className="space-y-4 max-w-md">
                    <div className="space-y-2">
                        <Label>Display Name</Label>
                        <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Avatar URL</Label>
                        <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Button onClick={handleSave} disabled={updateProfile.isPending} className="bg-slate-900 text-white">
                            {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            {profile?.name || 'User'}
                            <Badge variant="secondary" className="font-normal text-xs bg-slate-100 text-slate-600">
                                Pro Member
                            </Badge>
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                            <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {user.email}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Joined {memberSince}</span>
                        </div>
                    </div>
                    <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2">
                        <Edit2 className="w-4 h-4" /> Edit Profile
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- Stats Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                    <Award className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-slate-900">{progressStats.percentComplete}%</p>
                    <p className="text-sm text-slate-500">Mastery</p>
                </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-slate-900">{userQuestions || 0}</p>
                    <p className="text-sm text-slate-500">Contributions</p>
                </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                    <ThumbsUp className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-slate-900">{userVotes || 0}</p>
                    <p className="text-sm text-slate-500">Votes Cast</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* --- Left Column: Track Selection --- */}
            <div className="md:col-span-8 space-y-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Target className="w-5 h-5 text-purple-600" /> My Tracks
                            </h2>
                            <p className="text-sm text-slate-500">Customize your learning path</p>
                        </div>
                        {selectedTracks.length > 0 && (
                            <Button size="sm" onClick={saveTrackPreferences} disabled={updateSettings.isPending} className="bg-slate-900 text-white">
                                {updateSettings.isPending && <Loader2 className="w-3 h-3 animate-spin mr-2" />}
                                Save
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {availableTracks.map((track) => {
                            const isSelected = selectedTracks.includes(track.id);
                            return (
                                <button
                                    key={track.id}
                                    onClick={() => toggleTrack(track.id)}
                                    className={cn(
                                        "relative group flex items-start gap-3 p-3 rounded-lg border text-left transition-all",
                                        isSelected 
                                            ? "border-purple-500 bg-purple-50/50 ring-1 ring-purple-500/20" 
                                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                    )}
                                >
                                    <div className={cn("w-2 h-full absolute left-0 top-0 bottom-0 rounded-l-lg", isSelected ? track.color : "bg-transparent")} />
                                    <div className="pl-2">
                                        <p className={cn("font-medium text-sm", isSelected ? "text-slate-900" : "text-slate-600")}>
                                            {track.title}
                                        </p>
                                    </div>
                                    {isSelected && (
                                        <div className="absolute top-2 right-2">
                                            <Check className="w-4 h-4 text-purple-600" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* --- Right Column: Progress Summary --- */}
            <div className="md:col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" /> Overview
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm text-slate-600">Total Questions</span>
                            <span className="font-bold text-slate-900">{progressStats.totalQuestions}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <span className="text-sm text-green-700">Mastered</span>
                            <span className="font-bold text-green-700">{progressStats.mastered}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                            <span className="text-sm text-amber-700">In Review</span>
                            <span className="font-bold text-amber-700">{progressStats.review}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm text-slate-500">Not Started</span>
                            <span className="font-bold text-slate-500">{progressStats.newQuestions}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl text-white shadow-md">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-bold">Keep Learning</p>
                            <p className="text-xs text-slate-400">Consistency is key</p>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-3xl font-bold">{settings?.daily_streak || 0}</p>
                                <p className="text-xs text-slate-400">Day Streak</p>
                            </div>
                            <Button size="sm" variant="secondary" className="text-xs bg-white text-slate-900 hover:bg-slate-100">
                                View Activity
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </motion.div>
    </MainLayout>
  );
}
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Calendar, Award, MessageSquare, ThumbsUp, Save, Loader2, Check, 
  Settings, Edit2, Camera, Target, Zap, BookOpen, Hash, ImageIcon,
  Activity, Clock, ArrowRight 
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
import { useStudyModules } from '@/hooks/useStudyModules';
import { useUserQuestions } from '@/hooks/useUserQuestions';
import { useAddNotification } from '@/hooks/useNotifications'; // 👈 Imported Notification Hook
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const TRACK_COLORS = [
  'bg-blue-500', 'bg-green-500', 'bg-orange-500', 
  'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 
  'bg-red-500', 'bg-teal-500', 'bg-yellow-500', 'bg-cyan-500'
];

export default function Profile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const progressStats = useProgressStats();
  const { data: settings } = useUserSettings();
  const updateSettings = useUpdateSettings();
  
  // Data Hooks
  const { data: studyModules, isLoading: modulesLoading } = useStudyModules();
  const { data: recentQuestions } = useUserQuestions();
  const addNotification = useAddNotification(); // 👈 Initialize Notification Trigger
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);

  // Generate Dynamic Tracks
  const availableTracks = useMemo(() => {
    if (!studyModules) return [];
    const categories = Array.from(new Set(
      studyModules.map(m => m.category || 'General').filter(Boolean)
    )).sort();

    return categories.map((cat, index) => ({
      id: cat,
      title: cat,
      color: TRACK_COLORS[index % TRACK_COLORS.length],
      icon: Hash 
    }));
  }, [studyModules]);

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
        // Fix for missing type definition on local setup
        setCoverUrl((data as any).cover_url || ''); 
      }
      return data;
    },
    enabled: !!user
  });

  useState(() => {
    if (settings?.interested_categories) {
      setSelectedTracks(settings.interested_categories);
    }
  });

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

  const updateProfile = useMutation({
    mutationFn: async ({ name, avatar_url, cover_url }: { name: string; avatar_url: string; cover_url: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('profiles')
        // Cast to 'any' to avoid type error if column isn't in types yet
        .update({ name, avatar_url, cover_url } as any) 
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated');
      setIsEditing(false);

      // 👇 SEND NOTIFICATION ON SUCCESS
      if (user) {
        addNotification.mutate({
            userId: user.id,
            title: 'Profile Updated 🛠️',
            message: 'You successfully updated your profile details.'
        });
      }
    },
    onError: () => toast.error('Failed to update profile')
  });

  const handleSave = () => updateProfile.mutate({ 
    name: displayName, 
    avatar_url: avatarUrl,
    cover_url: coverUrl 
  });

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
      
      // Notify on track save
      if (user) {
        addNotification.mutate({
            userId: user.id,
            title: 'Learning Path Updated 🎯',
            message: `You updated your focus topics.`
        });
      }
      
      toast.success('Learning path updated');
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
        <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group/cover">
          <div className="h-48 relative overflow-hidden bg-slate-100">
             {coverUrl ? (
               <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full bg-gradient-to-r from-purple-100 to-blue-100" />
             )}
             {isEditing && (
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity">
                    <div className="bg-black/50 text-white px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm text-sm">
                        <ImageIcon className="w-4 h-4" /> Change Cover in Settings
                    </div>
                </div>
             )}
          </div>
          
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row gap-6 items-start -mt-16">
              <div className="relative group/avatar">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg bg-white">
                  <AvatarImage src={profile?.avatar_url || undefined} className="object-cover" />
                  <AvatarFallback className="bg-slate-100 text-slate-400 text-4xl font-bold">
                    {(profile?.name || user.email)?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer border-4 border-transparent">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 mt-2 md:mt-16 space-y-1">
                {isEditing ? (
                  <div className="space-y-4 max-w-lg bg-slate-50 p-4 rounded-xl border border-slate-100 mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Display Name</Label>
                            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Avatar URL</Label>
                            <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Cover Image URL</Label>
                            <Input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..." />
                            <p className="text-xs text-slate-400">Paste a link to an image (Unsplash, etc.)</p>
                        </div>
                    </div>
                    <div className="flex gap-2 pt-2 justify-end">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={updateProfile.isPending} className="bg-slate-900 text-white">
                            {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Changes
                        </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            {profile?.name || 'User'}
                            <Badge variant="secondary" className="font-normal text-xs bg-slate-100 text-slate-600 border border-slate-200">
                                Pro Member
                            </Badge>
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                            <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {user.email}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Joined {memberSince}</span>
                        </div>
                    </div>
                    <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2 rounded-full">
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
            {/* --- Left Column --- */}
            <div className="md:col-span-8 space-y-6">
                
                {/* 1. Track Selection Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Target className="w-5 h-5 text-purple-600" /> My Learning Path
                            </h2>
                            <p className="text-sm text-slate-500">Select topics you want to master from the community</p>
                        </div>
                        {selectedTracks.length > 0 && (
                            <Button size="sm" onClick={saveTrackPreferences} disabled={updateSettings.isPending} className="bg-slate-900 text-white">
                                {updateSettings.isPending && <Loader2 className="w-3 h-3 animate-spin mr-2" />}
                                Save Selection
                            </Button>
                        )}
                    </div>

                    {modulesLoading ? (
                        <div className="text-center py-8 text-slate-400">Loading topics...</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {availableTracks.length > 0 ? availableTracks.map((track) => {
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
                                        <div className={cn("w-2 h-full absolute left-0 top-0 bottom-0 rounded-l-lg", isSelected ? track.color : "bg-slate-200")} />
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
                            }) : (
                                <div className="col-span-3 text-center py-4 text-slate-400 italic">
                                    No community topics found yet.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 2. Recent Activity Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-600" /> Recent Activity
                            </h2>
                            <p className="text-sm text-slate-500">Your latest contributions to your personal bank</p>
                        </div>
                        <Link to="/interview-ready">
                           <Button variant="ghost" size="sm" className="text-slate-500">View All <ArrowRight className="w-4 h-4 ml-1"/></Button>
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {recentQuestions && recentQuestions.length > 0 ? (
                           recentQuestions.slice(0, 4).map((q) => (
                              <div key={q.id} className="flex items-start gap-4 p-4 rounded-lg bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-sm transition-all">
                                 <div className={cn(
                                    "p-2 rounded-lg mt-1",
                                    q.difficulty === 'Hard' ? "bg-red-100 text-red-600" : 
                                    q.difficulty === 'Medium' ? "bg-amber-100 text-amber-600" : 
                                    "bg-green-100 text-green-600"
                                 )}>
                                    <MessageSquare className="w-4 h-4" />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                       <p className="font-medium text-slate-900 truncate pr-4">{q.question_text}</p>
                                       <span className="text-[10px] text-slate-400 whitespace-nowrap flex items-center">
                                          <Clock className="w-3 h-3 mr-1" />
                                          {new Date(q.created_at).toLocaleDateString()}
                                       </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                       <Badge variant="outline" className="text-[10px] bg-white">{q.difficulty}</Badge>
                                       <span className="text-xs text-slate-500">Added to {q.category}</span>
                                    </div>
                                 </div>
                              </div>
                           ))
                        ) : (
                           <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-xl">
                              <p className="text-slate-500 mb-2">No activity yet</p>
                              <Link to="/interview-ready">
                                 <Button variant="outline" size="sm">Add your first question</Button>
                              </Link>
                           </div>
                        )}
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
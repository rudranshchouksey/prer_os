import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserSettings {
  id: string;
  user_id: string;
  interview_date: string | null;
  daily_streak: number;
  last_activity_date: string | null;
  interested_categories: string[] | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export function useUserSettings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-settings', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      // Create settings if they don't exist
      if (!data) {
        const { data: newSettings, error: insertError } = await supabase
          .from('user_settings')
          .insert({ user_id: user.id })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newSettings as UserSettings;
      }

      return data as UserSettings;
    },
    enabled: !!user
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: Partial<Pick<UserSettings, 'interview_date' | 'daily_streak' | 'last_activity_date' | 'interested_categories' | 'onboarding_completed'>>) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
    }
  });
}

export function useTrackActivity() {
  const { data: settings } = useUserSettings();
  const updateSettings = useUpdateSettings();

  const trackActivity = async () => {
    if (!settings) return;

    const today = new Date().toISOString().split('T')[0];
    const lastActivity = settings.last_activity_date;

    if (lastActivity === today) {
      // Already tracked today
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = 1;
    if (lastActivity === yesterdayStr) {
      // Consecutive day
      newStreak = settings.daily_streak + 1;
    }

    await updateSettings.mutateAsync({
      daily_streak: newStreak,
      last_activity_date: today
    });
  };

  return { trackActivity };
}

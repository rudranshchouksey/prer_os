import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserProgress {
  id: string;
  user_id: string;
  question_id: string;
  status: 'New' | 'Review' | 'Mastered';
  confidence: number | null;
  last_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useUserProgress() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-progress', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as UserProgress[];
    },
    enabled: !!user
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      questionId, 
      status, 
      confidence 
    }: { 
      questionId: string; 
      status: 'New' | 'Review' | 'Mastered'; 
      confidence?: number;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data: existing } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('question_id', questionId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('user_progress')
          .update({ 
            status, 
            confidence,
            last_reviewed_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_progress')
          .insert({
            user_id: user.id,
            question_id: questionId,
            status,
            confidence,
            last_reviewed_at: new Date().toISOString()
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-progress'] });
    }
  });
}

export function useProgressStats() {
  const { data: progress } = useUserProgress();
  const { data: modules } = useQuery({
    queryKey: ['all-questions-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('id, module_id');
      if (error) throw error;
      return data;
    }
  });

  if (!progress || !modules) {
    return {
      totalQuestions: 0,
      mastered: 0,
      review: 0,
      newQuestions: 0,
      percentComplete: 0
    };
  }

  const mastered = progress.filter(p => p.status === 'Mastered').length;
  const review = progress.filter(p => p.status === 'Review').length;
  const totalQuestions = modules.length;
  const newQuestions = totalQuestions - mastered - review;

  return {
    totalQuestions,
    mastered,
    review,
    newQuestions,
    percentComplete: totalQuestions > 0 ? Math.round((mastered / totalQuestions) * 100) : 0
  };
}

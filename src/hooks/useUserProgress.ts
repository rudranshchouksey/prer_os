import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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

      // 1. Manually check if the row exists
      const { data: existing, error: fetchError } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('question_id', questionId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existing) {
        // 2a. Update existing
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
        // 2b. Insert new
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
    // Optimistic Update
    onMutate: async ({ questionId, status, confidence }) => {
      await queryClient.cancelQueries({ queryKey: ['user-progress'] });
      const previousProgress = queryClient.getQueryData<UserProgress[]>(['user-progress', user?.id]);

      queryClient.setQueryData<UserProgress[]>(['user-progress', user?.id], (old) => {
        if (!old) return [];
        const existing = old.find(p => p.question_id === questionId);
        
        if (existing) {
          return old.map(p => 
            p.question_id === questionId 
              ? { ...p, status, confidence: confidence ?? p.confidence, last_reviewed_at: new Date().toISOString() }
              : p
          );
        }
        
        return [...old, {
          id: 'temp-id',
          user_id: user.id,
          question_id: questionId,
          status,
          confidence: confidence ?? null,
          last_reviewed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }];
      });

      return { previousProgress };
    },
    onError: (err, variables, context) => {
      console.error("Supabase Error:", err);
      toast.error("Failed to save progress");
      if (context?.previousProgress) {
        queryClient.setQueryData(['user-progress', user?.id], context.previousProgress);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['user-progress'] });
      queryClient.invalidateQueries({ queryKey: ['study-modules'] });
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


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserQuestion {
  id: string;
  question_text: string;
  answer_text: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  tags: string[];
  created_at: string;
}

export function useUserQuestions() {
  return useQuery({
    queryKey: ['user_questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        // FIX 1: Cast the table name to 'any' so TS doesn't complain it's missing
        .from('user_questions' as any) 
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // FIX 2: Double cast to 'unknown' first to bypass the overlap check
      return data as unknown as UserQuestion[];
    },
  });
}

export function useCreateUserQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (q: Partial<UserQuestion>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');
      
      const { error } = await supabase
        .from('user_questions' as any)
        .insert([{ ...q, user_id: user.id }]);
      
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user_questions'] }),
  });
}

export function useUpdateUserQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<UserQuestion> & { id: string }) => {
      const { error } = await supabase
        .from('user_questions' as any)
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user_questions'] }),
  });
}

export function useDeleteUserQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_questions' as any)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user_questions'] }),
  });
}
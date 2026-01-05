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

// 1. Fetch Personal Questions
export function useUserQuestions() {
  return useQuery({
    queryKey: ['user_questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_questions' as any) 
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as unknown as UserQuestion[];
    },
  });
}

// 2. Create Personal Question
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

// 3. Update Personal Question
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

// 4. Delete Personal Question
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

// --- NEW FEATURES ---

// 5. IMPORT Global Questions to Personal Bank
export function useImportGlobalQuestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (moduleId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // A. Get Module Title
      const { data: moduleData, error: moduleError } = await supabase
        .from('study_modules' as any)
        .select('title')
        .eq('id', moduleId)
        .single();
      
      if (moduleError) throw moduleError;
      
      const categoryName = (moduleData as any)?.title || 'Imported';

      // B. Fetch Global Questions
      const { data: globalQuestions, error: fetchError } = await supabase
        .from('questions' as any)
        .select('*')
        .eq('module_id', moduleId);

      if (fetchError) throw fetchError;
      if (!globalQuestions || globalQuestions.length === 0) {
        throw new Error("No questions found in this topic to import.");
      }

      // C. Prepare for Personal Bank
      const personalQuestions = globalQuestions.map((q: any) => ({
        user_id: user.id,
        question_text: q.question_text,
        answer_text: q.answer_text,
        difficulty: q.difficulty,
        category: categoryName,
        tags: ['Imported']
      }));

      // D. Insert into Personal Table
      const { error: insertError } = await supabase
        .from('user_questions' as any)
        .insert(personalQuestions);

      if (insertError) throw insertError;

      return personalQuestions.length;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_questions'] });
    },
  });
}

// 6. MARK AS MASTERED (Tracks Progress)
export function useToggleQuestionProgress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ questionId, status }: { questionId: string; status: 'Mastered' | 'Review' }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { error } = await supabase
        .from('user_progress' as any)
        .upsert({
          user_id: user.id,
          question_id: questionId,
          status: status,
          last_reviewed_at: new Date().toISOString()
        }, { onConflict: 'user_id, question_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_progress'] });
      queryClient.invalidateQueries({ queryKey: ['study_modules'] });
    }
  });
}

// 7. GET USER PROGRESS
export function useUserProgress() {
  return useQuery({
    queryKey: ['user_progress'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_progress' as any)
        .select('*');
      if (error) throw error;
      return data as unknown as { question_id: string; status: string }[];
    },
  });
}
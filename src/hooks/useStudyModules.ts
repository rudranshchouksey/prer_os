import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Question {
  id: string;
  module_id: string;
  question_text: string;
  answer_text: string;
  difficulty: string;
  tags: string[];
  is_system_generated?: boolean;
  created_by_id?: string; // Important for ownership check
}

export interface StudyModule {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  questions: Question[];
  slug: string;
  created_by_id?: string;
}

// 1. Fetch Modules
export function useStudyModules() {
  return useQuery({
    queryKey: ['study_modules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('study_modules')
        .select(`*, questions (*)`)
        .order('category', { ascending: true });
      if (error) throw error;
      return data as StudyModule[];
    },
  });
}

// 2. Create Topic (FIXED: Uses the actual category passed from the modal)
export function useCreateStudyModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { title: string; category: string }) => {
      const slug = vars.title.toLowerCase().replace(/\s+/g, '-');
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('study_modules')
        .insert([{
          title: vars.title,
          category: vars.category, // Uses the selected Parent Category
          description: `Community category: ${vars.title}`,
          slug: slug,
          icon: 'Code'
          // created_by: user?.id (Uncomment if you added this column to SQL)
        }])
        .select('id')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study_modules'] });
    },
  });
}

// 3. Create Question
export function useCreateGlobalQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { moduleId: string; question: string; answer: string; difficulty: string; tags?: string[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('questions').insert([{
        module_id: vars.moduleId,
        question_text: vars.question,
        answer_text: vars.answer,
        difficulty: vars.difficulty,
        is_system_generated: false,
        created_by_id: user?.id, // Saves the author ID
        tags: vars.tags
      }]);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['study_modules'] }),
  });
}

// 4. Update Question (NEW)
export function useUpdateGlobalQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; question: string; answer: string; difficulty: string }) => {
      const { error } = await supabase
        .from('questions')
        .update({
          question_text: vars.question,
          answer_text: vars.answer,
          difficulty: vars.difficulty
        })
        .eq('id', vars.id); 
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['study_modules'] }),
  });
}

// 5. Delete Question (NEW)
export function useDeleteGlobalQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('questions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['study_modules'] }),
  });
}
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Question {
  id: string;
  module_id: string;
  question_text: string;
  answer_text: string;
  difficulty: string | null;
  tags: string[] | null;
  created_at: string;
}

export interface StudyModule {
  id: string;
  title: string;
  category: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number | null;
  created_at: string;
  questions?: Question[];
}

export function useStudyModules() {
  return useQuery({
    queryKey: ['study-modules'],
    queryFn: async () => {
      const { data: modules, error: modulesError } = await supabase
        .from('study_modules')
        .select('*')
        .order('sort_order');

      if (modulesError) throw modulesError;

      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*');

      if (questionsError) throw questionsError;

      // Group questions by module
      const modulesWithQuestions = modules.map(module => ({
        ...module,
        questions: questions.filter(q => q.module_id === module.id)
      }));

      return modulesWithQuestions as StudyModule[];
    }
  });
}

export function useModuleQuestions(moduleId: string) {
  return useQuery({
    queryKey: ['module-questions', moduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('module_id', moduleId);

      if (error) throw error;
      return data as Question[];
    },
    enabled: !!moduleId
  });
}

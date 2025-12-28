import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface QuestionVote {
  id: string;
  question_id: string;
  user_id: string;
  vote_type: 'up' | 'down';
  created_at: string;
}

export function useUserVotes() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-votes', user?.id],
    queryFn: async () => {
      if (!user) return {};
      
      const { data, error } = await supabase
        .from('question_votes')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Return as a map for easy lookup
      const voteMap: Record<string, 'up' | 'down'> = {};
      data?.forEach(vote => {
        voteMap[vote.question_id] = vote.vote_type as 'up' | 'down';
      });
      return voteMap;
    },
    enabled: !!user
  });
}

export function useVoteOnQuestion() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ questionId, voteType }: { questionId: string; voteType: 'up' | 'down' | null }) => {
      if (!user) throw new Error('Must be logged in to vote');

      // First check if user already voted
      const { data: existingVote } = await supabase
        .from('question_votes')
        .select('*')
        .eq('question_id', questionId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (voteType === null) {
        // Remove vote
        if (existingVote) {
          const { error } = await supabase
            .from('question_votes')
            .delete()
            .eq('id', existingVote.id);
          if (error) throw error;
        }
      } else if (existingVote) {
        // Update existing vote
        if (existingVote.vote_type !== voteType) {
          const { error } = await supabase
            .from('question_votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id);
          if (error) throw error;
        }
      } else {
        // Create new vote
        const { error } = await supabase
          .from('question_votes')
          .insert({
            question_id: questionId,
            user_id: user.id,
            vote_type: voteType
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-votes'] });
      queryClient.invalidateQueries({ queryKey: ['study-modules'] });
      queryClient.invalidateQueries({ queryKey: ['module-questions'] });
    }
  });
}

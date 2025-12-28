import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useVoteOnQuestion, useUserVotes } from '@/hooks/useQuestionVotes';
import { toast } from 'sonner';

interface VoteButtonsProps {
  questionId: string;
  upvotes: number;
  downvotes: number;
  compact?: boolean;
}

export function VoteButtons({ questionId, upvotes, downvotes, compact = false }: VoteButtonsProps) {
  const { user } = useAuth();
  const { data: userVotes } = useUserVotes();
  const voteOnQuestion = useVoteOnQuestion();

  const currentVote = userVotes?.[questionId];
  const score = (upvotes || 0) - (downvotes || 0);

  const handleVote = (voteType: 'up' | 'down') => {
    if (!user) {
      toast.error('Please log in to vote');
      return;
    }

    // Toggle vote if clicking same type
    const newVote = currentVote === voteType ? null : voteType;
    voteOnQuestion.mutate({ questionId, voteType: newVote });
  };

  return (
    <div className={cn(
      "flex items-center gap-1",
      compact ? "flex-row" : "flex-col"
    )}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleVote('up');
        }}
        disabled={voteOnQuestion.isPending}
        className={cn(
          "p-1 rounded transition-colors",
          currentVote === 'up'
            ? "text-success bg-success/10"
            : "text-muted-foreground hover:text-success hover:bg-success/10"
        )}
        title="Upvote"
      >
        <ChevronUp className={cn(compact ? "w-4 h-4" : "w-5 h-5")} />
      </button>
      
      <span className={cn(
        "font-mono font-medium text-center min-w-[2ch]",
        compact ? "text-xs" : "text-sm",
        score > 0 && "text-success",
        score < 0 && "text-destructive",
        score === 0 && "text-muted-foreground"
      )}>
        {score}
      </span>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleVote('down');
        }}
        disabled={voteOnQuestion.isPending}
        className={cn(
          "p-1 rounded transition-colors",
          currentVote === 'down'
            ? "text-destructive bg-destructive/10"
            : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        )}
        title="Downvote"
      >
        <ChevronDown className={cn(compact ? "w-4 h-4" : "w-5 h-5")} />
      </button>
    </div>
  );
}

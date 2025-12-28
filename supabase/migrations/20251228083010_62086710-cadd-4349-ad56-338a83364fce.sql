-- Create question_votes table for upvote/downvote system
CREATE TABLE public.question_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  vote_type TEXT CHECK (vote_type IN ('up', 'down')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(question_id, user_id)
);

-- Enable RLS
ALTER TABLE public.question_votes ENABLE ROW LEVEL SECURITY;

-- RLS policies for question_votes
CREATE POLICY "Anyone can view votes" 
ON public.question_votes 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can vote" 
ON public.question_votes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" 
ON public.question_votes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" 
ON public.question_votes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add upvote/downvote count columns to questions for denormalized access
ALTER TABLE public.questions 
ADD COLUMN upvotes INTEGER DEFAULT 0,
ADD COLUMN downvotes INTEGER DEFAULT 0;

-- Create function to update vote counts
CREATE OR REPLACE FUNCTION public.update_question_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'up' THEN
      UPDATE public.questions SET upvotes = upvotes + 1 WHERE id = NEW.question_id;
    ELSE
      UPDATE public.questions SET downvotes = downvotes + 1 WHERE id = NEW.question_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'up' THEN
      UPDATE public.questions SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = OLD.question_id;
    ELSE
      UPDATE public.questions SET downvotes = GREATEST(downvotes - 1, 0) WHERE id = OLD.question_id;
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.vote_type = 'up' AND NEW.vote_type = 'down' THEN
      UPDATE public.questions SET upvotes = GREATEST(upvotes - 1, 0), downvotes = downvotes + 1 WHERE id = NEW.question_id;
    ELSIF OLD.vote_type = 'down' AND NEW.vote_type = 'up' THEN
      UPDATE public.questions SET downvotes = GREATEST(downvotes - 1, 0), upvotes = upvotes + 1 WHERE id = NEW.question_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for vote count updates
CREATE TRIGGER on_question_vote_change
AFTER INSERT OR UPDATE OR DELETE ON public.question_votes
FOR EACH ROW
EXECUTE FUNCTION public.update_question_vote_counts();
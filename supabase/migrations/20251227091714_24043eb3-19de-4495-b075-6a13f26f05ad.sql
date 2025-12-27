-- Add created_by_id and is_system_generated to questions table for community content
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS created_by_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_system_generated boolean NOT NULL DEFAULT true;

-- Add index for querying by creator
CREATE INDEX IF NOT EXISTS idx_questions_created_by ON public.questions(created_by_id);

-- Update existing questions to mark as system generated
UPDATE public.questions SET is_system_generated = true WHERE is_system_generated IS NULL;

-- Create policy for users to insert their own questions
CREATE POLICY "Users can insert their own questions" 
ON public.questions 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by_id);

-- Create policy for users to update their own questions (non-system)
CREATE POLICY "Users can update their own questions" 
ON public.questions 
FOR UPDATE 
TO authenticated
USING (auth.uid() = created_by_id AND is_system_generated = false);

-- Create policy for users to delete their own questions (non-system)
CREATE POLICY "Users can delete their own questions" 
ON public.questions 
FOR DELETE 
TO authenticated
USING (auth.uid() = created_by_id AND is_system_generated = false);
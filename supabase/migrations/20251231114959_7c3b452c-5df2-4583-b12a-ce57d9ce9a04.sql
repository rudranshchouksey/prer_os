-- Add interested_categories column to user_settings
ALTER TABLE public.user_settings 
ADD COLUMN interested_categories TEXT[] DEFAULT NULL;

-- Add onboarding_completed flag
ALTER TABLE public.user_settings 
ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
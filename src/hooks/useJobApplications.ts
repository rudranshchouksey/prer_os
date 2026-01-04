import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type ApplicationStatus = 'wishlist' | 'applied' | 'hr_screen' | 'technical' | 'offer' | 'rejection';

export interface JobApplication {
  id: string;
  user_id: string;
  company_name: string;
  company_logo: string | null;
  job_title: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  status: ApplicationStatus;
  notes: string | null;
  job_url: string | null;
  location: string | null;
  job_type: string | null;
  applied_at: string | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export const APPLICATION_STATUSES: { id: ApplicationStatus; label: string; color: string }[] = [
  { id: 'wishlist', label: 'Wishlist', color: 'bg-muted' },
  { id: 'applied', label: 'Applied', color: 'bg-primary/10' },
  { id: 'hr_screen', label: 'HR Screen', color: 'bg-warning/10' },
  { id: 'technical', label: 'Technical', color: 'bg-secondary/10' },
  { id: 'offer', label: 'Offer', color: 'bg-success/10' },
  { id: 'rejection', label: 'Rejection', color: 'bg-destructive/10' },
];

export function useJobApplications() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['job-applications', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as JobApplication[];
    },
    enabled: !!user
  });
}

export function useCreateJobApplication() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (application: Omit<JobApplication, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('job_applications')
        .insert({
          ...application,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
    }
  });
}

export function useUpdateJobApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<JobApplication> & { id: string }) => {
      const { data, error } = await supabase
        .from('job_applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
    }
  });
}

export function useDeleteJobApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
    }
  });
}
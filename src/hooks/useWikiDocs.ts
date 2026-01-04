import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';

// 1. Define Data Interface
export interface WikiDoc {
  id: string;
  created_by: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
}

// 2. Define Local Database Definition
// This teaches TypeScript that 'wiki_docs' exists and what fields it has.
type LocalDatabase = {
  public: {
    Tables: {
      wiki_docs: {
        Row: WikiDoc;
        Insert: Partial<WikiDoc>; // Allows inserting with subsets of fields (e.g. omitting id)
        Update: Partial<WikiDoc>; // Allows updating subsets of fields
      };
    };
  };
};

// 3. Create a Typed Client Reference
// We cast the global 'supabase' to a client that specifically knows about our LocalDatabase
const client = supabase as unknown as SupabaseClient<LocalDatabase>;

export function useWikiDocs() {
  return useQuery({
    queryKey: ['wiki_docs'],
    queryFn: async () => {
      // Use 'client' instead of 'supabase' to avoid "property does not exist" errors
      const { data, error } = await client
        .from('wiki_docs')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateWikiDoc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (doc: { title: string; content: string; category: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // The 'insert' call will now accept the object because 'client' knows the schema
      const { data, error } = await client
        .from('wiki_docs')
        .insert([{ ...doc, created_by: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wiki_docs'] });
    },
  });
}

export function useUpdateWikiDoc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WikiDoc> & { id: string }) => {
      const { error } = await client
        .from('wiki_docs')
        .update(updates)
        .eq('id', id); // RLS policies will ensure only the author can update

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wiki_docs'] });
    },
  });
}

export function useDeleteWikiDoc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await client
        .from('wiki_docs')
        .delete()
        .eq('id', id); // RLS policies will ensure only the author can delete

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wiki_docs'] });
    },
  });
}
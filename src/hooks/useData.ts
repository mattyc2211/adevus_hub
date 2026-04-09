import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type App = Tables<'apps'>;
type Item = Tables<'items'>;
type Comment = Tables<'comments'>;
type Activity = Tables<'activity_log'>;
type Profile = Tables<'profiles'>;
type Milestone = Tables<'milestones'>;

// ─── Apps ───
export function useApps() {
  return useQuery({
    queryKey: ['apps'],
    queryFn: async () => {
      const { data, error } = await supabase.from('apps').select('*').order('created_at', { ascending: true });
      if (error) throw error;
      return data as App[];
    },
  });
}

export function useCreateApp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (app: TablesInsert<'apps'>) => {
      const { data, error } = await supabase.from('apps').insert(app).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['apps'] }),
  });
}

export function useUpdateApp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'apps'> & { id: string }) => {
      const { error } = await supabase.from('apps').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['apps'] }),
  });
}

// ─── Items ───
export function useItems(appId?: string | null) {
  return useQuery({
    queryKey: ['items', appId],
    queryFn: async () => {
      let query = supabase.from('items').select('*').order('updated_at', { ascending: false });
      if (appId && appId !== 'all') query = query.eq('app_id', appId);
      const { data, error } = await query;
      if (error) throw error;
      return data as Item[];
    },
  });
}

export function useCreateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: TablesInsert<'items'>) => {
      const { data, error } = await supabase.from('items').insert(item).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['items'] }),
  });
}

export function useUpdateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'items'> & { id: string }) => {
      const { error } = await supabase.from('items').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['items'] }),
  });
}

export function useDeleteItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['items'] }),
  });
}

// ─── Comments ───
export function useComments(itemId?: string | null) {
  return useQuery({
    queryKey: ['comments', itemId],
    queryFn: async () => {
      let query = supabase.from('comments').select('*').order('created_at', { ascending: true });
      if (itemId) query = query.eq('item_id', itemId);
      const { data, error } = await query;
      if (error) throw error;
      return data as Comment[];
    },
    enabled: !!itemId,
  });
}

export function useAllComments() {
  return useQuery({
    queryKey: ['comments'],
    queryFn: async () => {
      const { data, error } = await supabase.from('comments').select('*');
      if (error) throw error;
      return data as Comment[];
    },
  });
}

export function useCreateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (comment: TablesInsert<'comments'>) => {
      const { data, error } = await supabase.from('comments').insert(comment).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}

// ─── Activity ───
export function useActivity(itemId?: string | null) {
  return useQuery({
    queryKey: ['activity', itemId],
    queryFn: async () => {
      let query = supabase.from('activity_log').select('*').order('created_at', { ascending: true });
      if (itemId) query = query.eq('item_id', itemId);
      const { data, error } = await query;
      if (error) throw error;
      return data as Activity[];
    },
    enabled: !!itemId,
  });
}

export function useCreateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: TablesInsert<'activity_log'>) => {
      const { data, error } = await supabase.from('activity_log').insert(entry).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activity'] }),
  });
}

// ─── Milestones ───
export function useMilestones() {
  return useQuery({
    queryKey: ['milestones'],
    queryFn: async () => {
      const { data, error } = await supabase.from('milestones').select('*').order('target_date', { ascending: true });
      if (error) throw error;
      return data as Milestone[];
    },
  });
}

// ─── Profiles ───
export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      return data as Profile[];
    },
  });
}

// ─── User Roles ───
export function useUserRoles() {
  return useQuery({
    queryKey: ['user_roles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_roles').select('*');
      if (error) throw error;
      return data as { id: string; user_id: string; role: string }[];
    },
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'member' }) => {
      // Delete existing roles for user
      await supabase.from('user_roles').delete().eq('user_id', userId);
      // Insert new role
      if (role === 'admin') {
        const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user_roles'] }),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { email: string; password: string; name: string; role: 'admin' | 'member' }) => {
      const { data, error } = await supabase.functions.invoke('create-user', { body: params });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profiles'] });
      qc.invalidateQueries({ queryKey: ['user_roles'] });
    },
  });
}

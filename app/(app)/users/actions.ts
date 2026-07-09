'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function updateUserRole(userId: string, role: 'dev' | 'admin' | 'viewer' | 'pending') {
  const supabase = createClient();
  const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
  if (error) return { success: false, message: error.message };
  revalidatePath('/users');
  return { success: true };
}

export async function approveUser(userId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('profiles')
    .update({ status: 'active', approved_by: user?.id, approved_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) return { success: false, message: error.message };
  revalidatePath('/users');
  return { success: true };
}

export async function suspendUser(userId: string) {
  const supabase = createClient();
  const { error } = await supabase.from('profiles').update({ status: 'suspended' }).eq('id', userId);
  if (error) return { success: false, message: error.message };
  revalidatePath('/users');
  return { success: true };
}

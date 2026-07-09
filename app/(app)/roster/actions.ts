'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function updateEmployee(id: string, field: 'full_name' | 'region_id', value: string) {
  const supabase = createClient();
  const { error } = await supabase.from('employees').update({ [field]: value }).eq('id', id);
  if (error) return { success: false, message: error.message };
  revalidatePath('/roster');
  revalidatePath('/ranking');
  return { success: true };
}

export async function addEmployee(datasetType: 'ad' | 'manager' | 'cluster_leader', regionId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('employees')
    .insert({ dataset_type: datasetType, full_name: 'รายชื่อใหม่', region_id: regionId })
    .select()
    .single();
  if (error) return { success: false, message: error.message };
  revalidatePath('/roster');
  return { success: true, employee: data };
}

export async function removeEmployee(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from('employees').update({ is_active: false }).eq('id', id);
  if (error) return { success: false, message: error.message };
  revalidatePath('/roster');
  revalidatePath('/ranking');
  return { success: true };
}

export async function uploadEmployeePhoto(employeeId: string, fileName: string, base64Data: string) {
  const supabase = createClient();
  const buffer = Buffer.from(base64Data.split(',')[1], 'base64');
  const path = `${employeeId}/${Date.now()}-${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('employee-photos')
    .upload(path, buffer, { contentType: 'image/jpeg', upsert: true });
  if (uploadError) return { success: false, message: uploadError.message };

  const { data: publicUrl } = supabase.storage.from('employee-photos').getPublicUrl(path);

  const { error: updateError } = await supabase
    .from('employees')
    .update({ photo_url: publicUrl.publicUrl })
    .eq('id', employeeId);
  if (updateError) return { success: false, message: updateError.message };

  revalidatePath('/roster');
  revalidatePath('/ranking');
  return { success: true, url: publicUrl.publicUrl };
}

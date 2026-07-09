'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function updateKpiItemField(itemId: string, field: string, value: string | number | null) {
  const supabase = createClient();
  const allowed = ['name_th', 'weight', 'flag_weight', 'unit', 'owner_name', 'grade_1', 'grade_2', 'grade_3', 'grade_4', 'grade_5'];
  if (!allowed.includes(field)) throw new Error('Field ไม่ได้รับอนุญาต');

  const { error } = await supabase.from('kpi_items').update({ [field]: value }).eq('id', itemId);
  // RLS จะปฏิเสธเองถ้า role ไม่ใช่ admin/dev — error.message จะสะท้อนกลับมา
  if (error) return { success: false, message: error.message };

  revalidatePath('/backend/kpi');
  revalidatePath('/ranking');
  return { success: true };
}

export async function upsertMonthlyActual(
  kpiItemId: string,
  employeeId: string | null,
  year: number,
  month: number,
  actualValue: number | null
) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { error } = await supabase.from('kpi_monthly_actuals').upsert(
    {
      kpi_item_id: kpiItemId,
      employee_id: employeeId,
      year,
      month,
      actual_value: actualValue,
      entered_by: user?.id ?? null,
      updated_at: new Date().toISOString()
    },
    { onConflict: 'kpi_item_id,employee_id,year,month' }
  );

  if (error) return { success: false, message: error.message };

  revalidatePath('/backend/kpi');
  revalidatePath('/ranking');
  return { success: true };
}

export async function addKpiItem(datasetType: 'ad' | 'manager' | 'cluster_leader', regionId: string, categoryId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('kpi_items')
    .insert({
      dataset_type: datasetType,
      region_id: regionId,
      category_id: categoryId,
      name_th: 'KPI ใหม่',
      weight: 5,
      flag_weight: 5.75,
      unit: '%'
    })
    .select()
    .single();

  if (error) return { success: false, message: error.message };
  revalidatePath('/backend/kpi');
  return { success: true, item: data };
}

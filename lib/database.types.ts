// Types ตรงกับ schema ที่สร้างจริงบน Supabase project: kpi-performance-dashboard
// (สร้างด้วยมือเพราะ Supabase:generate_typescript_types รอ approval อยู่ —
//  แนะนำให้รัน `npx supabase gen types typescript --project-id wcauykkknqwdvafwmfay` แทนของจริงภายหลัง)

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_company_email: boolean;
  role: 'dev' | 'admin' | 'viewer' | 'pending';
  status: 'pending_verification' | 'pending_approval' | 'active' | 'suspended';
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Region {
  id: string;
  code: string;
  name_th: string;
  name_en: string | null;
}

export interface KpiCategory {
  id: string;
  code: string;
  name_th: string;
  dataset_type: 'ad' | 'manager' | 'cluster_leader';
  top_level_weight: number;
  effective_year: number;
}

export interface Employee {
  id: string;
  dataset_type: 'ad' | 'manager' | 'cluster_leader';
  full_name: string;
  region_id: string | null;
  photo_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface KpiItem {
  id: string;
  dataset_type: 'ad' | 'manager' | 'cluster_leader';
  region_id: string | null;
  category_id: string;
  name_th: string;
  weight: number | null;
  flag_weight: number | null;
  unit: string | null;
  owner_name: string | null;
  grade_1: number | null;
  grade_2: number | null;
  grade_3: number | null;
  grade_4: number | null;
  grade_5: number | null;
  grade_direction: 'asc' | 'desc';
  sort_order: number | null;
  is_active: boolean;
  created_at: string;
}

export interface KpiMonthlyActual {
  id: string;
  kpi_item_id: string;
  employee_id: string | null;
  year: number;
  month: number;
  actual_value: number | null;
  individual_score: number | null;
  actual_score: number | null;
  is_locked: boolean;
  entered_by: string | null;
  updated_at: string;
}

export interface ScoreSummaryMonthly {
  id: string;
  dataset_type: 'ad' | 'manager' | 'cluster_leader';
  employee_id: string;
  year: number;
  month: number;
  category_scores: Record<string, number>;
  total_score: number | null;
  y2d_score: number | null;
  ranking: number | null;
  computed_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  table_name: string | null;
  record_id: string | null;
  old_value: unknown;
  new_value: unknown;
  created_at: string;
}

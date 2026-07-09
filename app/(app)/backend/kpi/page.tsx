import { createClient } from '@/lib/supabase/server';
import KpiEditTable from '@/components/KpiEditTable';

export default async function BackendKpiPage({ searchParams }: { searchParams: { dataset?: string } }) {
  const datasetType = (searchParams.dataset === 'manager' ? 'manager' : 'ad') as 'ad' | 'manager';
  const supabase = createClient();

  const [{ data: items }, { data: categories }, { data: regions }, { data: actuals }, { data: employees }] = await Promise.all([
    supabase.from('kpi_items').select('*').eq('dataset_type', datasetType).eq('is_active', true).order('sort_order'),
    supabase.from('kpi_categories').select('*').eq('dataset_type', datasetType).eq('effective_year', 2026),
    supabase.from('regions').select('*'),
    supabase.from('kpi_monthly_actuals').select('*, kpi_items!inner(dataset_type)').eq('year', 2026).eq('kpi_items.dataset_type', datasetType),
    supabase.from('employees').select('*').eq('dataset_type', datasetType).eq('is_active', true)
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-[15px] font-semibold">
          หลังบ้าน — แก้ไขข้อมูล KPI {datasetType === 'ad' ? 'AD' : 'Manager'}
        </h3>
      </div>
      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl shadow">
        <p className="text-[12.5px] text-[var(--ink-soft)] px-4.5 pt-4 pb-1">
          Individual Score = interpolate(ค่าจริง, เกรด1–5) · Actual Score = Individual Score × Flag Weight — บันทึกจริงลง Supabase
          ทุกครั้งที่แก้ (auto-save เมื่อออกจากช่อง)
        </p>
        <div className="p-4.5">
          <KpiEditTable
            datasetType={datasetType}
            items={items ?? []}
            categories={categories ?? []}
            regions={regions ?? []}
            actuals={actuals ?? []}
            employees={employees ?? []}
          />
        </div>
      </div>
    </div>
  );
}

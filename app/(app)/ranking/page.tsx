import { createClient } from '@/lib/supabase/server';
import { interpolateScore, actualScore, computeTotalScore, computeY2D, rankByY2D, type Grades } from '@/lib/scoring';
import RankingSection from '@/components/RankingSection';

const YEAR = 2026;
const MONTH_LABELS = ['01.Jan', '02.Feb', '03.Mar', '04.Apr', '05.May', '06.Jun', '07.Jul', '08.Aug', '09.Sep', '10.Oct', '11.Nov', '12.Dec'];

async function loadDataset(datasetType: 'ad' | 'manager') {
  const supabase = createClient();

  const [{ data: categories }, { data: employees }, { data: items }, { data: actuals }, { data: regions }] = await Promise.all([
    supabase.from('kpi_categories').select('*').eq('dataset_type', datasetType).eq('effective_year', YEAR),
    supabase.from('employees').select('*').eq('dataset_type', datasetType).eq('is_active', true),
    supabase.from('kpi_items').select('*').eq('dataset_type', datasetType).eq('is_active', true),
    supabase
      .from('kpi_monthly_actuals')
      .select('*, kpi_items!inner(dataset_type)')
      .eq('year', YEAR)
      .eq('kpi_items.dataset_type', datasetType),
    supabase.from('regions').select('*')
  ]);

  const categoryList = categories ?? [];
  const employeeList = employees ?? [];
  const itemList = items ?? [];
  const actualList = actuals ?? [];
  const regionMap = new Map((regions ?? []).map((r) => [r.id, r.code]));
  const categoryMap = new Map(categoryList.map((c) => [c.id, c]));
  const itemMap = new Map(itemList.map((it) => [it.id, it]));

  const weights = categoryList.map((c) => ({ categoryCode: c.code, topLevelWeight: Number(c.top_level_weight) }));

  const rows = employeeList.map((emp) => {
    const monthly: Record<number, { categoryScores: Record<string, number>; total: number | null }> = {};

    for (let m = 1; m <= 12; m++) {
      const monthActuals = actualList.filter((a) => a.employee_id === emp.id && a.month === m && a.actual_value !== null);
      if (monthActuals.length === 0) {
        monthly[m] = { categoryScores: {}, total: null };
        continue;
      }
      const categoryScores: Record<string, number> = {};
      for (const a of monthActuals) {
        const item = itemMap.get(a.kpi_item_id);
        if (!item || item.grade_1 === null) continue;
        const cat = categoryMap.get(item.category_id);
        if (!cat) continue;
        const grades: Grades = [item.grade_1, item.grade_2, item.grade_3, item.grade_4, item.grade_5] as Grades;
        const ind = interpolateScore(Number(a.actual_value), grades);
        const act = actualScore(ind, Number(item.flag_weight ?? 0));
        categoryScores[cat.code] = (categoryScores[cat.code] ?? 0) + act;
      }
      const total = computeTotalScore(categoryScores, weights);
      monthly[m] = { categoryScores, total };
    }

    const y2d = computeY2D(Array.from({ length: 12 }, (_, i) => monthly[i + 1]?.total ?? null));
    const regionCode = regionMap.get(emp.region_id ?? '') ?? '—';

    return { employeeId: emp.id, name: emp.full_name, region: regionCode, photoUrl: emp.photo_url, y2dScore: y2d, monthly };
  });

  const ranked = rankByY2D(rows);
  return { ranked, weights: categoryList };
}

export default async function RankingPage() {
  const [ad, manager] = await Promise.all([loadDataset('ad'), loadDataset('manager')]);

  return (
    <div>
      <RankingSection title="AD" color="var(--teal)" data={ad.ranked} weights={ad.weights} monthLabels={MONTH_LABELS} defaultOpen />
      <RankingSection title="Manager" color="#4E93A0" data={manager.ranked} weights={manager.weights} monthLabels={MONTH_LABELS} defaultOpen />
      <RankingSection title="Cluster Leader" color="var(--ink-soft)" data={[]} weights={[]} monthLabels={MONTH_LABELS} comingSoon />
    </div>
  );
}

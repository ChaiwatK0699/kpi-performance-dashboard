/**
 * KPI Scoring Engine
 * ยืนยัน logic ตรงกับไฟล์ Excel ต้นฉบับแล้ว (ดู MASTER_PROMPT_KPI_DASHBOARD.md หัวข้อ 1)
 *
 * Step 1: Individual Score = interpolate(actual, [grade1..grade5]) → clamp [1,5]
 * Step 2: Actual Score = Individual Score × Flag Weight
 * Step 3: Category Score = Σ Actual Score ต่อ Main KPI
 * Step 4: Total = Σ (Category Score × TopLevelWeight)
 * Step 5: Y2D = AVG(Total) เฉพาะเดือนที่มีคะแนนจริง
 * Step 6: Ranking = RANK() ตาม Y2D DESC รวมทุก Region เป็น pool เดียวต่อ dataset_type
 */

export type Grades = [number, number, number, number, number];

export function interpolateScore(actual: number, grades: Grades): number {
  const [g1, g2, g3, g4, g5] = grades;
  const asc = g5 >= g1;

  if (asc) {
    if (actual <= g1) return 1;
    if (actual >= g5) return 5;
  } else {
    if (actual >= g1) return 1;
    if (actual <= g5) return 5;
  }

  for (let i = 0; i < 4; i++) {
    const lo = grades[i];
    const hi = grades[i + 1];
    const inRange = hi >= lo ? actual >= lo && actual <= hi : actual <= lo && actual >= hi;
    if (inRange) {
      const ratio = (actual - lo) / (hi - lo);
      return i + 1 + ratio;
    }
  }
  return Math.max(1, Math.min(5, actual));
}

export function actualScore(individualScore: number, flagWeightPct: number): number {
  return individualScore * (flagWeightPct / 100);
}

export interface CategoryWeight {
  categoryCode: string;
  topLevelWeight: number; // e.g. 0.30
}

export function computeTotalScore(
  categoryScores: Record<string, number>,
  weights: CategoryWeight[]
): number {
  return weights.reduce((sum, w) => sum + (categoryScores[w.categoryCode] ?? 0) * w.topLevelWeight, 0);
}

/** Y2D = ค่าเฉลี่ยของ Total เฉพาะเดือนที่มีคะแนนจริง (เดือนว่างไม่นับตัวหาร) */
export function computeY2D(monthlyTotals: (number | null)[]): number | null {
  const valid = monthlyTotals.filter((v): v is number => v !== null && v !== undefined);
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

export interface RankableEntity {
  employeeId: string;
  y2dScore: number | null;
}

/** Ranking รวมทุก Region เป็น pool เดียวต่อ dataset_type — ตามที่ยืนยันกับ business แล้ว */
export function rankByY2D<T extends RankableEntity>(entities: T[]): (T & { rank: number | null })[] {
  const sorted = [...entities].sort((a, b) => (b.y2dScore ?? -Infinity) - (a.y2dScore ?? -Infinity));
  return sorted.map((e, i) => ({ ...e, rank: e.y2dScore === null ? null : i + 1 }));
}

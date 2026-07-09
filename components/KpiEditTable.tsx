'use client';

import { useState, useTransition } from 'react';
import { interpolateScore, actualScore, type Grades } from '@/lib/scoring';
import { updateKpiItemField, upsertMonthlyActual, addKpiItem } from '@/app/(app)/backend/kpi/actions';

const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const MONTH_LABELS = ['01.Jan', '02.Feb', '03.Mar', '04.Apr', '05.May', '06.Jun', '07.Jul', '08.Aug', '09.Sep', '10.Oct', '11.Nov', '12.Dec'];

interface KpiItem {
  id: string;
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
}
interface Category { id: string; name_th: string; }
interface Region { id: string; code: string; }
interface MonthlyActual { kpi_item_id: string; month: number; actual_value: number | null; employee_id: string | null; }

export default function KpiEditTable({
  datasetType,
  items,
  categories,
  regions,
  actuals
}: {
  datasetType: 'ad' | 'manager';
  items: KpiItem[];
  categories: Category[];
  regions: Region[];
  actuals: MonthlyActual[];
  employees: unknown[];
}) {
  const [isPending, startTransition] = useTransition();
  const [savedFlash, setSavedFlash] = useState<string | null>(null);
  const categoryMap = new Map(categories.map((c) => [c.id, c.name_th]));
  const regionMap = new Map(regions.map((r) => [r.id, r.code]));

  function actualsForItem(itemId: string) {
    const map: Record<string, number | null> = {};
    for (const mk of MONTH_KEYS) map[mk] = null;
    actuals
      .filter((a) => a.kpi_item_id === itemId && a.employee_id === null)
      .forEach((a) => {
        map[MONTH_KEYS[a.month - 1]] = a.actual_value;
      });
    return map;
  }

  function computeScores(item: KpiItem, monthActuals: Record<string, number | null>) {
    if ([item.grade_1, item.grade_2, item.grade_3, item.grade_4, item.grade_5].some((g) => g === null)) {
      return { ind: null, act: null };
    }
    let latest: number | null = null;
    for (let i = MONTH_KEYS.length - 1; i >= 0; i--) {
      const v = monthActuals[MONTH_KEYS[i]];
      if (v !== null && v !== undefined) {
        latest = v;
        break;
      }
    }
    if (latest === null) return { ind: null, act: null };
    const grades: Grades = [item.grade_1!, item.grade_2!, item.grade_3!, item.grade_4!, item.grade_5!];
    const ind = interpolateScore(latest, grades);
    const act = actualScore(ind, item.flag_weight ?? 0);
    return { ind, act };
  }

  function flash(msg: string) {
    setSavedFlash(msg);
    setTimeout(() => setSavedFlash(null), 2200);
  }

  function handleFieldBlur(itemId: string, field: string, raw: string) {
    const value = raw === '' ? null : Number(raw);
    startTransition(async () => {
      const res = await updateKpiItemField(itemId, field, value);
      flash(res.success ? 'บันทึกแล้ว' : `บันทึกไม่สำเร็จ: ${res.message}`);
    });
  }

  function handleMonthBlur(itemId: string, month: number, raw: string) {
    const value = raw === '' ? null : Number(raw);
    startTransition(async () => {
      const res = await upsertMonthlyActual(itemId, null, 2026, month, value);
      flash(res.success ? 'บันทึกค่าจริงแล้ว' : `บันทึกไม่สำเร็จ: ${res.message}`);
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() =>
            startTransition(async () => {
              const region = regions[0];
              const category = categories[0];
              if (!region || !category) return;
              await addKpiItem(datasetType, region.id, category.id);
            })
          }
          className="px-3.5 py-2 rounded-lg border border-[var(--line-strong)] bg-[var(--panel)] text-[12.5px] font-medium hover:bg-[var(--panel-2)]"
        >
          + เพิ่มรายการ KPI
        </button>
        {savedFlash && <span className="text-[12px] text-teal font-medium">✓ {savedFlash}</span>}
        {isPending && <span className="text-[12px] text-[var(--ink-soft)]">กำลังบันทึก...</span>}
      </div>

      <div className="overflow-auto max-h-[560px] rounded-lg border border-[var(--line-strong)]">
        <table className="border-collapse w-full text-[12.5px]" style={{ minWidth: 2000 }}>
          <thead>
            <tr>
              <Th sticky={0}>Region</Th>
              <Th sticky={110}>Main KPI</Th>
              <Th sticky={260} strong>KPI Group</Th>
              <Th>Weight</Th>
              <Th>Flag Weight</Th>
              <Th>Unit</Th>
              <Th>เกรด 1</Th><Th>เกรด 2</Th><Th>เกรด 3</Th><Th>เกรด 4</Th><Th>เกรด 5</Th>
              <Th>Owner</Th>
              {MONTH_LABELS.map((m) => <Th key={m}>{m}</Th>)}
              <Th style={{ background: 'var(--teal)', color: '#fff' }}>Individual Score</Th>
              <Th style={{ background: 'var(--teal)', color: '#fff' }}>Actual Score</Th>
            </tr>
          </thead>
          <tbody className="mono">
            {items.map((item) => {
              const monthActuals = actualsForItem(item.id);
              const { ind, act } = computeScores(item, monthActuals);
              return (
                <tr key={item.id}>
                  <Td sticky={0}>{regionMap.get(item.region_id ?? '') ?? '—'}</Td>
                  <Td sticky={110}>{categoryMap.get(item.category_id) ?? '—'}</Td>
                  <Td sticky={260} strong>
                    <input
                      defaultValue={item.name_th}
                      onBlur={(e) => handleFieldBlur(item.id, 'name_th', e.target.value)}
                      className="w-full bg-transparent outline-none"
                    />
                  </Td>
                  <Td>{item.weight}%</Td>
                  <Td>
                    <NumInput
                      defaultValue={item.flag_weight}
                      onBlur={(v) => handleFieldBlur(item.id, 'flag_weight', v)}
                    />
                  </Td>
                  <Td>{item.unit}</Td>
                  {(['grade_1', 'grade_2', 'grade_3', 'grade_4', 'grade_5'] as const).map((g) => (
                    <Td key={g}>
                      <NumInput defaultValue={item[g]} placeholder="TBD" onBlur={(v) => handleFieldBlur(item.id, g, v)} />
                    </Td>
                  ))}
                  <Td>
                    <input
                      defaultValue={item.owner_name ?? ''}
                      onBlur={(e) => handleFieldBlur(item.id, 'owner_name', e.target.value)}
                      className="w-full bg-transparent outline-none text-center"
                    />
                  </Td>
                  {MONTH_KEYS.map((mk, mi) => (
                    <Td key={mk}>
                      <NumInput
                        defaultValue={monthActuals[mk]}
                        onBlur={(v) => handleMonthBlur(item.id, mi + 1, v)}
                      />
                    </Td>
                  ))}
                  <Td strongColor>{ind === null ? '—' : ind.toFixed(3)}</Td>
                  <Td strongColor>{act === null ? '—' : act.toFixed(3)}</Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-[var(--ink-soft)] mt-3">
        หมายเหตุ: ค่าจริงที่กรอกในตารางนี้บันทึกที่ระดับ Region + KPI Item (ตรงกับไฟล์ต้นฉบับ) — การ roll-up จาก KPI
        Item ไปเป็นคะแนนรายบุคคลในหน้า Ranking ต้องมีการ map Owner/Mgr Area → พนักงานเพิ่ม (ยังไม่ได้ทำในเวอร์ชันนี้)
      </p>
    </div>
  );
}

function Th({ children, sticky, strong, style }: { children: React.ReactNode; sticky?: number; strong?: boolean; style?: React.CSSProperties }) {
  return (
    <th
      className={`sticky top-0 z-10 bg-[var(--panel-2)] text-[var(--ink-soft)] text-[10.8px] uppercase tracking-wide px-2 py-2 border-b border-r
        ${strong ? 'border-r-2 border-[var(--line-strong)]' : 'border-[var(--line-strong)]'}`}
      style={{ left: sticky, position: sticky !== undefined ? 'sticky' : undefined, zIndex: sticky !== undefined ? 20 : 10, ...style }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  sticky,
  strong,
  strongColor
}: {
  children: React.ReactNode;
  sticky?: number;
  strong?: boolean;
  strongColor?: boolean;
}) {
  return (
    <td
      className={`px-2 py-1.5 border-b border-r text-center ${strong ? 'border-r-2 border-[var(--line-strong)]' : 'border-[var(--line)]'}
        ${sticky !== undefined ? 'bg-[var(--panel)]' : ''} ${strongColor ? 'text-teal font-bold' : ''}`}
      style={{ left: sticky, position: sticky !== undefined ? 'sticky' : undefined, zIndex: sticky !== undefined ? 5 : undefined }}
    >
      {children}
    </td>
  );
}

function NumInput({ defaultValue, placeholder, onBlur }: { defaultValue: number | null; placeholder?: string; onBlur: (v: string) => void }) {
  return (
    <input
      type="number"
      step="0.01"
      defaultValue={defaultValue ?? ''}
      placeholder={placeholder}
      onBlur={(e) => onBlur(e.target.value)}
      className="w-16 bg-[var(--panel-2)] border border-[var(--line-strong)] rounded px-1.5 py-1 text-center outline-none focus:border-teal"
    />
  );
}

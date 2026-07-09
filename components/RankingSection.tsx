'use client';

import { useState } from 'react';

interface RankedRow {
  employeeId: string;
  name: string;
  region: string;
  photoUrl: string | null;
  y2dScore: number | null;
  rank: number | null;
  monthly: Record<number, { categoryScores: Record<string, number>; total: number | null }>;
}

interface Weight {
  code: string;
  name_th: string;
  top_level_weight: number;
}

export default function RankingSection({
  title,
  color,
  data,
  weights,
  monthLabels,
  defaultOpen = false,
  comingSoon = false
}: {
  title: string;
  color: string;
  data: RankedRow[];
  weights: Weight[];
  monthLabels: string[];
  defaultOpen?: boolean;
  comingSoon?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  // แสดงเฉพาะ 2 เดือนแรกที่มีข้อมูลจริงในตัวอย่างนี้ (ขยายเป็น 12 เดือนได้เมื่อกรอกข้อมูลครบ)
  const visibleMonths = [1, 2];

  return (
    <div className="border border-[var(--line)] rounded-xl mb-5.5 bg-[var(--panel)] shadow overflow-hidden">
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-[var(--panel-2)]"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-5.5 rounded" style={{ background: color }} />
          <h2 className="text-[15px] font-bold">
            {title} <span className="text-[11.5px] font-normal text-[var(--ink-soft)]">— Trend ใหญ่ &amp; ตารางคะแนน</span>
          </h2>
        </div>
        <span className={`text-[var(--ink-soft)] transition-transform ${open ? '' : '-rotate-90'}`}>▾</span>
      </div>

      {open && (
        <div className="px-4.5 pb-4.5">
          {comingSoon ? (
            <div className="text-center text-sm text-[var(--ink-soft)] bg-[var(--panel-2)] rounded-lg py-8">
              ยังไม่มีข้อมูล KPI ของ Cluster Leader — โครงสร้างตารางเตรียมไว้แล้ว รอกำหนดหมวด KPI และน้ำหนักคะแนนจริง
            </div>
          ) : (
            <div className="overflow-auto max-h-[480px] rounded-lg border border-[var(--line-strong)]">
              <table className="border-collapse w-full text-[12.5px] min-w-[900px]">
                <thead>
                  <tr>
                    <th
                      rowSpan={2}
                      className="sticky left-0 top-0 z-[3] bg-[var(--panel-2)] border-b border-r-2 border-[var(--line-strong)] px-2.5 py-2 text-left min-w-[210px]"
                    >
                      ชื่อ - พื้นที่
                    </th>
                    <th rowSpan={2} className="sticky top-0 z-[2] bg-[var(--panel-2)] border-b border-r border-[var(--line-strong)] px-2 py-2">
                      อันดับ<br />Y2D
                    </th>
                    <th rowSpan={2} className="sticky top-0 z-[2] bg-[var(--panel-2)] border-b border-r border-[var(--line-strong)] px-2 py-2">
                      Y2D<br />คะแนนรวม
                    </th>
                    {visibleMonths.map((m) => (
                      <th key={m} colSpan={weights.length + 1} className="sticky top-0 z-[2] bg-teal text-white border-r border-white/25 px-2 py-2">
                        {monthLabels[m - 1]}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    {visibleMonths.map((m) =>
                      [...weights, { code: '__total', name_th: 'รวม', top_level_weight: 0 }].map((w) => (
                        <th
                          key={`${m}-${w.code}`}
                          className="sticky top-[33px] z-[2] bg-[var(--panel-2)] border-b border-r border-[var(--line-strong)] px-2 py-2 text-[10.8px] uppercase text-[var(--ink-soft)]"
                        >
                          {w.name_th}
                          {w.top_level_weight ? ` ${(w.top_level_weight * 100).toFixed(0)}%` : ''}
                        </th>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody className="mono">
                  {data.length === 0 && (
                    <tr>
                      <td colSpan={3 + visibleMonths.length * (weights.length + 1)} className="text-center py-8 text-[var(--ink-soft)]">
                        ยังไม่มีข้อมูลพนักงานในชุดนี้ — เพิ่มรายชื่อได้ที่หน้า &quot;จัดการชื่อ&quot;
                      </td>
                    </tr>
                  )}
                  {data.map((row, i) => (
                    <tr key={row.employeeId} className={i % 2 === 1 ? 'bg-[var(--panel-2)]' : ''}>
                      <td className="sticky left-0 bg-[var(--panel)] border-b border-r-2 border-[var(--line-strong)] px-2.5 py-2 flex items-center gap-2">
                        <div className="w-6.5 h-6.5 rounded-full bg-[var(--panel-2)] border border-[var(--line)] overflow-hidden flex-shrink-0">
                          {row.photoUrl && <img src={row.photoUrl} className="w-full h-full object-cover" alt="" />}
                        </div>
                        <div>
                          {row.name}
                          <br />
                          <span className="text-[11px] text-[var(--ink-soft)]">{row.region}</span>
                        </div>
                      </td>
                      <td className="border-b border-r border-[var(--line)] text-center px-2 py-2">
                        {row.rank ? (
                          <span
                            className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-[11.5px] font-bold"
                            style={{ background: row.rank === 1 ? 'var(--teal)' : row.rank === 2 ? '#4E93A0' : row.rank === 3 ? '#7AA9AF' : 'var(--ink-soft)' }}
                          >
                            {row.rank}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="border-b border-r border-[var(--line)] text-center px-2 py-2 font-bold">
                        {row.y2dScore !== null ? row.y2dScore.toFixed(3) : '—'}
                      </td>
                      {visibleMonths.map((m) => {
                        const mo = row.monthly[m];
                        return (
                          <>
                            {weights.map((w) => (
                              <td key={`${m}-${w.code}`} className="border-b border-r border-[var(--line)] text-center px-2 py-2">
                                {mo?.categoryScores[w.code] !== undefined ? mo.categoryScores[w.code].toFixed(3) : '—'}
                              </td>
                            ))}
                            <td key={`${m}-total`} className="border-b border-r border-[var(--line)] text-center px-2 py-2 font-bold">
                              {mo?.total !== null && mo?.total !== undefined ? mo.total.toFixed(3) : '—'}
                            </td>
                          </>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

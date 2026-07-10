'use client';

import { useState } from 'react';

interface TrendRow {
  employeeId: string;
  name: string;
  monthly: Record<number, { total: number | null }>;
}

const PALETTE = ['#0E7C86', '#C98A2C', '#B5484F', '#3F8F5F', '#4E93A0', '#8A5FBF', '#D97B4F', '#5C7AEA', '#B08900', '#2E9E6C'];

export default function TrendChart({ data, monthLabels }: { data: TrendRow[]; monthLabels: string[] }) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [hover, setHover] = useState<{ x: number; y: number; label: string } | null>(null);

  // เดือนที่มีข้อมูลจริงอย่างน้อย 1 คน
  const monthsWithData = Array.from({ length: 12 }, (_, i) => i + 1).filter((m) =>
    data.some((row) => row.monthly[m]?.total !== null && row.monthly[m]?.total !== undefined)
  );
  const months = monthsWithData.length > 0 ? monthsWithData : [1];

  const allValues = data.flatMap((row) => months.map((m) => row.monthly[m]?.total).filter((v): v is number => v !== null && v !== undefined));
  const maxVal = allValues.length > 0 ? Math.max(...allValues, 0.001) : 1;
  const minVal = 0;

  const width = 900;
  const height = 260;
  const padL = 42;
  const padR = 16;
  const padT = 16;
  const padB = 30;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const xFor = (i: number) => padL + (months.length === 1 ? plotW / 2 : (i / (months.length - 1)) * plotW);
  const yFor = (v: number) => padT + plotH - ((v - minVal) / (maxVal - minVal || 1)) * plotH;

  const gridLines = 4;

  if (data.length === 0) {
    return (
      <div className="text-center text-sm text-[var(--ink-soft)] bg-[var(--panel-2)] rounded-lg py-8 mb-4">
        ยังไม่มีข้อมูลสำหรับแสดง Trend
      </div>
    );
  }

  return (
    <div className="mb-4 bg-[var(--panel-2)] rounded-lg p-3.5">
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-2 px-1">
        {data.map((row, i) => {
          const color = PALETTE[i % PALETTE.length];
          const isHidden = hidden.has(row.employeeId);
          return (
            <button
              key={row.employeeId}
              type="button"
              onClick={() =>
                setHidden((prev) => {
                  const next = new Set(prev);
                  if (next.has(row.employeeId)) next.delete(row.employeeId);
                  else next.add(row.employeeId);
                  return next;
                })
              }
              className={`flex items-center gap-1.5 text-[11.5px] px-1.5 py-0.5 rounded transition ${
                isHidden ? 'opacity-35' : 'opacity-100'
              } hover:bg-[var(--panel)]`}
            >
              <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ background: color }} />
              {row.name}
            </button>
          );
        })}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none" style={{ overflow: 'visible' }}>
        {Array.from({ length: gridLines + 1 }, (_, g) => {
          const v = (maxVal / gridLines) * g;
          const y = yFor(v);
          return (
            <g key={g}>
              <line x1={padL} x2={width - padR} y1={y} y2={y} stroke="var(--line)" strokeWidth={1} />
              <text x={padL - 8} y={y + 3} textAnchor="end" fontSize="10" fill="var(--ink-soft)">
                {v.toFixed(2)}
              </text>
            </g>
          );
        })}

        {months.map((m, i) => (
          <text key={m} x={xFor(i)} y={height - 8} textAnchor="middle" fontSize="10" fill="var(--ink-soft)">
            {monthLabels[m - 1]}
          </text>
        ))}

        {data.map((row, ri) => {
          if (hidden.has(row.employeeId)) return null;
          const color = PALETTE[ri % PALETTE.length];
          const points = months
            .map((m, i) => {
              const v = row.monthly[m]?.total;
              if (v === null || v === undefined) return null;
              return { x: xFor(i), y: yFor(v), v };
            })
            .filter((p): p is { x: number; y: number; v: number } => p !== null);

          if (points.length === 0) return null;
          const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

          return (
            <g key={row.employeeId}>
              <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={3.5}
                  fill={color}
                  stroke="var(--panel-2)"
                  strokeWidth={1.5}
                  onMouseEnter={() => setHover({ x: p.x, y: p.y, label: `${row.name}: ${p.v.toFixed(3)}` })}
                  onMouseLeave={() => setHover(null)}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </g>
          );
        })}

        {hover && (
          <g>
            <rect
              x={Math.min(Math.max(hover.x - 55, padL), width - padR - 110)}
              y={Math.max(hover.y - 30, 0)}
              width={110}
              height={22}
              rx={4}
              fill="var(--rail)"
            />
            <text
              x={Math.min(Math.max(hover.x - 55, padL), width - padR - 110) + 55}
              y={Math.max(hover.y - 30, 0) + 15}
              textAnchor="middle"
              fontSize="10.5"
              fill="#fff"
            >
              {hover.label}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

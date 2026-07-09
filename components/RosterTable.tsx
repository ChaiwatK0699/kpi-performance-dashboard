'use client';

import { useTransition } from 'react';
import { updateEmployee, addEmployee, removeEmployee, uploadEmployeePhoto } from '@/app/(app)/roster/actions';

interface Employee { id: string; full_name: string; region_id: string | null; photo_url: string | null; }
interface Region { id: string; code: string; }

export default function RosterTable({
  datasetType,
  employees,
  regions
}: {
  datasetType: 'ad' | 'manager';
  employees: Employee[];
  regions: Region[];
}) {
  const [isPending, startTransition] = useTransition();

  function handlePhotoChange(employeeId: string, file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      startTransition(async () => {
        await uploadEmployeePhoto(employeeId, file.name, base64);
      });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button
          onClick={() => startTransition(async () => { if (regions[0]) await addEmployee(datasetType, regions[0].id); })}
          className="px-3.5 py-2 rounded-lg border border-[var(--line-strong)] bg-[var(--panel)] text-[12.5px] font-medium hover:bg-[var(--panel-2)]"
        >
          + เพิ่มรายชื่อ
        </button>
      </div>
      <table className="border-collapse w-full text-[12.5px]">
        <thead>
          <tr>
            <th className="w-16 border-b border-r border-[var(--line-strong)] bg-[var(--panel-2)] py-2 text-[10.8px] uppercase text-[var(--ink-soft)]">รูป</th>
            <th className="border-b border-r border-[var(--line-strong)] bg-[var(--panel-2)] py-2 text-[10.8px] uppercase text-[var(--ink-soft)] min-w-[220px]">ชื่อ-นามสกุล</th>
            <th className="border-b border-r border-[var(--line-strong)] bg-[var(--panel-2)] py-2 text-[10.8px] uppercase text-[var(--ink-soft)]">Region</th>
            <th className="border-b border-[var(--line-strong)] bg-[var(--panel-2)] py-2 text-[10.8px] uppercase text-[var(--ink-soft)]"></th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td className="border-b border-r border-[var(--line)] text-center p-1.5">
                <label className="w-11 h-11 rounded-full border border-dashed border-[var(--line-strong)] bg-[var(--panel-2)] flex items-center justify-center cursor-pointer relative overflow-hidden mx-auto">
                  {emp.photo_url ? (
                    <img src={emp.photo_url} className="absolute inset-0 w-full h-full object-cover" alt="" />
                  ) : (
                    '📷'
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => e.target.files?.[0] && handlePhotoChange(emp.id, e.target.files[0])}
                  />
                </label>
              </td>
              <td className="border-b border-r border-[var(--line)] p-1.5">
                <input
                  defaultValue={emp.full_name}
                  onBlur={(e) => startTransition(async () => { await updateEmployee(emp.id, 'full_name', e.target.value); })}
                  className="w-full bg-[var(--panel-2)] border border-[var(--line-strong)] rounded px-2 py-1.5 outline-none focus:border-teal"
                />
              </td>
              <td className="border-b border-r border-[var(--line)] p-1.5">
                <select
                  defaultValue={emp.region_id ?? ''}
                  onChange={(e) => startTransition(async () => { await updateEmployee(emp.id, 'region_id', e.target.value); })}
                  className="w-full bg-[var(--panel-2)] border border-[var(--line-strong)] rounded px-2 py-1.5 outline-none focus:border-teal"
                >
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>{r.code}</option>
                  ))}
                </select>
              </td>
              <td className="border-b border-[var(--line)] text-center p-1.5">
                <button
                  onClick={() => startTransition(async () => { await removeEmployee(emp.id); })}
                  className="px-2.5 py-1.5 rounded border border-[var(--line-strong)] text-[12px] hover:bg-[var(--panel-2)]"
                >
                  ลบ
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isPending && <p className="text-[11.5px] text-[var(--ink-soft)] mt-2">กำลังบันทึก...</p>}
    </div>
  );
}

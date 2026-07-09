# KPI Performance Dashboard

ระบบประเมินผล KPI สำหรับ AD / Manager / Cluster Leader — Next.js 14 (App Router) + Supabase + Vercel

## ✅ สิ่งที่ทำเสร็จแล้วจริง (ไม่ใช่ mock)

- **Supabase Project จริง** สร้างแล้ว: `kpi-performance-dashboard` (org: ChaiwatK's, region: ap-southeast-1)
  - Project URL: `https://wcauykkknqwdvafwmfay.supabase.co`
  - ตารางทั้งหมด: `profiles, regions, kpi_categories, employees, kpi_items, kpi_monthly_actuals, score_summary_monthly, audit_logs`
  - RLS policies ครบทุกตาราง (`is_admin_or_dev()`, `is_active_user()` helper functions)
  - Trigger auto-สร้าง `profiles` เมื่อสมัครสมาชิกใหม่ (เช็ค domain `@ww` อัตโนมัติ)
  - Trigger audit log อัตโนมัติบน `kpi_items`, `kpi_monthly_actuals`, `profiles`
  - Storage bucket `employee-photos` (public read, admin/dev เขียนได้เท่านั้น)
  - Seed data จริงจากไฟล์ Excel ต้นฉบับ (Region BMA, 13 KPI items)
- **โค้ด Next.js ที่ build ผ่านจริงแล้ว** (`npm run build` สำเร็จ 100%, type-check ผ่าน) เชื่อมต่อ Supabase project ข้างต้นจริง ไม่ใช่ mock data
- หน้าที่ทำงานได้จริงกับ database:
  - `/login`, `/register`, `/verify`, `/pending-approval` — Supabase Auth จริง
  - `/ranking` — ดึงข้อมูลจริง คำนวณ Individual/Actual/Category/Total/Y2D/Ranking ด้วย engine เดียวกับที่ยืนยัน logic ไว้ (`lib/scoring.ts`)
  - `/backend/kpi` — แก้ไข KPI items + ค่าจริงรายเดือน บันทึกลง Supabase จริงทันทีที่ออกจากช่อง (auto-save on blur)
  - `/roster` — จัดการชื่อ/region/รูปพนักงาน อัปโหลดรูปขึ้น Supabase Storage จริง
  - `/users` — เปลี่ยน role, อนุมัติ/ระงับผู้ใช้ (เขียนลง `profiles` จริง)
  - `/audit-log` — อ่านประวัติการแก้ไขจริงจากตาราง `audit_logs`

## ⚠️ สิ่งที่ยังไม่เสร็จ / ต้องทำต่อ

1. **Service Role Key** — ไฟล์ `.env.local` ใส่ placeholder ไว้ (`SUPABASE_SERVICE_ROLE_KEY=REPLACE_ME...`)
   ต้องไปเอาจริงที่ Supabase Dashboard → Project Settings → API → เอาไปตั้งใน Vercel Environment Variables เอง (ไม่ควรส่งผ่านแชทเพราะเป็นคีย์สิทธิ์สูงสุด)
2. **Email sending** — ตอนนี้ Supabase Auth ใช้ built-in email (จำกัดโควต้า/เดือน) แนะนำต่อ SMTP จริงของบริษัท (Supabase Dashboard → Authentication → Email Templates/SMTP) ก่อนขึ้น production
3. **KPI Item ↔ พนักงาน mapping** — ตอนนี้หน้า `/backend/kpi` บันทึกค่าจริงที่ระดับ Region+KPI Item (employee_id = null) ตรงกับไฟล์ Excel ต้นฉบับ แต่หน้า `/ranking` คำนวณคะแนนโดยดึงจาก `employee_id` ที่ผูกไว้ — ต้องเพิ่มหน้า "mapping Owner/Mgr Area → พนักงาน" เพื่อให้ค่าที่กรอกใน backend ไหลไปเป็นคะแนนรายบุคคลอัตโนมัติ (ตอนนี้ทำ manual ผ่าน SQL insert ให้ 1 ตัวอย่างไว้ดูใน seed)
4. **Lock เดือนที่ปิดรอบแล้ว** — คอลัมน์ `is_locked` มีอยู่ใน `kpi_monthly_actuals` และ RLS ป้องกัน update ไว้แล้ว แต่ยังไม่มีปุ่ม/cron "ปิดรอบเดือน" ในหน้าเว็บ (ต้องเพิ่ม)
5. **12 เดือนเต็มในหน้า Ranking** — ตอนนี้โชว์ 2 เดือนแรกในตารางเพื่อไม่ให้กว้างเกินไป ขยายเป็น 12 เดือนได้โดยแก้ `visibleMonths` ใน `components/RankingSection.tsx`
6. **Cluster Leader** — โครงสร้างพร้อมรับ (`dataset_type='cluster_leader'`) แต่ยังไม่มี KPI categories/items จริง

## 🚀 วิธีรันในเครื่อง

```bash
npm install
npm run dev
# เปิด http://localhost:3000
```

## ☁️ วิธี Deploy ขึ้น Vercel (ทำเองตรงนี้ เพราะไม่มีเครื่องมือ deploy อัตโนมัติจากฝั่ง Claude)

1. Push โค้ดนี้ขึ้น GitHub repo (private แนะนำ)
2. เข้า [vercel.com](https://vercel.com) → New Project → Import จาก GitHub repo นี้
3. ตั้งค่า **Environment Variables** ใน Vercel (Project Settings → Environment Variables):
   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://wcauykkknqwdvafwmfay.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (ดูใน `.env.local` ที่แนบมา) |
   | `SUPABASE_SERVICE_ROLE_KEY` | (เอาจริงจาก Supabase Dashboard → Settings → API) |
4. Deploy — Vercel จะ build ด้วย `npm run build` อัตโนมัติ (ทดสอบแล้วว่าผ่านจริงในเครื่องนี้)
5. หลัง deploy แล้ว กลับไปที่ Supabase Dashboard → Authentication → URL Configuration → ใส่ Vercel domain จริงใน **Site URL** และ **Redirect URLs** (ไม่งั้น magic link/verify email จะ redirect ผิดที่)

## 📁 โครงสร้างโปรเจกต์

```
app/
  login/ register/ verify/ pending-approval/   ← หน้า auth (public)
  (app)/                                        ← ต้อง login (มี layout สร้าง sidebar/topbar)
    layout.tsx
    ranking/page.tsx
    backend/kpi/page.tsx + actions.ts
    roster/page.tsx + actions.ts
    users/page.tsx + actions.ts
    audit-log/page.tsx
lib/
  supabase/client.ts   ← browser client
  supabase/server.ts   ← server component client
  scoring.ts           ← calculation engine (ยืนยัน logic แล้ว)
  database.types.ts    ← TS types (เขียนมือ — แนะนำ generate จริงทีหลังด้วย
                          `npx supabase gen types typescript --project-id wcauykkknqwdvafwmfay`)
components/
  Sidebar.tsx Topbar.tsx RankingSection.tsx KpiEditTable.tsx RosterTable.tsx UsersTable.tsx
middleware.ts           ← session refresh + route guard ตาม role/status
```

## 🔐 Security ที่ implement แล้ว

- RLS ทุกตาราง (ไม่มีตารางไหนพึ่ง frontend อย่างเดียว)
- Session เก็บใน httpOnly cookie ผ่าน `@supabase/ssr` (ไม่ใช้ localStorage เก็บ token)
- Route guard ใน `middleware.ts`: เช็ค login + status active + role ก่อนเข้าทุกหน้า
- Audit log อัตโนมัติทุกการแก้ไข KPI/role ผ่าน DB trigger (ไม่ใช่ log จาก frontend ที่ปลอมได้)
- Storage bucket เขียนได้เฉพาะ admin/dev

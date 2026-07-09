export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-center px-6">
      <div className="max-w-sm">
        <div className="w-12 h-12 rounded-full bg-amber/20 text-amber flex items-center justify-center mx-auto mb-4 text-xl">
          ⏳
        </div>
        <h1 className="text-lg font-semibold mb-2">รอการอนุมัติจากผู้ดูแลระบบ</h1>
        <p className="text-sm text-[var(--ink-soft)] leading-relaxed">
          บัญชีของคุณสมัครด้วยอีเมลนอกบริษัท จึงต้องรอ Admin หรือ Dev อนุมัติสิทธิ์การใช้งานก่อน
          เมื่ออนุมัติแล้วจะสามารถเข้าสู่ระบบได้ตามปกติ
        </p>
      </div>
    </div>
  );
}

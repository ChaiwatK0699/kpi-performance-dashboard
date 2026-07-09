export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-center px-6">
      <div className="max-w-sm">
        <div className="w-12 h-12 rounded-full bg-[var(--teal-soft)] text-teal flex items-center justify-center mx-auto mb-4 text-xl">
          ✉
        </div>
        <h1 className="text-lg font-semibold mb-2">กรุณายืนยันอีเมลของคุณ</h1>
        <p className="text-sm text-[var(--ink-soft)] leading-relaxed">
          เราส่งลิงก์ยืนยันไปที่อีเมลบริษัทของคุณแล้ว กรุณาคลิกลิงก์ในอีเมลเพื่อเปิดใช้งานบัญชี
          หลังยืนยันแล้วสามารถกลับมา <a href="/login" className="text-teal font-medium">เข้าสู่ระบบ</a> ได้เลย
        </p>
      </div>
    </div>
  );
}

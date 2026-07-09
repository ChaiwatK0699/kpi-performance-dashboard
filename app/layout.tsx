import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ระบบประเมินผล KPI',
  description: 'ระบบติดตามและประเมินผล KPI รายเดือน — AD / Manager / Cluster Leader'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" data-theme="day">
      <body>{children}</body>
    </html>
  );
}

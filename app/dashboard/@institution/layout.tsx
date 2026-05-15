import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default function InstitutionDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

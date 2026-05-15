import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default function IndividualDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

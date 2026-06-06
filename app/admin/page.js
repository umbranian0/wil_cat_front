import { redirect } from 'next/navigation';
import AdminDashboard from './AdminDashboard';
import { getAdminFromCookies } from '@/lib/backoffice/auth';
import {
  getDashboardSummary,
  listCmsPages,
  listOrders,
  listProducts,
  listAuditEvents,
  listNotifications,
} from '@/lib/backoffice/repository';
import { listRiskEvents } from '@/lib/backoffice/security';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Backoffice - Wild Cat Ceramic',
};

export default async function AdminPage() {
  const admin = await getAdminFromCookies();
  if (!admin) redirect('/admin/login');

  const [summary, products, orders, pages, riskEvents, auditEvents, notifications] = await Promise.all([
    getDashboardSummary(),
    listProducts(),
    listOrders({ limit: 100 }),
    listCmsPages(),
    listRiskEvents(80),
    listAuditEvents(80),
    listNotifications(80),
  ]);

  return (
    <AdminDashboard
      admin={{ email: admin.email, role: admin.role }}
      csrf={admin.csrf}
      initialData={{ summary, products, orders, pages, riskEvents, auditEvents, notifications }}
    />
  );
}

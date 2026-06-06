import { requireAdmin } from '@/lib/backoffice/auth';
import { handleApiError, json } from '@/lib/backoffice/http';
import { getDashboardSummary, listAuditEvents } from '@/lib/backoffice/repository';
import { listRiskEvents } from '@/lib/backoffice/security';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = requireAdmin(request);
  if (auth.error) return auth.error;
  try {
    const [summary, riskEvents, auditEvents] = await Promise.all([
      getDashboardSummary(),
      listRiskEvents(80),
      listAuditEvents(80),
    ]);
    return json({ summary, riskEvents, auditEvents });
  } catch (error) {
    return handleApiError(error);
  }
}

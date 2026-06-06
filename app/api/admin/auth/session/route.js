import { getAdminFromRequest, getAuthReadiness, isAuthConfiguredForProduction } from '@/lib/backoffice/auth';
import { getStorageInfo } from '@/lib/backoffice/kv';
import { json } from '@/lib/backoffice/http';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) return json({ admin: null }, { status: 401 });

  return json({
    admin: {
      email: admin.email,
      role: admin.role,
      csrf: admin.csrf,
    },
    storage: getStorageInfo(),
    auth: getAuthReadiness(),
    productionAuthConfigured: isAuthConfiguredForProduction(),
  });
}

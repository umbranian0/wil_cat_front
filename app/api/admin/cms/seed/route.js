import { requireAdmin } from '@/lib/backoffice/auth';
import { handleApiError, json } from '@/lib/backoffice/http';
import { seedDefaultCmsPages } from '@/lib/backoffice/repository';
import { checkRateLimit, getClientContext } from '@/lib/backoffice/security';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const auth = requireAdmin(request, { mutation: true });
  if (auth.error) return auth.error;
  try {
    const context = getClientContext(request);
    const rate = await checkRateLimit('admin_mutation', `${context.ipHash}:${auth.admin.id}`, {
      limit: 80,
      windowSeconds: 10 * 60,
    });
    if (!rate.allowed) return json({ error: 'Too many admin changes.' }, { status: 429 });
    const pages = await seedDefaultCmsPages(auth.admin);
    return json({ pages });
  } catch (error) {
    return handleApiError(error);
  }
}

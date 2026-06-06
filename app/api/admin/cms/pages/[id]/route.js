import { requireAdmin } from '@/lib/backoffice/auth';
import { handleApiError, json } from '@/lib/backoffice/http';
import { getCmsPage, saveCmsPage } from '@/lib/backoffice/repository';
import { checkRateLimit, getClientContext } from '@/lib/backoffice/security';

export const dynamic = 'force-dynamic';

export async function PATCH(request, { params }) {
  const auth = requireAdmin(request, { mutation: true });
  if (auth.error) return auth.error;
  try {
    const context = getClientContext(request);
    const rate = await checkRateLimit('admin_mutation', `${context.ipHash}:${auth.admin.id}`, {
      limit: 80,
      windowSeconds: 10 * 60,
    });
    if (!rate.allowed) return json({ error: 'Too many admin changes.' }, { status: 429 });
    const previous = await getCmsPage(params.id);
    if (!previous) return json({ error: 'CMS page not found.' }, { status: 404 });
    const page = await saveCmsPage({ ...previous, ...(await request.json()), id: params.id }, { actor: auth.admin });
    return json({ page });
  } catch (error) {
    return handleApiError(error);
  }
}

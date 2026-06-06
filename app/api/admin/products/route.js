import { requireAdmin } from '@/lib/backoffice/auth';
import { handleApiError, json } from '@/lib/backoffice/http';
import { listProducts, saveProduct } from '@/lib/backoffice/repository';
import { checkRateLimit, getClientContext } from '@/lib/backoffice/security';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = requireAdmin(request);
  if (auth.error) return auth.error;
  try {
    const products = await listProducts();
    return json({ products });
  } catch (error) {
    return handleApiError(error);
  }
}

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
    const product = await saveProduct(await request.json(), { actor: auth.admin });
    return json({ product }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

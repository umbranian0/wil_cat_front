import { requireAdmin } from '@/lib/backoffice/auth';
import { handleApiError, json } from '@/lib/backoffice/http';
import { getOrderById, updateOrder } from '@/lib/backoffice/repository';
import { checkRateLimit, getClientContext } from '@/lib/backoffice/security';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const auth = requireAdmin(request);
  if (auth.error) return auth.error;
  try {
    const order = await getOrderById(params.id);
    if (!order) return json({ error: 'Order not found.' }, { status: 404 });
    return json({ order });
  } catch (error) {
    return handleApiError(error);
  }
}

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
    const order = await updateOrder(params.id, await request.json(), auth.admin);
    if (!order) return json({ error: 'Order not found.' }, { status: 404 });
    return json({ order });
  } catch (error) {
    return handleApiError(error);
  }
}

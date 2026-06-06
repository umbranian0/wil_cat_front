import { createOrder } from '@/lib/backoffice/repository';
import { checkRateLimit, getClientContext } from '@/lib/backoffice/security';
import { handleApiError, json } from '@/lib/backoffice/http';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const context = getClientContext(request);
    const rate = await checkRateLimit('order_submit', context.ipHash, {
      limit: 8,
      windowSeconds: 10 * 60,
    });
    if (!rate.allowed) {
      return json({ error: 'Too many order attempts.', retryAfter: rate.retryAfter }, { status: 429 });
    }

    const body = await request.json();
    const { order, idempotent } = await createOrder(body, context);
    return json({ order, idempotent }, { status: idempotent ? 200 : 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

import { createEnquiry } from '@/lib/backoffice/repository';
import { checkRateLimit, getClientContext } from '@/lib/backoffice/security';
import { handleApiError, json } from '@/lib/backoffice/http';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const context = getClientContext(request);
    const rate = await checkRateLimit('contact_submit', context.ipHash, {
      limit: 6,
      windowSeconds: 10 * 60,
    });
    if (!rate.allowed) {
      return json({ error: 'Too many contact attempts.', retryAfter: rate.retryAfter }, { status: 429 });
    }

    const body = await request.json();
    const enquiry = await createEnquiry(body, context);
    return json({ enquiry }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

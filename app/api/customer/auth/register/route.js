import { handleApiError, json } from '@/lib/backoffice/http';
import { checkRateLimit, getClientContext } from '@/lib/backoffice/security';
import { assertCustomerAuthReady, CUSTOMER_COOKIE, createCustomerSession, customerCookieOptions } from '@/lib/customer/auth';
import { createCustomer, publicCustomer } from '@/lib/customer/repository';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    assertCustomerAuthReady();
    const context = getClientContext(request);
    const body = await request.json();
    const rate = await checkRateLimit('customer_register', `${context.ipHash}:${body.email || ''}`, {
      limit: 5,
      windowSeconds: 15 * 60,
    });
    if (!rate.allowed) {
      return json({ error: 'Too many registration attempts. Please wait a few minutes and try again.', retryAfter: rate.retryAfter }, { status: 429 });
    }

    const customer = await createCustomer(body, context);
    const session = createCustomerSession(customer);
    const response = json({ customer: publicCustomer(customer), csrf: session.session.csrf }, { status: 201 });
    response.cookies.set(CUSTOMER_COOKIE, session.token, customerCookieOptions(session.maxAge));
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

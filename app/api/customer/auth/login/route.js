import { handleApiError, json } from '@/lib/backoffice/http';
import { checkRateLimit, getClientContext, recordRiskEvent, sha256 } from '@/lib/backoffice/security';
import { CUSTOMER_COOKIE, createCustomerSession, customerCookieOptions } from '@/lib/customer/auth';
import { authenticateCustomer, markCustomerLogin, publicCustomer } from '@/lib/customer/repository';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const context = getClientContext(request);
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const rate = await checkRateLimit('customer_login', `${context.ipHash}:${email}`, {
      limit: 8,
      windowSeconds: 15 * 60,
    });
    if (!rate.allowed) {
      return json({ error: 'Too many login attempts. Please wait a few minutes and try again.', retryAfter: rate.retryAfter }, { status: 429 });
    }

    const authenticated = await authenticateCustomer(body);
    if (!authenticated) {
      await recordRiskEvent({
        type: 'customer_login_failed',
        severity: 'medium',
        score: 35,
        subject: sha256(email),
        metadata: { emailHash: sha256(email) },
        ipHash: context.ipHash,
        userAgentHash: context.userAgentHash,
        requestId: context.requestId,
      });
      return json({ error: 'We couldn\'t sign you in. Please check your email and password and try again.' }, { status: 401 });
    }

    const customer = await markCustomerLogin(authenticated, context);
    const session = createCustomerSession(customer || authenticated);
    const response = json({ customer: publicCustomer(customer || authenticated), csrf: session.session.csrf });
    response.cookies.set(CUSTOMER_COOKIE, session.token, customerCookieOptions(session.maxAge));
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

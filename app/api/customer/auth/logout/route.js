import { handleApiError, json } from '@/lib/backoffice/http';
import { CUSTOMER_COOKIE, customerCookieOptions, requireCustomer } from '@/lib/customer/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const auth = requireCustomer(request, { mutation: true });
  if (auth.error) return auth.error;

  try {
    const response = json({ ok: true });
    response.cookies.set(CUSTOMER_COOKIE, '', customerCookieOptions(0));
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

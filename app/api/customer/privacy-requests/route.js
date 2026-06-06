import { handleApiError, json } from '@/lib/backoffice/http';
import { getClientContext } from '@/lib/backoffice/security';
import { requireCustomer } from '@/lib/customer/auth';
import { createCustomerPrivacyRequest, listCustomerPrivacyRequests } from '@/lib/customer/repository';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = requireCustomer(request);
  if (auth.error) return auth.error;

  try {
    const privacyRequests = await listCustomerPrivacyRequests(auth.customer.id);
    return json({ privacyRequests });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  const auth = requireCustomer(request, { mutation: true });
  if (auth.error) return auth.error;

  try {
    const context = getClientContext(request);
    const privacyRequest = await createCustomerPrivacyRequest(auth.customer.id, await request.json(), context);
    if (!privacyRequest) return json({ error: 'Customer not found.' }, { status: 404 });
    return json({ privacyRequest }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

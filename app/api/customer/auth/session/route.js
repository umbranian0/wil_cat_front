import { handleApiError, json } from '@/lib/backoffice/http';
import { getCustomerSessionFromRequest } from '@/lib/customer/auth';
import { getCustomerById, publicCustomer } from '@/lib/customer/repository';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = getCustomerSessionFromRequest(request);
    if (!session) return json({ customer: null, csrf: '' });
    const customer = await getCustomerById(session.id);
    if (!customer || customer.status !== 'active') return json({ customer: null, csrf: '' });
    return json({ customer: publicCustomer(customer), csrf: session.csrf });
  } catch (error) {
    return handleApiError(error);
  }
}

import { handleApiError, json } from '@/lib/backoffice/http';
import { getClientContext } from '@/lib/backoffice/security';
import { requireCustomer } from '@/lib/customer/auth';
import {
  getCustomerById,
  listCustomerAddresses,
  listCustomerConsents,
  listCustomerPrivacyRequests,
  publicCustomer,
  updateCustomerProfile,
} from '@/lib/customer/repository';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = requireCustomer(request);
  if (auth.error) return auth.error;

  try {
    const customer = await getCustomerById(auth.customer.id);
    if (!customer) return json({ error: 'Customer not found.' }, { status: 404 });
    const [addresses, consents, privacyRequests] = await Promise.all([
      listCustomerAddresses(customer.id),
      listCustomerConsents(customer.id),
      listCustomerPrivacyRequests(customer.id),
    ]);
    return json({
      customer: publicCustomer(customer),
      addresses,
      consents,
      privacyRequests,
      csrf: auth.customer.csrf,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request) {
  const auth = requireCustomer(request, { mutation: true });
  if (auth.error) return auth.error;

  try {
    const context = getClientContext(request);
    const customer = await updateCustomerProfile(auth.customer.id, await request.json(), context);
    if (!customer) return json({ error: 'Customer not found.' }, { status: 404 });
    return json({ customer: publicCustomer(customer) });
  } catch (error) {
    return handleApiError(error);
  }
}

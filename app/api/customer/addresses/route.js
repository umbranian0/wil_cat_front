import { handleApiError, json } from '@/lib/backoffice/http';
import { getClientContext } from '@/lib/backoffice/security';
import { requireCustomer } from '@/lib/customer/auth';
import { listCustomerAddresses, saveCustomerAddress } from '@/lib/customer/repository';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = requireCustomer(request);
  if (auth.error) return auth.error;

  try {
    const addresses = await listCustomerAddresses(auth.customer.id);
    return json({ addresses });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  const auth = requireCustomer(request, { mutation: true });
  if (auth.error) return auth.error;

  try {
    const context = getClientContext(request);
    const address = await saveCustomerAddress(auth.customer.id, await request.json(), context);
    return json({ address }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

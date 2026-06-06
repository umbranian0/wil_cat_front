import { handleApiError, json } from '@/lib/backoffice/http';
import { getClientContext } from '@/lib/backoffice/security';
import { requireCustomer } from '@/lib/customer/auth';
import { deleteCustomerAddress, saveCustomerAddress } from '@/lib/customer/repository';

export const dynamic = 'force-dynamic';

export async function PATCH(request, { params }) {
  const auth = requireCustomer(request, { mutation: true });
  if (auth.error) return auth.error;

  try {
    const context = getClientContext(request);
    const address = await saveCustomerAddress(auth.customer.id, { ...(await request.json()), id: params.id }, context);
    return json({ address });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request, { params }) {
  const auth = requireCustomer(request, { mutation: true });
  if (auth.error) return auth.error;

  try {
    const context = getClientContext(request);
    const address = await deleteCustomerAddress(auth.customer.id, params.id, context);
    if (!address) return json({ error: 'Address not found.' }, { status: 404 });
    return json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}

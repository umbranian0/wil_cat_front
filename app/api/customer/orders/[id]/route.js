import { handleApiError, json } from '@/lib/backoffice/http';
import { requireCustomer } from '@/lib/customer/auth';
import { getCustomerById, getCustomerOrderById } from '@/lib/customer/repository';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const auth = requireCustomer(request);
  if (auth.error) return auth.error;

  try {
    const customer = await getCustomerById(auth.customer.id);
    if (!customer) return json({ error: 'Customer not found.' }, { status: 404 });
    const order = await getCustomerOrderById(customer, params.id);
    if (!order) return json({ error: 'Order not found.' }, { status: 404 });
    return json({ order });
  } catch (error) {
    return handleApiError(error);
  }
}

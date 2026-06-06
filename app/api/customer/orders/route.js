import { handleApiError, json } from '@/lib/backoffice/http';
import { requireCustomer } from '@/lib/customer/auth';
import { getCustomerById, listCustomerOrders } from '@/lib/customer/repository';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = requireCustomer(request);
  if (auth.error) return auth.error;

  try {
    const customer = await getCustomerById(auth.customer.id);
    if (!customer) return json({ error: 'Customer not found.' }, { status: 404 });
    const orders = await listCustomerOrders(customer);
    return json({ orders });
  } catch (error) {
    return handleApiError(error);
  }
}

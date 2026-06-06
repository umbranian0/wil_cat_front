import { requireAdmin } from '@/lib/backoffice/auth';
import { handleApiError, json } from '@/lib/backoffice/http';
import { getClientContext } from '@/lib/backoffice/security';
import {
  adminResetCustomerPassword,
  adminUpdateCustomerStatus,
  getCustomerById,
  publicCustomer,
} from '@/lib/customer/repository';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const auth = requireAdmin(request);
  if (auth.error) return auth.error;
  try {
    const customer = await getCustomerById(params.id);
    if (!customer) return json({ error: 'Customer not found.' }, { status: 404 });
    return json({ customer: publicCustomer(customer) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request, { params }) {
  const auth = requireAdmin(request, { mutation: true });
  if (auth.error) return auth.error;
  try {
    const context = getClientContext(request);
    const body = await request.json();
    let customer;

    if (body.newPassword !== undefined) {
      customer = await adminResetCustomerPassword(params.id, body.newPassword, auth.admin, context);
    } else if (body.status !== undefined) {
      customer = await adminUpdateCustomerStatus(params.id, body.status, auth.admin, context);
    } else {
      return json({ error: 'Nothing to update.' }, { status: 400 });
    }

    if (!customer) return json({ error: 'Customer not found.' }, { status: 404 });
    return json({ customer });
  } catch (error) {
    return handleApiError(error);
  }
}

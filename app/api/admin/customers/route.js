import { requireAdmin } from '@/lib/backoffice/auth';
import { handleApiError, json } from '@/lib/backoffice/http';
import { listAllCustomers } from '@/lib/customer/repository';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = requireAdmin(request);
  if (auth.error) return auth.error;
  try {
    const customers = await listAllCustomers();
    return json({ customers });
  } catch (error) {
    return handleApiError(error);
  }
}

import { handleApiError, json } from '@/lib/backoffice/http';
import { getClientContext } from '@/lib/backoffice/security';
import { requireCustomer } from '@/lib/customer/auth';
import { changeCustomerPassword } from '@/lib/customer/repository';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const auth = requireCustomer(request, { mutation: true });
  if (auth.error) return auth.error;

  try {
    const context = getClientContext(request);
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return json({ error: 'Both current and new password are required.' }, { status: 400 });
    }

    await changeCustomerPassword(auth.customer.id, currentPassword, newPassword, context);
    return json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}

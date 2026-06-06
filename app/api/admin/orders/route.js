import { requireAdmin } from '@/lib/backoffice/auth';
import { handleApiError, json } from '@/lib/backoffice/http';
import { listOrders } from '@/lib/backoffice/repository';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = requireAdmin(request);
  if (auth.error) return auth.error;
  try {
    const { searchParams } = new URL(request.url);
    const orders = await listOrders({
      status: searchParams.get('status') || undefined,
      email: searchParams.get('email') || undefined,
      limit: Number(searchParams.get('limit') || 100),
    });
    return json({ orders });
  } catch (error) {
    return handleApiError(error);
  }
}

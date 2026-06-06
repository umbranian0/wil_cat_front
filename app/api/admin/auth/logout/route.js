import { ADMIN_COOKIE, adminCookieOptions, requireAdmin } from '@/lib/backoffice/auth';
import { json } from '@/lib/backoffice/http';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const auth = requireAdmin(request, { mutation: true });
  if (auth.error) return auth.error;
  const response = json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, '', adminCookieOptions(0));
  return response;
}

import { adminCookieOptions, loginAdmin } from '@/lib/backoffice/auth';
import { handleApiError, json } from '@/lib/backoffice/http';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await loginAdmin(request, body);
    if (!result.ok) return json({ error: result.error }, { status: result.status });

    const response = json({
      admin: {
        email: result.session.email,
        role: result.session.role,
        csrf: result.session.csrf,
      },
    });
    response.cookies.set('wc_admin_session', result.token, adminCookieOptions(result.maxAge));
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

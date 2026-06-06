import { requireAdmin } from '@/lib/backoffice/auth';
import { getMediaUploadLimitBytes, uploadProductImage } from '@/lib/backoffice/media';
import { handleApiError, json } from '@/lib/backoffice/http';
import { checkRateLimit, getClientContext } from '@/lib/backoffice/security';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
  const auth = requireAdmin(request, { mutation: true });
  if (auth.error) return auth.error;

  try {
    const contentLength = Number(request.headers.get('content-length') || 0);
    const maxRequestBytes = getMediaUploadLimitBytes() + 1024 * 1024;
    if (contentLength > maxRequestBytes) return json({ error: 'Image upload request is too large.' }, { status: 413 });

    const context = getClientContext(request);
    const rate = await checkRateLimit('admin_upload', `${context.ipHash}:${auth.admin.id}`, {
      limit: 25,
      windowSeconds: 10 * 60,
    });
    if (!rate.allowed) return json({ error: 'Too many image uploads.' }, { status: 429 });

    const form = await request.formData();
    const asset = await uploadProductImage(form.get('file'), {
      productName: form.get('productName'),
      productId: form.get('productId'),
      productSlug: form.get('productSlug'),
      actorId: auth.admin.id,
      actorEmail: auth.admin.email,
    });

    return json({ asset }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

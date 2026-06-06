import { getProductBySlug } from '@/lib/backoffice/repository';
import { handleApiError, json } from '@/lib/backoffice/http';

export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
  try {
    const product = await getProductBySlug(params.slug, { publicOnly: true });
    if (!product) return json({ error: 'Product not found.' }, { status: 404 });
    return json({ product });
  } catch (error) {
    return handleApiError(error);
  }
}

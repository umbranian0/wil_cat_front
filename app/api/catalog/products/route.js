import { listPublishedProducts } from '@/lib/catalog';
import { handleApiError, json } from '@/lib/backoffice/http';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await listPublishedProducts();
    return json({ products });
  } catch (error) {
    return handleApiError(error);
  }
}

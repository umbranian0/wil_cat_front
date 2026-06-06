import { listPublicProducts } from '@/lib/backoffice/repository';
import { handleApiError, json } from '@/lib/backoffice/http';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await listPublicProducts();
    return json({ products });
  } catch (error) {
    return handleApiError(error);
  }
}

import { notFound } from 'next/navigation';
import ConfiguratorClient from './ConfiguratorClient';
import { getAdminFromCookies, getAuthReadiness, isAuthConfiguredForProduction } from '@/lib/backoffice/auth';
import { getMediaReadiness } from '@/lib/backoffice/media';
import { getStorageInfo } from '@/lib/backoffice/kv';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'First-start Configurator - Wild Cat Ceramic',
};

export default async function ConfiguratorPage() {
  const admin = await getAdminFromCookies();
  // Only reachable on a brand-new install (admin login not configured yet),
  // or by a logged-in admin. Everyone else gets "page not found".
  if (!admin && isAuthConfiguredForProduction()) notFound();
  const auth = getAuthReadiness();
  const media = getMediaReadiness();
  const storage = getStorageInfo();

  return (
    <ConfiguratorClient
      canRegenerate={Boolean(admin) || !auth.productionReady}
      initialAuth={auth}
      initialMedia={media}
      initialStorage={storage}
      isAdmin={Boolean(admin)}
    />
  );
}

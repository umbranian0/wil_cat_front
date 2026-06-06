import ConfiguratorClient from './ConfiguratorClient';
import { getAdminFromCookies, getAuthReadiness } from '@/lib/backoffice/auth';
import { getMediaReadiness } from '@/lib/backoffice/cloudinary';
import { getStorageInfo } from '@/lib/backoffice/kv';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'First-start Configurator - Wild Cat Ceramic',
};

export default async function ConfiguratorPage() {
  const admin = await getAdminFromCookies();
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

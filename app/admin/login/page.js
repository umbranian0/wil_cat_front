import { redirect } from 'next/navigation';
import LoginClient from './LoginClient';
import { getAdminFromCookies } from '@/lib/backoffice/auth';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Backoffice Login - Atelier Studio',
};

export default async function LoginPage() {
  const admin = await getAdminFromCookies();
  if (admin) redirect('/admin');
  return <LoginClient showLocalFallback={process.env.NODE_ENV !== 'production'} />;
}

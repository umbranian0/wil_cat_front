import { redirect } from 'next/navigation';
import { getCmsPageBySlug } from '@/lib/catalog';
import { accountContentFromPage } from '@/lib/cmsContent';
import { getCustomerSessionFromCookies } from '@/lib/customer/auth';
import { getCustomerById } from '@/lib/customer/repository';
import AccountLoginClient from './AccountLoginClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Customer login - Wild Cat Ceramic',
};

export default async function AccountLoginPage() {
  const session = await getCustomerSessionFromCookies();
  if (session) {
    const customer = await getCustomerById(session.id);
    if (customer?.status === 'active') redirect('/account');
  }

  const page = await getCmsPageBySlug('account');
  return <AccountLoginClient content={accountContentFromPage(page)} />;
}

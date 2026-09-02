import { redirect } from 'next/navigation';
import { getCmsPageBySlug } from '@/lib/catalog';
import { accountContentFromPage } from '@/lib/cmsContent';
import { getCustomerSessionFromCookies } from '@/lib/customer/auth';
import {
  getCustomerById,
  listCustomerAddresses,
  listCustomerConsents,
  listCustomerOrders,
  listCustomerPrivacyRequests,
  publicCustomer,
} from '@/lib/customer/repository';
import AccountDashboardClient from '../AccountDashboardClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Order status - Atelier Studio',
};

export default async function AccountOrdersPage() {
  const session = await getCustomerSessionFromCookies();
  if (!session) redirect('/account/login');

  const customer = await getCustomerById(session.id);
  if (!customer || customer.status !== 'active') redirect('/account/login');

  const [orders, addresses, consents, privacyRequests, cmsPage] = await Promise.all([
    listCustomerOrders(customer),
    listCustomerAddresses(customer.id),
    listCustomerConsents(customer.id),
    listCustomerPrivacyRequests(customer.id),
    getCmsPageBySlug('account'),
  ]);

  return (
    <AccountDashboardClient
      initialData={{
        customer: publicCustomer(customer),
        orders,
        addresses,
        consents,
        privacyRequests,
        csrf: session.csrf,
        content: accountContentFromPage(cmsPage),
      }}
    />
  );
}

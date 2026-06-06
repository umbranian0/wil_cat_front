export const DEFAULT_NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/faq', label: 'FAQ' },
  { href: '/account', label: 'My Account' },
];

export const DEFAULT_ACCOUNT_CONTENT = {
  eyebrow: 'Customer care',
  heading: 'My Account',
  intro: 'Follow orders, manage saved addresses, and control privacy preferences in one place.',
  loginTitle: 'Welcome back',
  registerTitle: 'Create an account',
  authIntro: 'Use your customer account for faster checkout and order-status updates.',
  ordersLabel: 'Orders',
  addressesLabel: 'Addresses',
  privacyLabel: 'Privacy',
  profileLabel: 'Profile',
  signOutLabel: 'Sign out',
  ordersTitle: 'Order status',
  addressesTitle: 'Saved addresses',
  privacyTitle: 'Data protection',
  profileTitle: 'Profile',
  emptyOrdersText: 'No customer orders are linked to this account yet.',
  emptyPrivacyRequestsText: 'No privacy requests have been submitted.',
  emptyConsentText: 'No consent records are available.',
  features: [
    {
      title: 'Order status',
      text: 'See each request from submission through confirmation, payment, packing, and shipping.',
    },
    {
      title: 'Saved addresses',
      text: 'Keep delivery details ready for future orders without retyping them at checkout.',
    },
    {
      title: 'Privacy control',
      text: 'Review consent records and submit access, correction, deletion, or portability requests.',
    },
  ],
};

export const DEFAULT_PRIVACY_CONTENT = {
  eyebrow: 'Privacy',
  heading: 'Privacy policy',
  intro: 'This page explains how customer account, order, address, and consent data is handled for Wild Cat Ceramic.',
  sections: [
    {
      title: 'Controller',
      body: 'Wild Cat Ceramica processes customer data for account management, order handling, customer communication, and legal record keeping. The business owner should replace this paragraph with the final controller name, address, and contact email before production release.',
    },
    {
      title: 'Personal data we process',
      body: 'We process account details, contact details, shipping and billing addresses, order history, customer messages, consent records, privacy-request records, and technical security metadata such as hashed IP and browser identifiers used for abuse prevention.',
    },
    {
      title: 'Purposes and lawful bases',
      body: 'Account creation and order management are processed for contract preparation or performance. Accounting and dispute records may be retained for legal obligations or legitimate interests. Marketing email is processed only where the customer has given separate consent and may be withdrawn at any time.',
    },
    {
      title: 'Retention',
      body: 'Customer account records are retained while the account remains active. Order records are retained for operational, accounting, and dispute-resolution purposes according to applicable law. Marketing consent records are retained to evidence consent and withdrawal history.',
    },
    {
      title: 'Customer rights',
      body: 'Customers may request access, rectification, erasure, restriction, portability, objection, or withdrawal of consent where applicable. Some requests may be limited where records must be retained for legal obligations, accounting, dispute handling, or fraud prevention.',
    },
    {
      title: 'Security',
      body: 'Customer passwords are stored as salted password hashes. Customer sessions use HTTP-only cookies. Access to order status is restricted to the authenticated customer account linked to the order.',
    },
    {
      title: 'International transfers',
      body: 'Hosting, email, analytics, payment, or logistics providers may process data outside Portugal or the European Economic Area depending on the configured production services. The production service list should be reviewed before release.',
    },
    {
      title: 'Policy version',
      body: 'Current policy version: 2026-06-06. Consent and policy acceptance records store this version with a timestamp.',
    },
  ],
};

function blocksFromPage(page) {
  return Array.isArray(page?.blocks) ? page.blocks : [];
}

export function navigationLinksFromPage(page) {
  const links = blocksFromPage(page)
    .filter((block) => block.type === 'nav_link' && block.href && block.label)
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
    .map((block) => ({ href: block.href, label: block.label }));

  return links.length ? links : DEFAULT_NAV_LINKS;
}

export function accountContentFromPage(page) {
  const blocks = blocksFromPage(page);
  const header = blocks.find((block) => block.type === 'account_header') || {};
  const auth = blocks.find((block) => block.type === 'account_auth') || {};
  const labels = blocks.find((block) => block.type === 'account_labels') || {};
  const features = blocks
    .filter((block) => block.type === 'account_feature' && block.title)
    .map((block) => ({ title: block.title, text: block.text || '' }));

  return {
    ...DEFAULT_ACCOUNT_CONTENT,
    ...header,
    ...auth,
    ...labels,
    features: features.length ? features : DEFAULT_ACCOUNT_CONTENT.features,
  };
}

export function privacyContentFromPage(page) {
  const blocks = blocksFromPage(page);
  const header = blocks.find((block) => block.type === 'privacy_header') || {};
  const sections = blocks
    .filter((block) => block.type === 'privacy_section' && block.title)
    .map((block) => ({ title: block.title, body: block.body || '' }));

  return {
    ...DEFAULT_PRIVACY_CONTENT,
    ...header,
    sections: sections.length ? sections : DEFAULT_PRIVACY_CONTENT.sections,
  };
}

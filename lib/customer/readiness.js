export function getCustomerAuthReadiness() {
  const secretConfigured = Boolean(
    process.env.CUSTOMER_SESSION_SECRET ||
    process.env.customer_session_secret
  );
  const secureCookie =
    process.env.CUSTOMER_COOKIE_SECURE === 'false'
      ? false
      : process.env.NODE_ENV === 'production';
  const warnings = [];

  if (!secretConfigured) warnings.push('Customer session secret is not configured for production.');
  if (!secureCookie) warnings.push('Customer secure cookies are disabled; use this only for local HTTP smoke tests.');

  return {
    sessionSecretConfigured: secretConfigured,
    secureCookie,
    productionReady: secretConfigured && secureCookie,
    warnings,
  };
}

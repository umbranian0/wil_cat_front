'use client';

import { useMemo, useState } from 'react';

function randomBase64Url(byteLength = 32) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function makePassword() {
  return `${randomBase64Url(12)}-${randomBase64Url(12)}`;
}

function makeConfig(email = 'owner@example.com') {
  return {
    adminEmail: email,
    adminPassword: makePassword(),
    adminSessionSecret: randomBase64Url(48),
  };
}

export default function ConfiguratorClient({ canRegenerate, initialAuth, initialMedia, initialStorage, isAdmin }) {
  const [email, setEmail] = useState('owner@example.com');
  const [config, setConfig] = useState(() => makeConfig('owner@example.com'));

  function regenerate() {
    setConfig(makeConfig(email));
  }

  const envBlock = useMemo(
    () => [
      `ADMIN_EMAIL=${config.adminEmail}`,
      `ADMIN_PASSWORD=${config.adminPassword}`,
      `ADMIN_SESSION_SECRET=${config.adminSessionSecret}`,
    ].join('\n'),
    [config]
  );

  const vercelCli = useMemo(
    () => [
      `printf "${config.adminEmail}" | vercel env add ADMIN_EMAIL production`,
      `printf "${config.adminPassword}" | vercel env add ADMIN_PASSWORD production`,
      `printf "${config.adminSessionSecret}" | vercel env add ADMIN_SESSION_SECRET production`,
      'vercel --prod',
    ].join('\n'),
    [config]
  );

  const cloudinaryEnvBlock = useMemo(
    () => [
      'CLOUDINARY_CLOUD_NAME=<your_cloud_name>',
      'CLOUDINARY_API_KEY=<your_api_key>',
      'CLOUDINARY_API_SECRET=<your_api_secret>',
      `CLOUDINARY_UPLOAD_FOLDER=${initialMedia.uploadFolder || 'wild-cat/products'}`,
      `CLOUDINARY_MAX_UPLOAD_MB=${initialMedia.maxUploadMb || 5}`,
      `NEXT_PUBLIC_PRODUCT_IMAGE_FALLBACK_URL=${initialMedia.fallbackImage || '/images/pannel.png'}`,
    ].join('\n'),
    [initialMedia]
  );

  const cloudinaryCli = useMemo(
    () => [
      'printf "<your_cloud_name>" | vercel env add CLOUDINARY_CLOUD_NAME production',
      'printf "<your_api_key>" | vercel env add CLOUDINARY_API_KEY production',
      'printf "<your_api_secret>" | vercel env add CLOUDINARY_API_SECRET production',
      `printf "${initialMedia.uploadFolder || 'wild-cat/products'}" | vercel env add CLOUDINARY_UPLOAD_FOLDER production`,
      `printf "${initialMedia.maxUploadMb || 5}" | vercel env add CLOUDINARY_MAX_UPLOAD_MB production`,
      `printf "${initialMedia.fallbackImage || '/images/pannel.png'}" | vercel env add NEXT_PUBLIC_PRODUCT_IMAGE_FALLBACK_URL production`,
      'vercel --prod',
    ].join('\n'),
    [initialMedia]
  );

  return (
    <main className="min-h-screen bg-cream-100 px-6 py-16 text-charcoal">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-cream-500">
            Wild Cat Ceramic
          </p>
          <h1 className="mt-2 font-serif text-4xl font-light">First-start configurator</h1>
          <p className="mt-3 max-w-2xl font-sans text-sm leading-6 text-charcoal/65">
            Generate the required backoffice environment variables for Vercel. Existing secret values are never read
            or displayed by the app. After saving these values in Vercel, redeploy the project.
          </p>
        </div>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <ReadinessCard
            title="Storage"
            ready={initialStorage.productionReady}
            rows={[
              ['Provider', initialStorage.provider],
              ['Upstash configured', initialStorage.upstashConfigured ? 'yes' : 'no'],
            ]}
            warnings={initialStorage.warnings || []}
          />
          <ReadinessCard
            title="Admin auth"
            ready={initialAuth.productionReady}
            rows={[
              ['Password configured', initialAuth.passwordConfigured ? 'yes' : 'no'],
              ['Session secret configured', initialAuth.sessionSecretConfigured ? 'yes' : 'no'],
              ['Secure cookies', initialAuth.secureCookie ? 'enabled' : 'disabled'],
            ]}
            warnings={initialAuth.warnings || []}
          />
          <ReadinessCard
            title="Media"
            ready={initialMedia.productionReady}
            rows={[
              ['Provider', initialMedia.provider],
              ['Cloud name', initialMedia.cloudNameConfigured ? 'yes' : 'no'],
              ['API key', initialMedia.apiKeyConfigured ? 'yes' : 'no'],
              ['API secret', initialMedia.apiSecretConfigured ? 'yes' : 'no'],
              ['Fallback', initialMedia.fallbackImage],
            ]}
            warnings={initialMedia.warnings || []}
          />
        </section>

        <section className="border border-charcoal/10 bg-cream-200 p-6">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <label className="block flex-1">
              <span className="mb-1 block font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal/45">
                Owner email
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full border border-charcoal/15 bg-cream-100 px-3 py-3 font-sans text-sm outline-none focus:border-charcoal"
              />
            </label>
            <button
              type="button"
              onClick={regenerate}
              disabled={!canRegenerate}
              className="bg-charcoal px-5 py-3 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-cream-100 hover:bg-terracotta disabled:opacity-50"
            >
              Regenerate values
            </button>
          </div>

          {!canRegenerate && (
            <p className="mb-4 border border-terracotta/40 p-3 font-sans text-sm text-terracotta">
              Sign in as an admin to regenerate values after the first setup is complete.
            </p>
          )}

          <div className="grid gap-5">
            <CodeBlock title="Vercel environment variables" value={envBlock} />
            <CodeBlock title="Vercel CLI helper" value={vercelCli} />
            <CodeBlock title="Cloudinary environment template" value={cloudinaryEnvBlock} />
            <CodeBlock title="Cloudinary Vercel CLI helper" value={cloudinaryCli} />
          </div>

          <div className="mt-6 border border-charcoal/10 bg-cream-100 p-4 font-sans text-sm leading-6 text-charcoal/65">
            <p className="font-semibold text-charcoal">Required storage variables</p>
            <p>
              The Upstash integration in Vercel usually creates <code>KV_REST_API_URL</code> and{' '}
              <code>KV_REST_API_TOKEN</code>. The app also supports <code>UPSTASH_REDIS_REST_URL</code> and{' '}
              <code>UPSTASH_REDIS_REST_TOKEN</code>.
            </p>
            <p className="mt-2">
              Product image uploads require Cloudinary. The app stores image files in Cloudinary and keeps only the
              returned secure URL in KV. If a product image cannot load, the storefront uses the single global fallback
              from <code>NEXT_PUBLIC_PRODUCT_IMAGE_FALLBACK_URL</code>.
            </p>
            <p className="mt-2">
              This configurator does not write variables to Vercel automatically. That would require storing a Vercel
              API token in the app runtime, which should be avoided unless explicitly designed and audited.
            </p>
          </div>

          {isAdmin && (
            <a
              href="/admin"
              className="mt-5 inline-block border border-charcoal px-5 py-3 font-sans text-xs font-semibold uppercase tracking-[0.12em] hover:bg-charcoal hover:text-cream-100"
            >
              Back to admin
            </a>
          )}
        </section>
      </div>
    </main>
  );
}

function ReadinessCard({ title, ready, rows, warnings }) {
  return (
    <div className="border border-charcoal/10 bg-cream-200 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-serif text-2xl font-light">{title}</h2>
        <span className={ready ? 'font-sans text-sm font-semibold text-[#4A7C59]' : 'font-sans text-sm font-semibold text-terracotta'}>
          {ready ? 'ready' : 'needs setup'}
        </span>
      </div>
      <div className="space-y-2 font-sans text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 border-b border-charcoal/10 pb-2">
            <span className="text-charcoal/55">{label}</span>
            <span className="font-medium">{value}</span>
          </div>
        ))}
      </div>
      {warnings.map((warning) => (
        <p key={warning} className="mt-3 border border-terracotta/40 p-2 font-sans text-xs text-terracotta">
          {warning}
        </p>
      ))}
    </div>
  );
}

function CodeBlock({ title, value }) {
  async function copy() {
    await navigator.clipboard.writeText(value);
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal/45">
          {title}
        </h3>
        <button
          type="button"
          onClick={copy}
          className="border border-charcoal/30 px-3 py-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.12em]"
        >
          Copy
        </button>
      </div>
      <pre className="overflow-auto bg-charcoal p-4 text-sm text-cream-100">
        <code>{value}</code>
      </pre>
    </div>
  );
}

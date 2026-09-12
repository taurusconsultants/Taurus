import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brand, analytics, form as formCfg } from './src/config.js';

const root = dirname(fileURLToPath(import.meta.url));

/**
 * Every indexable page, in one place.
 *
 * This list drives THREE things: the Rollup entry points, sitemap.xml, and the
 * per-page canonical/OG URLs. Adding a page means adding one row here — if the
 * three ever disagree, search engines index something that doesn't exist.
 */
const PAGES = [
  { route: '/', file: 'index.html', priority: '1.0', changefreq: 'weekly' },
  { route: '/spec-template/', file: 'spec-template/index.html', priority: '0.8', changefreq: 'monthly' },
];

const isPreview = process.env.NOINDEX === '1';

/**
 * Build-time brand token substitution.
 *
 * index.html is written with {{brand.name}} style placeholders. They are
 * replaced here, at build time, from src/config.js — so a rename is a
 * one-file edit with zero runtime cost and no flash of unbranded content.
 */
function brandTokens() {
  // Guard: a WhatsApp number without its country code produces a wa.me link
  // that fails silently — the visitor sees "phone number shared via url is
  // invalid" and the lead is lost with no error anywhere. Cheap to check,
  // expensive to miss, so the build shouts about it.
  const waDigits = String(brand.whatsappNumber).replace(/\D/g, '');
  if (waDigits.length < 11) {
    console.warn(
      `\n⚠️  [brand] whatsappNumber "${brand.whatsappNumber}" looks like it is MISSING ITS COUNTRY CODE.\n` +
        `    wa.me needs the full international number, digits only (India 91…, US 1…).\n` +
        `    Displayed as "${brand.whatsappDisplay}" — fix src/config.js before deploying.\n`
    );
  }

  // Guard: a Web3Forms access key is a bare 36-char UUID. A stray character
  // (a copy-paste artefact) is rejected by the API and every single enquiry
  // fails — with nothing wrong on your end to look at. Caught at build time.
  const KEY_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!KEY_RE.test(String(formCfg.accessKey).trim())) {
    console.warn(
      `\n⚠️  [form] accessKey "${formCfg.accessKey}" is NOT a valid Web3Forms key.\n` +
        `    Expected a bare UUID — 36 chars, 8-4-4-4-12 hex, no prefix or spaces.\n` +
        `    The form WILL fail for every visitor until this is fixed in src/config.js.\n`
    );
  }

  // Guard: canonical, OG and sitemap URLs are all built by concatenating
  // brand.url with a route. A trailing slash produces "https://x.com//about/".
  if (!/^https:\/\/[^/]+$/.test(brand.url)) {
    console.warn(
      `\n⚠️  [brand] url "${brand.url}" should be an absolute https origin with NO path and NO trailing slash.\n` +
        `    Canonical tags, OG tags and sitemap.xml are all derived from it.\n`
    );
  }

  const whatsappLink = `https://wa.me/${waDigits}?text=${encodeURIComponent(
    brand.whatsappPrefill
  )}`;

  // The brand mark is defined once in config.js and feeds three places.
  const markInline =
    `<svg class="wordmark-mark" viewBox="${brand.markViewBox}" aria-hidden="true" focusable="false">${brand.markSvg}</svg>`;

  // Favicon: the same glyph, accent-on-dark, inlined as a data URI so the tab
  // icon costs no extra request.
  const faviconSvg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${brand.markViewBox}">` +
    `<rect width="32" height="32" rx="7" fill="#08090B"/>` +
    `<g transform="translate(16 16) scale(0.84) translate(-16 -16)">` +
    brand.markSvg.replace(/currentColor/g, '#C6F24E') +
    `</g></svg>`;

  const tokens = {
    'brand.mark': markInline,
    'brand.faviconDataUri': `data:image/svg+xml,${encodeURIComponent(faviconSvg)}`,
    'brand.name': brand.name,
    'brand.nameShort': brand.nameShort,
    'brand.tagline': brand.tagline,
    'brand.description': brand.description,
    'brand.email': brand.email,
    'brand.domain': brand.domain,
    'brand.url': brand.url,
    'brand.responseTime': brand.responseTime,
    'brand.whatsappDisplay': brand.whatsappDisplay,
    'brand.whatsappLink': whatsappLink,
    'site.year': String(new Date().getFullYear()),
  };

  return {
    name: 'brand-tokens',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        let out = html.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key) => {
          if (key in tokens) return tokens[key];
          console.warn(`[brand-tokens] unknown token: ${match}`);
          return match;
        });

        const tags = [];

        // Preview deploys (GitHub Pages) must not be indexed, or a half-finished
        // copy on a github.io URL ends up competing with the real site in search
        // results. This is deliberately an ENV FLAG rather than a config value:
        // the same source builds both targets, and baking noindex into config.js
        // would follow the build to Hostinger and deindex production.
        //   Preview  → NOINDEX=1 npm run build   (the Pages workflow sets this)
        //   Live     → npm run build             (no flag, indexable)
        if (isPreview) {
          tags.push('<meta name="robots" content="noindex, nofollow" />');
        }

        // Structured data, built from the page's own markup so it cannot drift
        // away from what a visitor actually reads. Skipped on preview builds —
        // there is no value in handing a search engine rich data for a page it
        // has also been told not to index.
        if (!isPreview) {
          const ld = structuredData(ctx.path || '/', out);
          if (ld) tags.push(`<script type="application/ld+json">${ld}</script>`);
        }

        // Analytics only injected when actually configured, so the default
        // build ships with zero third-party requests.
        if (analytics.googleAnalyticsId) {
          tags.push(
            `<script async src="https://www.googletagmanager.com/gtag/js?id=${analytics.googleAnalyticsId}"></script>`,
            `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${analytics.googleAnalyticsId}');</script>`
          );
        }
        if (analytics.metaPixelId) {
          tags.push(
            `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${analytics.metaPixelId}');fbq('track','PageView');</script>`
          );
        }
        if (tags.length) out = out.replace('</head>', `${tags.join('\n')}\n</head>`);

        return out;
      },
    },

    /**
     * robots.txt and sitemap.xml are EMITTED, not committed.
     *
     * They have to differ between the two deploy targets — production invites
     * crawlers, the GitHub Pages preview must turn them away — and a committed
     * file cannot do that. Generating them from PAGES also means the sitemap
     * can never list a route that no longer builds.
     */
    generateBundle() {
      const robots = isPreview
        ? 'User-agent: *\nDisallow: /\n'
        : `User-agent: *\nAllow: /\n\nSitemap: ${brand.url}/sitemap.xml\n`;
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots });

      // The manifest is generated rather than committed for the same reason
      // every other brand string is a token: a rename must stay a one-file
      // edit. Its URLs are relative to the manifest's own location (site root).
      this.emitFile({
        type: 'asset',
        fileName: 'site.webmanifest',
        source: JSON.stringify(
          {
            name: `${brand.name} — ${brand.tagline}`,
            short_name: brand.nameShort,
            description: brand.description,
            start_url: './',
            scope: './',
            display: 'standalone',
            background_color: '#08090B',
            theme_color: '#08090B',
            icons: [
              { src: './icon-192.png', sizes: '192x192', type: 'image/png' },
              { src: './icon-512.png', sizes: '512x512', type: 'image/png' },
              { src: './icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
            ],
          },
          null,
          2
        ),
      });

      if (isPreview) return;

      const today = new Date().toISOString().slice(0, 10);
      const urls = PAGES.map(
        (p) =>
          `  <url>\n` +
          `    <loc>${brand.url}${p.route}</loc>\n` +
          `    <lastmod>${today}</lastmod>\n` +
          `    <changefreq>${p.changefreq}</changefreq>\n` +
          `    <priority>${p.priority}</priority>\n` +
          `  </url>`
      ).join('\n');

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source:
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      });
    },
  };
}

/* ────────────────────────────────────────────────────────────────────────────
   STRUCTURED DATA
   ──────────────────────────────────────────────────────────────────────────── */

const strip = (s) =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Pull the FAQ straight out of the rendered markup.
 *
 * The alternative — keeping a second copy of every question in this file — is
 * how FAQ rich results end up quoting answers the page no longer gives. Google
 * treats that as a mismatch and drops the enhancement, so parsing is both the
 * lower-maintenance and the safer option.
 */
function faqFromHtml(html) {
  const out = [];
  const re = /<details class="faq-item[^"]*"[^>]*>\s*<summary>([\s\S]*?)<\/summary>\s*<div>([\s\S]*?)<\/div>/g;
  let m;
  while ((m = re.exec(html))) {
    const q = strip(m[1]);
    const a = strip(m[2]);
    if (q && a) out.push({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } });
  }
  return out;
}

function structuredData(path, html) {
  const isHome = path === '/' || path === '/index.html';
  const page = PAGES.find((p) => p.file === path.replace(/^\//, '')) || PAGES[0];
  const pageUrl = `${brand.url}${page.route}`;

  const org = {
    '@type': 'Organization',
    '@id': `${brand.url}/#organization`,
    name: brand.name,
    url: `${brand.url}/`,
    description: brand.description,
    email: brand.email,
    foundingDate: String(brand.yearFounded),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: brand.email,
      url: `${brand.url}/#contact`,
      availableLanguage: ['en'],
    },
  };

  const graph = [
    {
      '@type': 'WebSite',
      '@id': `${brand.url}/#website`,
      url: `${brand.url}/`,
      name: brand.name,
      description: brand.description,
      publisher: { '@id': `${brand.url}/#organization` },
      inLanguage: 'en',
    },
    org,
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      isPartOf: { '@id': `${brand.url}/#website` },
      about: { '@id': `${brand.url}/#organization` },
      inLanguage: 'en',
    },
  ];

  if (isHome) {
    graph.push({
      '@type': 'ProfessionalService',
      '@id': `${brand.url}/#service`,
      name: brand.name,
      url: `${brand.url}/`,
      description:
        'Backtesting, optimisation, signal visualisation, algo deployment, strategy refinement and model evaluation for client-specified trading strategies. Testing and reporting only — not investment advice.',
      provider: { '@id': `${brand.url}/#organization` },
      areaServed: { '@type': 'Place', name: 'Worldwide' },
      serviceType: [
        'Backtesting',
        'Strategy optimisation',
        'Signal visualisation',
        'Algorithmic trading deployment',
        'Trading idea refinement',
        'Model evaluation',
      ],
    });

    const faq = faqFromHtml(html);
    if (faq.length) {
      graph.push({ '@type': 'FAQPage', '@id': `${brand.url}/#faq`, mainEntity: faq });
    } else {
      console.warn('[structured-data] no FAQ items matched — check the markup shape in index.html');
    }
  }

  // </script> inside JSON would close the tag early; nothing else needs escaping.
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
    .replace(/<\/script/gi, '<\\/script');
}

export default defineConfig({
  // Relative paths so the build works from any directory on Hostinger —
  // document root, a subfolder, or a staging path.
  base: './',
  plugins: [brandTokens()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    target: 'es2018',
    cssMinify: true,
    rollupOptions: {
      input: Object.fromEntries(
        PAGES.map((p) => [p.file.replace(/\/?index\.html$/, '') || 'main', resolve(root, p.file)])
      ),
      output: {
        manualChunks: undefined,
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
  },
  server: { port: 5173, open: true },
});

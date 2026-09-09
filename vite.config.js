import { defineConfig } from 'vite';
import { brand, analytics } from './src/config.js';

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
    'brand.whatsappDisplay': brand.whatsappDisplay,
    'brand.whatsappLink': whatsappLink,
    'brand.legalEntity': brand.legalEntity,
    'brand.jurisdiction': brand.jurisdiction,
    'site.year': String(new Date().getFullYear()),
  };

  return {
    name: 'brand-tokens',
    transformIndexHtml(html) {
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
      if (process.env.NOINDEX === '1') {
        tags.push('<meta name="robots" content="noindex, nofollow" />');
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
  };
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
    // Everything in one JS file: on shared hosting without HTTP/2 push,
    // one request beats several small ones.
    rollupOptions: {
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

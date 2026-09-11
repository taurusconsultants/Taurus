/**
 * ============================================================================
 *  BRAND + SITE CONFIG  —  SINGLE SOURCE OF TRUTH
 * ============================================================================
 *
 *  Everything that might change is here. Change a value, run `npm run build`,
 *  re-upload `dist/`. Nothing else needs editing.
 *
 *  Values marked  << PLACEHOLDER >>  are Claude's suggested/dummy defaults.
 *  Replace them with the real thing when you have it.
 *
 *  This file is imported in TWO places:
 *    1. vite.config.js  — to substitute {{tokens}} into index.html at BUILD time
 *    2. src/main.js     — for anything the browser needs at RUN time
 * ============================================================================
 */


export const brand = {
  // -- Identity -------------------------------------------------------------
  // Brand name is NOT final. It is a token everywhere; never hardcoded.
  // name: 'Quant Monk',
  // nameShort: 'Quant Monk',
  name: 'Taurus',
  nameShort: 'Taurus',

  // Wordmark is type-only for now (no logo image). If you get a logo, drop it
  // in /public and set logoSrc to e.g. '/logo.svg' — the header swaps to it.
  logoSrc: null,

  // -- Brand mark (the symbol beside the wordmark) --------------------------
  // A Taurus glyph: horns above, ring below. Stroke-based rather than filled,
  // so it stays crisp at 22px in the header and at 512px on a share card, and
  // drawn in `currentColor` so CSS owns the colour.
  //
  // This ONE string feeds the header, the footer AND the favicon. To change
  // the symbol, replace the paths here and rebuild — nothing else to touch.
  markViewBox: '0 0 32 32',
  markSvg:
    '<path d="M5.6 4.8C5.6 11.3 10.3 14.2 16 14.2S26.4 11.3 26.4 4.8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>' +
    '<circle cx="16" cy="22.9" r="6.2" fill="none" stroke="currentColor" stroke-width="3"/>',

  tagline: 'Your strategy, tested properly.',
  description:
    'We backtest, optimise, visualise and deploy the trading strategies you specify — rigorously, by hand, with a full report at the end.',

  // -- Contact --------------------------------------------------------------
  // WhatsApp: FULL international format — country code + number, digits only,
  // no +, no spaces. India = 91, US = 1.
  //   +91 90164 51019  ->  '919016451019'   ✅ correct
  //         9016451019  ->  '9016451019'     ❌ no country code, link dies
  // Without the country code wa.me cannot resolve the account and every
  // WhatsApp click fails silently. `npm run build` warns if this looks wrong.
  whatsappNumber: '919016451019',
  whatsappDisplay: '+91 90164 51019',
  whatsappPrefill:
    "Hi — I have a trading strategy I'd like tested. Here's the idea:",

  email: 'taurus.consultancyservice@gmail.com',

  // -- Domain  << PLACEHOLDER >> --------------------------------------------
  domain: 'taurusconsultancy.com',
  url: 'https://taurusconsultancy.com',

  // -- Legal  << PLACEHOLDER >> ---------------------------------------------
  legalEntity: 'Taurus Consultancy LLC',
  jurisdiction: 'GIFT City, India',
  yearFounded: 2026,
};

/**
 * Form backend. Default: Web3Forms (free, no PHP, works on static hosting).
 * Get a key at https://web3forms.com — it is emailed to you instantly.
 * Submissions arrive at whichever inbox you registered.
 *
 * To swap providers (Formspree, your own PHP, Google Apps Script), change
 * `endpoint` and `accessKey` — src/js/form.js posts plain FormData, so most
 * providers work unchanged.
 */
export const form = {
  endpoint: 'https://api.web3forms.com/submit',

  // A Web3Forms access key is a plain UUID: 8-4-4-4-12 hex characters, 36 long,
  // no prefix. Anything else is rejected and every submission fails.
  // (Was pasted once as 'R4de01c1e-…' — a stray leading R — which broke the form.)
  accessKey: '4de01c1e-dc41-4dff-9211-4f9eae44e79c',

  subject: 'New enquiry from the Taurus website',
};

/**
 * Analytics. Left empty — nothing loads until you fill these in, so the site
 * ships with zero third-party requests by default.
 */
export const analytics = {
  googleAnalyticsId: '', // e.g. 'G-XXXXXXXXXX'
  metaPixelId: '', // e.g. '123456789012345'
};

/**
 * Motion. The hero WebGL is the one heavy visual moment on the page.
 * Every flag here degrades safely — the page is fully readable with all of
 * this switched off.
 */
export const motion = {
  webglHero: true,
  smoothScroll: true,
  // Below this viewport width the shader is skipped entirely and the static
  // CSS fallback is used instead. Protects mobile battery + first paint.
  webglMinWidth: 768,
};

/**
 * The sample backtest report.
 *
 * isSample: true  -> renders the "illustrative data" badge and disclaimer.
 * Set to false ONLY when real, authentic client-authorised results are in
 * place. See src/data/report-data.js for the numbers themselves.
 */
export const report = {
  isSample: true,
};

export default { brand, form, analytics, motion, report };

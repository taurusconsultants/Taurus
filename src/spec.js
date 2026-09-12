/**
 * Entry point for the spec-template page.
 *
 * Deliberately tiny: it imports the shared stylesheet and nothing else. The
 * main page's GSAP/Lenis/WebGL bundle is ~64KB gzipped and none of it earns
 * its place here — this page is a document people read, print and fill in.
 */

import './styles/main.css';
import { brand } from './config.js';

/** The blank template, as plain text — what the copy button puts on the clipboard. */
const TEMPLATE = `STRATEGY SPECIFICATION
${brand.name} — ${brand.domain}

Prepared by: ______________________    Date: ______________


01. WHAT DO YOU WANT ANSWERED?
    What would make you trade this live:
    What would make you abandon it:
    Specific doubt to settle:


02. INSTRUMENT, TIMEFRAME AND HISTORY
    Instrument(s) / symbol / exchange:
    Contract or expiry convention:
    Bar interval (or tick/quote level):
    Period to cover, and why:
    If options — legs / strike selection / expiry selection:


03. ENTRY RULES
    Condition (in values available at that moment):
    Evaluated on bar close or intrabar:
    Order type (market next open / limit / stop):
    If the condition is still true next bar:


04. EXIT RULES
    Stop loss (type, level, moved how and when):
    Target (fixed R / level / trailing):
    Time-based exit:
    If stop and target hit in the same bar, which wins:


05. POSITION SIZING AND RISK
    Sizing method (fixed qty / fixed risk / % equity / vol-scaled):
    Compounding or fixed base:
    Starting capital to assume:
    Max concurrent positions / max exposure:


06. FILTERS AND CONDITIONS
    Trend / volatility / volume / regime filters:
    Days or events to avoid:
    Correlation or portfolio constraints:
    For each filter — decided BEFORE or AFTER seeing results:


07. SESSION AND TIMING RULES
    Trading window (earliest entry / latest entry / forced flat):
    Timezone:
    Overnight positions allowed:
    Half-days, holidays, gaps:


08. COSTS AND EXECUTION ASSUMPTIONS
    Commission / brokerage structure:
    Taxes and exchange charges:
    Expected slippage (or ask us to estimate):
    Typical order size vs available liquidity:


09. EDGE CASES NOT YET DECIDED
    Signal fires while in a position (add / ignore / reverse):
    Gap through the stop (fill at gap or at stop price):
    Missing bars, halts, limit up/down:
    Contract roll or expiry while in a position:


10. METRICS YOU CARE ABOUT
    Custom KPIs / exposure breakdowns / risk measures:
    Breakdowns wanted (regime, session, weekday, instrument):
    Benchmark to compare against:


---
Send to: ${brand.email}  ·  WhatsApp ${brand.whatsappDisplay}
${brand.name} tests and reports on client-specified strategies. We do not
provide investment advice or trade recommendations.
`;

function initCopy() {
  const btn = document.getElementById('copyBtn');
  const status = document.getElementById('copyStatus');
  if (!btn || !status) return;

  btn.addEventListener('click', async () => {
    try {
      // Clipboard API needs a secure context; the textarea fallback covers
      // plain-http previews and older mobile browsers.
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(TEMPLATE);
      } else {
        const ta = document.createElement('textarea');
        ta.value = TEMPLATE;
        ta.style.cssText = 'position:fixed;left:-9999px;top:0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      status.textContent = 'Copied — paste it into any editor and fill it in.';
      status.className = 'spec-copied ok';
    } catch (err) {
      console.warn('[spec] clipboard unavailable:', err);
      status.textContent =
        'Couldn’t reach the clipboard. Use “Print / save as PDF” instead, or select the text above.';
      status.className = 'spec-copied bad';
    }
  });
}

function initPrint() {
  document.getElementById('printBtn')?.addEventListener('click', () => window.print());
}

function initTracking() {
  document.querySelectorAll('[data-track="whatsapp-spec"]').forEach((a) => {
    a.addEventListener('click', () => {
      if (window.gtag) window.gtag('event', 'contact', { method: 'whatsapp' });
      if (window.fbq) window.fbq('track', 'Contact');
    });
  });
}

function boot() {
  initCopy();
  initPrint();
  initTracking();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

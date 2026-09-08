/**
 * Entry point.
 *
 * Order matters: the report renders BEFORE motion initialises, because the
 * counters and the equity line draw-in need those elements to exist so
 * ScrollTrigger can measure them.
 */

import './styles/main.css';
import { brand, form as formCfg, motion as motionCfg, report as reportCfg } from './config.js';
import { initHero } from './js/hero.js';
import { initReport } from './js/report.js';
import { initMotion } from './js/motion.js';
import { initForm } from './js/form.js';

function boot() {
  // 1. Report first — motion measures these nodes.
  try {
    initReport(reportCfg);
  } catch (err) {
    console.warn('[report] failed to render:', err);
  }

  // 2. Hero shader. Returns null and leaves the CSS fallback in place on any
  //    unsupported device — this is expected, not an error.
  try {
    initHero(document.getElementById('heroCanvas'), motionCfg);
  } catch (err) {
    console.warn('[hero] shader unavailable, using static fallback:', err);
  }

  // 3. Motion.
  initMotion(motionCfg);

  // 4. Lead form.
  try {
    initForm(formCfg, brand);
  } catch (err) {
    console.warn('[form] init failed:', err);
  }

  // Small analytics nicety: outbound WhatsApp clicks are the primary
  // conversion, so fire an event when one happens.
  document.querySelectorAll('[data-track="whatsapp-hero"], [data-track="whatsapp-contact"]').forEach((a) => {
    a.addEventListener('click', () => {
      if (window.gtag) window.gtag('event', 'contact', { method: 'whatsapp' });
      if (window.fbq) window.fbq('track', 'Contact');
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

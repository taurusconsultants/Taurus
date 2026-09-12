/**
 * Generate the raster brand images that can't be SVG.
 *
 *   public/og.png        1200×630  — social/link preview card
 *   public/icon-192.png   192×192  — PWA manifest
 *   public/icon-512.png   512×512  — PWA manifest + maskable
 *   public/apple-touch-icon.png 180×180
 *
 * Everything is drawn from brand.markSvg in src/config.js, so these cannot
 * drift away from the mark used on the site. Re-run after changing the mark:
 *
 *   node scripts/make-images.mjs
 *
 * Output is committed (public/ ships as-is). Headless Chrome does the
 * rasterising because og:image must be a real PNG — crawlers do not render
 * SVG, and a missing preview image costs clicks on every share.
 */

import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { brand } from '../src/config.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public');
mkdirSync(out, { recursive: true });

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BG = '#08090B';
const ACCENT = '#C6F24E';
const TEXT = '#F4F6F8';
const MUTED = '#A3ABB6';

const mark = (size, color) =>
  `<svg width="${size}" height="${size}" viewBox="${brand.markViewBox}" fill="none">` +
  brand.markSvg.replace(/currentColor/g, color) +
  `</svg>`;

const page = (w, h, body) => `<!doctype html><html><head><meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${w}px;height:${h}px;overflow:hidden}
  body{background:${BG};font-family:'Space Grotesk',system-ui,sans-serif;color:${TEXT};
       -webkit-font-smoothing:antialiased}
</style></head><body>${body}</body></html>`;

const OG = page(
  1200,
  630,
  `<div style="position:absolute;inset:0;background:
      radial-gradient(90% 70% at 82% 12%, rgba(198,242,78,0.20), transparent 60%),
      radial-gradient(80% 65% at 10% 92%, rgba(57,135,229,0.16), transparent 62%)"></div>
   <div style="position:relative;height:100%;display:flex;flex-direction:column;
               justify-content:space-between;padding:68px 76px">
     <div style="display:flex;align-items:center;gap:16px">
       ${mark(44, ACCENT)}
       <span style="font-size:34px;font-weight:700;letter-spacing:-0.03em">${brand.name}</span>
     </div>
     <div>
       <!-- Mirrors the page's own H1. If the hero headline changes, change it
            here too and re-run — a link preview that promises different words
            from the page it opens reads as a bait-and-switch. -->
       <div style="font-size:88px;font-weight:700;line-height:0.98;letter-spacing:-0.045em">
         Great backtest.<br><span style="color:${ACCENT}">Then it went live.</span>
       </div>
       <div style="margin-top:30px;font-size:25px;line-height:1.45;color:${MUTED};max-width:47ch">
         We backtest, optimise and stress-test the strategies you specify —
         costs, out-of-sample and overfit diagnostics included.
       </div>
     </div>
     <div style="display:flex;gap:30px;font-size:19px;color:${MUTED};letter-spacing:0.02em">
       <span>Backtesting</span><span>Optimisation</span><span>Monte Carlo</span>
       <span>Model evaluation</span>
     </div>
   </div>`
);

// Icons: the glyph centred on the brand ground, with generous padding so the
// maskable variant survives Android's circular crop.
const icon = (size) =>
  page(
    size,
    size,
    `<div style="width:100%;height:100%;display:grid;place-items:center;background:${BG}">
       ${mark(Math.round(size * 0.56), ACCENT)}
     </div>`
  );

const JOBS = [
  ['og.png', 1200, 630, OG],
  ['icon-192.png', 192, 192, icon(192)],
  ['icon-512.png', 512, 512, icon(512)],
  ['apple-touch-icon.png', 180, 180, icon(180)],
];

const tmp = mkdtempSync(join(tmpdir(), 'taurus-img-'));
try {
  for (const [name, w, h, html] of JOBS) {
    const src = join(tmp, name.replace('.png', '.html'));
    writeFileSync(src, html);
    execFileSync(
      CHROME,
      [
        '--headless',
        '--disable-gpu',
        '--hide-scrollbars',
        '--default-background-color=00000000',
        `--window-size=${w},${h}`,
        `--screenshot=${join(out, name)}`,
        `file://${src}`,
      ],
      { stdio: 'pipe' }
    );
    console.log(`✓ public/${name}  ${w}×${h}`);
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

/**
 * Sample backtest report renderer.
 *
 * Hand-rolled inline SVG — no charting library. A chart library would cost
 * 100–300KB to draw six simple charts, on a page whose entire premise is
 * loading fast.
 *
 * Colour discipline (see src/styles/main.css for why):
 *   - Data series use the blue/red pair, validated for colour-vision
 *     deficiency and for contrast against the dark chart surface.
 *   - The brand lime is a UI colour and is used for the equity line only,
 *     which is a LONE series — so no series-vs-series confusion is possible.
 *   - Every heatmap cell prints its own number, so nothing depends on colour
 *     alone.
 */

import data, {
  meta,
  kpis,
  equity,
  drawdown,
  monthly,
  yearly,
  distribution,
  sensitivity,
  lookbacks,
  thresholds,
  assumptions,
  getMonteCarlo,
  getRobustness,
  getRegimes,
} from '../data/report-data.js';

const NS = 'http://www.w3.org/2000/svg';

const C = {
  line: '#C6F24E',
  pos: '#3987E5',
  neg: '#E5484D',
  grid: '#23272E',
  axis: '#333941',
  muted: '#6B7480',
  text: '#F4F6F8',
  text2: '#A3ABB6',
  surface: '#101318',
};

/* ── formatting ─────────────────────────────────────────────────────────── */
const money = (v) =>
  '$' + Math.round(v).toLocaleString('en-US');
const moneyShort = (v) =>
  v >= 1e6 ? '$' + (v / 1e6).toFixed(2) + 'M' : '$' + Math.round(v / 1000) + 'K';
const pct = (v, d = 1) => `${v > 0 ? '+' : ''}${v.toFixed(d)}%`;
const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/* ── colour helpers ─────────────────────────────────────────────────────── */
const hex2rgb = (h) => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];
const rgb2hex = (c) =>
  '#' + c.map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('');

function ramp(stops, t) {
  t = Math.max(0, Math.min(1, t));
  const seg = 1 / (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(t / seg));
  const lt = (t - i * seg) / seg;
  const a = hex2rgb(stops[i]);
  const b = hex2rgb(stops[i + 1]);
  return rgb2hex(a.map((v, k) => v + (b[k] - v) * lt));
}

// Relative luminance — decides whether a cell's own number is printed white
// or in muted ink, so text inside a fill always clears contrast.
function lum(hex) {
  const [r, g, b] = hex2rgb(hex).map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// On a dark surface, "near zero" recedes toward the surface and magnitude
// brightens — the reverse of a light-mode sequential ramp.
const POS_RAMP = ['#1A2028', '#255FA6', '#3987E5', '#7FB2F0'];
const NEG_RAMP = ['#1A2028', '#9B3438', '#E5484D', '#F08A8D'];
const SEQ_RAMP = ['#141A22', '#1C4E8C', '#3987E5', '#9EC5F4'];

/* ── tiny SVG helpers ───────────────────────────────────────────────────── */
function el(tag, attrs = {}) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  return n;
}
function svgRoot(w, h) {
  const s = el('svg', {
    viewBox: `0 0 ${w} ${h}`,
    preserveAspectRatio: 'xMidYMid meet',
    role: 'img',
  });
  return s;
}
function downsample(arr, n) {
  if (arr.length <= n) return arr.slice();
  const step = (arr.length - 1) / (n - 1);
  const out = [];
  for (let i = 0; i < n; i++) out.push(arr[Math.round(i * step)]);
  return out;
}
function tipFor(box) {
  const t = document.createElement('div');
  t.className = 'chart-tip';
  box.appendChild(t);
  return t;
}
function placeTip(tip, box, clientX, clientY) {
  const r = box.getBoundingClientRect();
  let x = clientX - r.left + 14;
  const y = clientY - r.top - 12;
  if (x + tip.offsetWidth > r.width - 4) x = clientX - r.left - tip.offsetWidth - 14;
  tip.style.left = `${Math.max(4, x)}px`;
  tip.style.top = `${Math.max(4, y)}px`;
}

/* ── legend ─────────────────────────────────────────────────────────────── */
function legend(box, items) {
  const l = document.createElement('div');
  l.className = 'chart-legend';
  items.forEach(([color, label]) => {
    const s = document.createElement('span');
    const i = document.createElement('i');
    i.style.background = color;
    s.appendChild(i);
    s.appendChild(document.createTextNode(label));
    l.appendChild(s);
  });
  box.appendChild(l);
}

/* ══════════════════════════════════════════════════════════════════════════
   EQUITY CURVE
   ══════════════════════════════════════════════════════════════════════════ */
function renderEquity(box) {
  const W = 1000, H = 340;
  const P = { l: 66, r: 14, t: 18, b: 34 };
  const pts = downsample(equity, 420);
  const svg = svgRoot(W, H);
  svg.setAttribute('aria-label', 'Equity curve over the full backtest period');

  const vals = pts.map((p) => p.v);
  const min = Math.min(...vals) * 0.97;
  const max = Math.max(...vals) * 1.03;
  const X = (i) => P.l + (i / (pts.length - 1)) * (W - P.l - P.r);
  const Y = (v) => P.t + (1 - (v - min) / (max - min)) * (H - P.t - P.b);

  // gridlines + y ticks
  for (let i = 0; i <= 4; i++) {
    const v = min + ((max - min) * i) / 4;
    const y = Y(v);
    svg.appendChild(el('line', { x1: P.l, x2: W - P.r, y1: y, y2: y, stroke: C.grid, 'stroke-width': 1 }));
    const t = el('text', { x: P.l - 12, y: y + 4, fill: C.muted, 'font-size': 11, 'text-anchor': 'end', 'font-family': 'JetBrains Mono, monospace' });
    t.textContent = moneyShort(v);
    svg.appendChild(t);
  }

  // x ticks at year boundaries
  let lastYear = null;
  pts.forEach((p, i) => {
    const y = p.d.slice(0, 4);
    if (y !== lastYear) {
      lastYear = y;
      if (i > 0) {
        const t = el('text', { x: X(i), y: H - 12, fill: C.muted, 'font-size': 11, 'text-anchor': 'middle', 'font-family': 'JetBrains Mono, monospace' });
        t.textContent = y;
        svg.appendChild(t);
      }
    }
  });

  // area wash (~10% opacity) + 2px line
  const dLine = pts.map((p, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(p.v).toFixed(1)}`).join('');
  svg.appendChild(el('path', {
    d: `${dLine}L${X(pts.length - 1)},${H - P.b}L${P.l},${H - P.b}Z`,
    fill: C.line, opacity: 0.1,
  }));
  const line = el('path', { d: dLine, fill: 'none', stroke: C.line, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
  line.classList.add('draw-in');
  svg.appendChild(line);

  // in-sample / out-of-sample split marker
  const splitI = pts.findIndex((p) => p.d >= meta.splitDate);
  if (splitI > 0) {
    const sx = X(splitI);
    svg.appendChild(el('line', { x1: sx, x2: sx, y1: P.t, y2: H - P.b, stroke: C.muted, 'stroke-width': 1, 'stroke-dasharray': '4 4' }));
    const lab = el('text', { x: sx + 7, y: P.t + 13, fill: C.muted, 'font-size': 10.5, 'font-family': 'JetBrains Mono, monospace' });
    lab.textContent = 'out-of-sample →';
    svg.appendChild(lab);
  }

  // hover layer
  const cross = el('line', { y1: P.t, y2: H - P.b, stroke: C.axis, 'stroke-width': 1, opacity: 0 });
  const dot = el('circle', { r: 4.5, fill: C.line, stroke: C.surface, 'stroke-width': 2, opacity: 0 });
  svg.appendChild(cross);
  svg.appendChild(dot);
  box.appendChild(svg);
  const tip = tipFor(box);

  svg.addEventListener('pointermove', (e) => {
    const r = svg.getBoundingClientRect();
    const rel = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((rel - P.l) / (W - P.l - P.r)) * (pts.length - 1));
    if (i < 0 || i >= pts.length) return;
    const p = pts[i];
    cross.setAttribute('x1', X(i));
    cross.setAttribute('x2', X(i));
    cross.setAttribute('opacity', 1);
    dot.setAttribute('cx', X(i));
    dot.setAttribute('cy', Y(p.v));
    dot.setAttribute('opacity', 1);
    const ret = ((p.v - kpis.startEquity) / kpis.startEquity) * 100;
    tip.innerHTML = `<b>${p.d}</b><br>${money(p.v)}<br><b>since start</b> ${pct(ret)}`;
    tip.classList.add('on');
    placeTip(tip, box, e.clientX, e.clientY);
  });
  svg.addEventListener('pointerleave', () => {
    cross.setAttribute('opacity', 0);
    dot.setAttribute('opacity', 0);
    tip.classList.remove('on');
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   DRAWDOWN
   ══════════════════════════════════════════════════════════════════════════ */
function renderDrawdown(box) {
  const W = 1000, H = 230;
  const P = { l: 66, r: 14, t: 16, b: 30 };
  const pts = downsample(drawdown, 420);
  const svg = svgRoot(W, H);
  svg.setAttribute('aria-label', 'Underwater curve — percent below running peak');

  const min = Math.min(...pts.map((p) => p.v)) * 1.08;
  const X = (i) => P.l + (i / (pts.length - 1)) * (W - P.l - P.r);
  const Y = (v) => P.t + (v / min) * (H - P.t - P.b);

  for (let i = 0; i <= 3; i++) {
    const v = (min * i) / 3;
    const y = Y(v);
    svg.appendChild(el('line', { x1: P.l, x2: W - P.r, y1: y, y2: y, stroke: C.grid, 'stroke-width': 1 }));
    const t = el('text', { x: P.l - 12, y: y + 4, fill: C.muted, 'font-size': 11, 'text-anchor': 'end', 'font-family': 'JetBrains Mono, monospace' });
    t.textContent = v.toFixed(0) + '%';
    svg.appendChild(t);
  }

  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(p.v).toFixed(1)}`).join('');
  svg.appendChild(el('path', { d: `${d}L${X(pts.length - 1)},${P.t}L${P.l},${P.t}Z`, fill: C.neg, opacity: 0.14 }));
  svg.appendChild(el('path', { d, fill: 'none', stroke: C.neg, 'stroke-width': 2, 'stroke-linejoin': 'round' }));

  // mark the worst point directly — the one label worth placing
  const worstI = pts.reduce((a, p, i) => (p.v < pts[a].v ? i : a), 0);
  svg.appendChild(el('circle', { cx: X(worstI), cy: Y(pts[worstI].v), r: 4.5, fill: C.neg, stroke: C.surface, 'stroke-width': 2 }));
  const wl = el('text', { x: X(worstI), y: Y(pts[worstI].v) + 20, fill: C.text2, 'font-size': 11.5, 'text-anchor': 'middle', 'font-family': 'JetBrains Mono, monospace' });
  wl.textContent = `max ${kpis.maxDD.toFixed(1)}%`;
  svg.appendChild(wl);

  const cross = el('line', { y1: P.t, y2: H - P.b, stroke: C.axis, 'stroke-width': 1, opacity: 0 });
  svg.appendChild(cross);
  box.appendChild(svg);
  const tip = tipFor(box);

  svg.addEventListener('pointermove', (e) => {
    const r = svg.getBoundingClientRect();
    const rel = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((rel - P.l) / (W - P.l - P.r)) * (pts.length - 1));
    if (i < 0 || i >= pts.length) return;
    cross.setAttribute('x1', X(i));
    cross.setAttribute('x2', X(i));
    cross.setAttribute('opacity', 1);
    tip.innerHTML = `<b>${pts[i].d}</b><br>${pts[i].v.toFixed(2)}% below peak`;
    tip.classList.add('on');
    placeTip(tip, box, e.clientX, e.clientY);
  });
  svg.addEventListener('pointerleave', () => {
    cross.setAttribute('opacity', 0);
    tip.classList.remove('on');
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   TRADE DISTRIBUTION
   ══════════════════════════════════════════════════════════════════════════ */
function renderDistribution(box) {
  legend(box, [[C.pos, 'Winning trades'], [C.neg, 'Losing trades']]);

  const W = 1000, H = 270;
  const P = { l: 52, r: 14, t: 18, b: 40 };
  const svg = svgRoot(W, H);
  svg.setAttribute('aria-label', 'Distribution of trade outcomes in R-multiples');

  const maxC = Math.max(...distribution.map((b) => b.count));
  const slot = (W - P.l - P.r) / distribution.length;
  const bw = slot - 2; // 2px surface gap between adjacent bars
  const Y = (c) => P.t + (1 - c / maxC) * (H - P.t - P.b);

  for (let i = 0; i <= 3; i++) {
    const c = (maxC * i) / 3;
    const y = Y(c);
    svg.appendChild(el('line', { x1: P.l, x2: W - P.r, y1: y, y2: y, stroke: C.grid, 'stroke-width': 1 }));
    const t = el('text', { x: P.l - 10, y: y + 4, fill: C.muted, 'font-size': 11, 'text-anchor': 'end', 'font-family': 'JetBrains Mono, monospace' });
    t.textContent = Math.round(c);
    svg.appendChild(t);
  }

  const tip = tipFor(box);
  const base = H - P.b;

  distribution.forEach((b, i) => {
    const x = P.l + i * slot + 1;
    const y = Y(b.count);
    const h = base - y;
    const col = b.lo < 0 ? C.neg : C.pos;
    const r = Math.min(4, h); // 4px rounded data-end, square at the baseline
    const path = el('path', {
      d: `M${x},${base}L${x},${y + r}Q${x},${y} ${x + r},${y}L${x + bw - r},${y}Q${x + bw},${y} ${x + bw},${y + r}L${x + bw},${base}Z`,
      fill: col,
    });
    path.style.transition = 'opacity .18s';
    svg.appendChild(path);

    path.addEventListener('pointerenter', (e) => {
      path.style.opacity = 0.75;
      tip.innerHTML = `<b>${b.lo.toFixed(1)}R to ${b.hi.toFixed(1)}R</b><br>${b.count} trades<br><b>${((b.count / kpis.totalTrades) * 100).toFixed(1)}%</b> of all trades`;
      tip.classList.add('on');
      placeTip(tip, box, e.clientX, e.clientY);
    });
    path.addEventListener('pointermove', (e) => placeTip(tip, box, e.clientX, e.clientY));
    path.addEventListener('pointerleave', () => {
      path.style.opacity = 1;
      tip.classList.remove('on');
    });

    if (i % 2 === 0) {
      const t = el('text', { x: x + bw / 2, y: H - 16, fill: C.muted, 'font-size': 10.5, 'text-anchor': 'middle', 'font-family': 'JetBrains Mono, monospace' });
      t.textContent = b.lo.toFixed(1);
      svg.appendChild(t);
    }
  });

  // breakeven marker
  const zeroI = distribution.findIndex((b) => b.lo >= 0);
  if (zeroI > 0) {
    const zx = P.l + zeroI * slot;
    svg.appendChild(el('line', { x1: zx, x2: zx, y1: P.t, y2: base, stroke: C.axis, 'stroke-width': 1, 'stroke-dasharray': '3 3' }));
  }

  const xl = el('text', { x: (W + P.l) / 2, y: H - 1, fill: C.muted, 'font-size': 10.5, 'text-anchor': 'middle', 'font-family': 'JetBrains Mono, monospace' });
  xl.textContent = 'R-multiple (units of initial risk)';
  svg.appendChild(xl);

  box.appendChild(svg);
}

/* ══════════════════════════════════════════════════════════════════════════
   MONTHLY RETURNS HEATMAP  (diverging: blue positive / red negative)
   ══════════════════════════════════════════════════════════════════════════ */
function renderMonthly(box) {
  legend(box, [[C.neg, 'Negative month'], ['#22262D', 'Flat'], [C.pos, 'Positive month']]);

  const years = [...new Set(monthly.map((m) => m.year))];
  const maxAbs = Math.max(...monthly.map((m) => Math.abs(m.ret)));

  const grid = document.createElement('div');
  grid.className = 'heat';
  grid.style.gridTemplateColumns = `56px repeat(12, 1fr) 74px`;

  grid.appendChild(Object.assign(document.createElement('div'), { className: 'heat-head' }));
  monthNames.forEach((m) => {
    const h = document.createElement('div');
    h.className = 'heat-head';
    h.textContent = m;
    grid.appendChild(h);
  });
  const yh = document.createElement('div');
  yh.className = 'heat-head';
  yh.textContent = 'Year';
  grid.appendChild(yh);

  const tip = tipFor(box);

  years.forEach((y) => {
    const rl = document.createElement('div');
    rl.className = 'heat-row-label';
    rl.textContent = y;
    grid.appendChild(rl);

    for (let m = 1; m <= 12; m++) {
      const rec = monthly.find((x) => x.year === y && x.month === m);
      const c = document.createElement('div');
      c.className = 'heat-cell';
      if (!rec) {
        c.classList.add('empty');
        grid.appendChild(c);
        continue;
      }
      const t = Math.abs(rec.ret) / maxAbs;
      const fill = rec.ret >= 0 ? ramp(POS_RAMP, t) : ramp(NEG_RAMP, t);
      c.style.background = fill;
      c.style.color = lum(fill) > 0.30 ? '#0B0D11' : t > 0.45 ? '#FFFFFF' : C.text2;
      c.textContent = rec.ret.toFixed(1);

      c.addEventListener('pointerenter', (e) => {
        tip.innerHTML = `<b>${monthNames[m - 1]} ${y}</b><br>${pct(rec.ret, 2)}`;
        tip.classList.add('on');
        placeTip(tip, box, e.clientX, e.clientY);
      });
      c.addEventListener('pointerleave', () => tip.classList.remove('on'));
      grid.appendChild(c);
    }

    const yr = yearly.find((x) => x.year === y);
    const tc = document.createElement('div');
    tc.className = 'heat-cell';
    tc.style.background = 'transparent';
    tc.style.fontWeight = '600';
    tc.style.color = yr.ret >= 0 ? C.pos : C.neg;
    tc.textContent = pct(yr.ret);
    grid.appendChild(tc);
  });

  box.appendChild(grid);
}

/* ══════════════════════════════════════════════════════════════════════════
   PARAMETER SENSITIVITY  (sequential — magnitude of Sharpe)
   ══════════════════════════════════════════════════════════════════════════ */
function renderSensitivity(box) {
  const maxS = Math.max(...sensitivity.map((s) => s.sharpe));
  const minS = Math.min(...sensitivity.map((s) => s.sharpe));

  const lg = document.createElement('div');
  lg.className = 'chart-legend';
  lg.innerHTML =
    `<span>Sharpe ${minS.toFixed(2)}</span>` +
    `<span style="flex:1;min-width:120px;height:11px;border-radius:3px;background:linear-gradient(90deg,${SEQ_RAMP.join(',')})"></span>` +
    `<span>${maxS.toFixed(2)}</span>`;
  box.appendChild(lg);

  const grid = document.createElement('div');
  grid.className = 'heat';
  grid.style.gridTemplateColumns = `72px repeat(${thresholds.length}, 1fr)`;

  const corner = document.createElement('div');
  corner.className = 'heat-head';
  corner.textContent = 'LB \\ Thr';
  grid.appendChild(corner);
  thresholds.forEach((t) => {
    const h = document.createElement('div');
    h.className = 'heat-head';
    h.textContent = t.toFixed(1);
    grid.appendChild(h);
  });

  const tip = tipFor(box);

  lookbacks.forEach((lb) => {
    const rl = document.createElement('div');
    rl.className = 'heat-row-label';
    rl.textContent = lb;
    grid.appendChild(rl);

    thresholds.forEach((th) => {
      const rec = sensitivity.find((s) => s.lookback === lb && s.threshold === th);
      const t = (rec.sharpe - minS) / (maxS - minS || 1);
      const fill = ramp(SEQ_RAMP, t);
      const c = document.createElement('div');
      c.className = 'heat-cell';
      c.style.background = fill;
      c.style.color = lum(fill) > 0.30 ? '#0B0D11' : t > 0.45 ? '#FFFFFF' : C.text2;
      c.textContent = rec.sharpe.toFixed(2);

      c.addEventListener('pointerenter', (e) => {
        tip.innerHTML = `<b>lookback</b> ${lb} &nbsp; <b>threshold</b> ${th.toFixed(1)}<br>Sharpe ${rec.sharpe.toFixed(2)}`;
        tip.classList.add('on');
        placeTip(tip, box, e.clientX, e.clientY);
      });
      c.addEventListener('pointerleave', () => tip.classList.remove('on'));
      grid.appendChild(c);
    });
  });

  box.appendChild(grid);
}

/* ══════════════════════════════════════════════════════════════════════════
   MONTE CARLO FAN  —  percentile cone with the realised path drawn inside it
   ══════════════════════════════════════════════════════════════════════════ */
function renderMonteCarlo(box) {
  const mc = getMonteCarlo();
  // Into its own slot, not into `box` — see the comment in index.html.
  legend(document.getElementById('mcLegend') || box, [
    ['rgba(57,135,229,0.18)', '5th–95th percentile'],
    ['rgba(57,135,229,0.38)', '25th–75th percentile'],
    [C.pos, 'Median path'],
    [C.line, 'Realised backtest'],
  ]);

  const W = 1000, H = 330;
  const P = { l: 66, r: 14, t: 18, b: 46 };
  const svg = svgRoot(W, H);
  svg.setAttribute('aria-label',
    `Monte Carlo percentile cone from ${mc.paths} block-bootstrap resamples of the trade sequence`);

  const all = mc.bands.flatMap((b) => b.p).concat(mc.realisedPath);
  const min = Math.min(...all, kpis.startEquity) * 0.96;
  const max = Math.max(...all) * 1.02;
  const X = (i) => P.l + (i / (mc.bands.length - 1)) * (W - P.l - P.r);
  const Y = (v) => P.t + (1 - (v - min) / (max - min)) * (H - P.t - P.b);

  for (let i = 0; i <= 4; i++) {
    const v = min + ((max - min) * i) / 4;
    const y = Y(v);
    svg.appendChild(el('line', { x1: P.l, x2: W - P.r, y1: y, y2: y, stroke: C.grid, 'stroke-width': 1 }));
    const t = el('text', { x: P.l - 12, y: y + 4, fill: C.muted, 'font-size': 11, 'text-anchor': 'end', 'font-family': 'JetBrains Mono, monospace' });
    t.textContent = moneyShort(v);
    svg.appendChild(t);
  }

  // Cone: outer band first, inner band over it, so the overlap reads darker.
  const band = (loIdx, hiIdx, opacity) => {
    const up = mc.bands.map((b, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(b.p[hiIdx]).toFixed(1)}`).join('');
    const down = mc.bands
      .map((b, i) => ({ b, i }))
      .reverse()
      .map(({ b, i }) => `L${X(i).toFixed(1)},${Y(b.p[loIdx]).toFixed(1)}`)
      .join('');
    svg.appendChild(el('path', { d: `${up}${down}Z`, fill: C.pos, opacity }));
  };
  band(0, 4, 0.16);
  band(1, 3, 0.24);

  const path = (vals, stroke, width, dash) => {
    const d = vals.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join('');
    const a = { d, fill: 'none', stroke, 'stroke-width': width, 'stroke-linejoin': 'round' };
    if (dash) a['stroke-dasharray'] = dash;
    svg.appendChild(el('path', a));
  };
  path(mc.bands.map((b) => b.p[2]), C.pos, 1.75, '5 4');
  path(mc.realisedPath, C.line, 2.25);

  // Starting capital reference — the line that matters for "did it lose money".
  const y0 = Y(kpis.startEquity);
  svg.appendChild(el('line', { x1: P.l, x2: W - P.r, y1: y0, y2: y0, stroke: C.axis, 'stroke-width': 1, 'stroke-dasharray': '2 4' }));

  [0, 25, 50, 75, 100].forEach((p) => {
    const i = Math.round((p / 100) * (mc.bands.length - 1));
    const t = el('text', { x: X(i), y: H - 24, fill: C.muted, 'font-size': 11, 'text-anchor': 'middle', 'font-family': 'JetBrains Mono, monospace' });
    t.textContent = `${p}%`;
    svg.appendChild(t);
  });
  const xl = el('text', { x: (W + P.l) / 2, y: H - 5, fill: C.muted, 'font-size': 10.5, 'text-anchor': 'middle', 'font-family': 'JetBrains Mono, monospace' });
  xl.textContent = 'progress through the trade sequence';
  svg.appendChild(xl);

  const cross = el('line', { y1: P.t, y2: H - P.b, stroke: C.axis, 'stroke-width': 1, opacity: 0 });
  svg.appendChild(cross);
  box.appendChild(svg);
  const tip = tipFor(box);

  svg.addEventListener('pointermove', (e) => {
    const r = svg.getBoundingClientRect();
    const rel = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((rel - P.l) / (W - P.l - P.r)) * (mc.bands.length - 1));
    if (i < 0 || i >= mc.bands.length) return;
    const b = mc.bands[i];
    cross.setAttribute('x1', X(i));
    cross.setAttribute('x2', X(i));
    cross.setAttribute('opacity', 1);
    tip.innerHTML =
      `<b>${Math.round(b.t * 100)}% through</b><br>` +
      `<b>95th</b> ${moneyShort(b.p[4])}<br>` +
      `<b>median</b> ${moneyShort(b.p[2])}<br>` +
      `<b>5th</b> ${moneyShort(b.p[0])}<br>` +
      `<b>realised</b> ${moneyShort(mc.realisedPath[i])}`;
    tip.classList.add('on');
    placeTip(tip, box, e.clientX, e.clientY);
  });
  svg.addEventListener('pointerleave', () => {
    cross.setAttribute('opacity', 0);
    tip.classList.remove('on');
  });
}

function renderMonteCarloStats(root) {
  const mc = getMonteCarlo();
  const rows = [
    ['Final return — median', pct(mc.finalP50), '', `realised ${pct(mc.realised)}`],
    ['Final return — 5th percentile', pct(mc.finalP5), mc.finalP5 < 0 ? 'neg' : '', '1 in 20 paths did worse'],
    ['Final return — 95th percentile', pct(mc.finalP95), '', '1 in 20 paths did better'],
    ['Max drawdown — median', `${mc.ddMedian.toFixed(1)}%`, 'neg', `realised ${mc.ddRealised.toFixed(1)}%`],
    ['Max drawdown — worst 5%', `${mc.ddP95.toFixed(1)}%`, 'neg', 'plan for this, not the median'],
    ['Paths ending in profit', `${mc.probProfit.toFixed(1)}%`, '', `of ${mc.paths.toLocaleString()} resamples`],
    ['Paths breaching −20%', `${mc.probDD20.toFixed(1)}%`, '', 'at some point in the run'],
    ['Paths breaching −30%', `${mc.probDD30.toFixed(1)}%`, '', 'at some point in the run'],
  ];
  root.innerHTML = rows
    .map(
      ([k, v, tone, sub]) =>
        `<div class="mc-stat"><div class="mc-k">${k}</div>` +
        `<div class="mc-v ${tone}">${v}</div>` +
        `<div class="mc-s">${sub}</div></div>`
    )
    .join('');
}

/* ══════════════════════════════════════════════════════════════════════════
   ROBUSTNESS  —  PSR / DSR / PBO
   ══════════════════════════════════════════════════════════════════════════ */
function renderRobustness(root) {
  const rb = getRobustness();
  // A probability that rounds to 100 is a rounding artefact, not a certainty.
  const prob = (v) => (v >= 99.95 ? '>99.9%' : `${v.toFixed(1)}%`);

  const cards = [
    {
      k: 'Probabilistic Sharpe',
      v: prob(rb.psr),
      tone: 'pos',
      d: `Probability the true Sharpe is above zero, corrected for track length (${kpis.sessions.toLocaleString()} sessions), skew ${kpis.skew.toFixed(2)} and excess kurtosis ${kpis.kurtosis.toFixed(2)}.`,
    },
    {
      k: 'Deflated Sharpe',
      v: prob(rb.dsr),
      tone: rb.dsr >= 90 ? 'pos' : rb.dsr >= 60 ? '' : 'neg',
      d: `The same test with the bar raised to Sharpe ${rb.sr0.toFixed(2)} — what the best of ${rb.trials} trials would be expected to show with no edge at all. Sharpe ${rb.sharpe.toFixed(2)} clears it.`,
    },
    {
      k: 'Prob. of backtest overfitting',
      v: `${rb.pbo.toFixed(1)}%`,
      tone: rb.pbo <= 20 ? 'pos' : rb.pbo <= 40 ? '' : 'neg',
      d: `CSCV over ${rb.splits} blocks and all ${rb.combinations} symmetric splits. This is how often the in-sample winner lands below median out-of-sample. 50% is a coin flip.`,
    },
    {
      k: 'Configurations evaluated',
      v: rb.trials.toString(),
      tone: '',
      d: 'Every one of them is reported in the sensitivity grid below — including the ones that failed. Selecting a winner from a grid you never show is how backtests lie.',
    },
  ];

  root.innerHTML = cards
    .map(
      (c) =>
        `<div class="rob-card"><div class="rob-k">${c.k}</div>` +
        `<div class="rob-v ${c.tone}">${c.v}</div>` +
        `<p class="rob-d">${c.d}</p></div>`
    )
    .join('');
}

/* ══════════════════════════════════════════════════════════════════════════
   REGIME ANALYSIS
   ══════════════════════════════════════════════════════════════════════════ */
function renderRegimes(table) {
  const rg = getRegimes();
  const head = ['Regime', 'Realised vol', 'Sessions', '% of time', 'Ann. return', 'Sharpe', 'Worst day', 'Share of P&L'];
  table.innerHTML =
    `<thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead>` +
    `<tbody>${rg
      .map(
        (r) =>
          `<tr><td>${r.label}</td>` +
          `<td>${r.annVol.toFixed(1)}%</td>` +
          `<td>${r.sessions}</td>` +
          `<td>${r.share.toFixed(1)}%</td>` +
          `<td class="${r.annRet >= 0 ? 'v-pos' : 'v-neg'}">${pct(r.annRet)}</td>` +
          `<td>${r.sharpe.toFixed(2)}</td>` +
          `<td class="v-neg">${r.worstDay.toFixed(2)}%</td>` +
          `<td>${r.pnlShare.toFixed(1)}%</td></tr>`
      )
      .join('')}</tbody>`;
}

/* ══════════════════════════════════════════════════════════════════════════
   NON-CHART BLOCKS
   ══════════════════════════════════════════════════════════════════════════ */
function renderHead() {
  document.getElementById('rptStrategy').textContent = meta.strategyName;
  document.getElementById('rptSub').textContent =
    `${meta.instrument} · ${meta.timeframe} · ${meta.sessions.toLocaleString()} sessions`;

  const dl = document.getElementById('rptMeta');
  const rows = [
    ['Period', meta.period],
    ['Trades', kpis.totalTrades.toLocaleString()],
    ['Starting capital', money(kpis.startEquity)],
    ['Ending capital', money(kpis.finalEquity)],
  ];
  rows.forEach(([k, v]) => {
    const dt = document.createElement('dt');
    dt.textContent = k;
    const dd = document.createElement('dd');
    dd.textContent = v;
    dl.appendChild(dt);
    dl.appendChild(dd);
  });
}

function paintTiles(g, tiles) {
  if (!g) return;
  tiles.forEach(([label, value, suffix, dec, tone, sub]) => {
    const d = document.createElement('div');
    d.className = 'kpi';
    d.innerHTML =
      `<div class="kpi-label">${label}</div>` +
      `<div class="kpi-value ${tone}" data-count="${value}" data-dec="${dec}" data-suffix="${suffix}">${value.toFixed(dec)}${suffix}</div>` +
      `<div class="kpi-sub">${sub}</div>`;
    g.appendChild(d);
  });
}

function renderKpis() {
  const tiles = [
    ['Net return', kpis.totalReturn, '%', 1, 'pos', 'over 5 years'],
    ['CAGR', kpis.cagr, '%', 1, 'pos', 'annualised'],
    ['Sharpe', kpis.sharpe, '', 2, '', 'annualised'],
    ['Sortino', kpis.sortino, '', 2, '', 'downside only'],
    ['Max drawdown', kpis.maxDD, '%', 1, 'neg', `${kpis.maxDDDays} sessions underwater`],
    ['Calmar', kpis.calmar, '', 2, '', 'CAGR / max DD'],
    ['Win rate', kpis.winRate, '%', 1, '', `${kpis.totalTrades.toLocaleString()} trades`],
    ['Profit factor', kpis.profitFactor, '', 2, '', 'gross win / gross loss'],
    ['Payoff ratio', kpis.payoff, '', 2, '', `avg win ${money(kpis.avgWin)}`],
    ['Expectancy', kpis.expectancyR, 'R', 3, '', `${money(kpis.expectancy)} per trade`],
    ['Volatility', kpis.volatility, '%', 1, '', 'annualised'],
    ['Positive months', kpis.positiveMonths, '%', 0, '', `best ${pct(kpis.bestMonth)} · worst ${pct(kpis.worstMonth)}`],
  ];
  paintTiles(document.getElementById('kpiGrid'), tiles);

  // Second group. Headline metrics tell you what it earned; these tell you
  // what it felt like to hold — which is what actually decides whether a
  // strategy gets switched off halfway through a drawdown.
  paintTiles(document.getElementById('riskGrid'), [
    ['Ulcer index', kpis.ulcer, '', 2, '', 'RMS depth underwater'],
    ['Ulcer perf. index', kpis.upi, '', 2, '', 'CAGR per unit of pain'],
    ['Recovery factor', kpis.recoveryFactor, '', 2, '', 'net return / max DD'],
    ['Omega ratio', kpis.omega, '', 2, '', 'gain / loss above zero'],
    ['Daily VaR 95%', kpis.var95, '%', 2, 'neg', '1 day in 20 is worse'],
    ['Daily CVaR 95%', kpis.cvar95, '%', 2, 'neg', 'average of that worst 5%'],
    ['Return skew', kpis.skew, '', 2, '', 'daily, 0 = symmetric'],
    ['Excess kurtosis', kpis.kurtosis, '', 2, '', 'daily, 0 = normal tails'],
    ['Tail ratio', kpis.tailRatio, '', 2, '', 'P95 win / P5 loss, in R'],
    ['Best trade', kpis.bestTrade, 'R', 2, '', 'single largest winner'],
    ['Worst trade', kpis.worstTrade, 'R', 2, 'neg', 'single largest loser'],
    ['Trades / month', kpis.tradesPerMonth, '', 1, '', `${kpis.maxLossStreak} max consecutive losses`],
  ]);
}

function renderOos() {
  const g = document.getElementById('oosGrid');
  const blocks = [
    ['In-sample', meta.inSample, `start → ${meta.splitDate}`],
    ['Out-of-sample', meta.outOfSample, `${meta.splitDate} → end`],
    ['Full period', { cagr: kpis.cagr, sharpe: kpis.sharpe, maxDD: kpis.maxDD }, meta.period],
  ];
  blocks.forEach(([title, s, note]) => {
    const c = document.createElement('div');
    c.className = 'oos-card';
    c.innerHTML =
      `<h5>${title} <span style="text-transform:none;letter-spacing:0;opacity:.7">· ${note}</span></h5>` +
      `<div class="oos-row"><span>CAGR</span><b>${pct(s.cagr)}</b></div>` +
      `<div class="oos-row"><span>Sharpe</span><b>${s.sharpe.toFixed(2)}</b></div>` +
      `<div class="oos-row"><span>Max drawdown</span><b style="color:${C.neg}">${s.maxDD.toFixed(1)}%</b></div>`;
    g.appendChild(c);
  });
}

function renderYearly() {
  const t = document.getElementById('yearlyTable');
  const head = ['Year', 'Return', 'Max DD', 'Sharpe', 'Trades', 'Win rate'];
  t.innerHTML =
    `<thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead>` +
    `<tbody>${yearly
      .map(
        (y) =>
          `<tr><td>${y.year}</td>` +
          `<td class="${y.ret >= 0 ? 'v-pos' : 'v-neg'}">${pct(y.ret)}</td>` +
          `<td class="v-neg">${y.maxDD.toFixed(1)}%</td>` +
          `<td>${y.sharpe.toFixed(2)}</td>` +
          `<td>${y.trades}</td>` +
          `<td>${y.winRate.toFixed(1)}%</td></tr>`
      )
      .join('')}</tbody>` +
    `<tfoot><tr><td>All</td>` +
    `<td class="v-pos">${pct(kpis.totalReturn)}</td>` +
    `<td class="v-neg">${kpis.maxDD.toFixed(1)}%</td>` +
    `<td>${kpis.sharpe.toFixed(2)}</td>` +
    `<td>${kpis.totalTrades.toLocaleString()}</td>` +
    `<td>${kpis.winRate.toFixed(1)}%</td></tr></tfoot>`;
}

function renderAssumptions() {
  const g = document.getElementById('assumeGrid');
  assumptions.forEach((a) => {
    const d = document.createElement('dl');
    d.className = 'assume';
    d.innerHTML = `<dt>${a.label}</dt><dd>${a.value}</dd>`;
    g.appendChild(d);
  });
}

function renderRead() {
  const worstYear = yearly.reduce((a, y) => (y.ret < a.ret ? y : a), yearly[0]);
  const el2 = document.getElementById('readBlock');
  el2.innerHTML = `
    <p>Over ${yearly.length} years and ${kpis.totalTrades.toLocaleString()} trades, the specified
    rules produced a <strong>${pct(kpis.cagr)} compound annual return</strong> against a
    <strong>${kpis.maxDD.toFixed(1)}% worst drawdown</strong> — a Calmar of
    ${kpis.calmar.toFixed(2)}. Risk-adjusted return (Sharpe ${kpis.sharpe.toFixed(2)}) is solid
    without being suspicious; anything above roughly 2.5 on daily data would have us checking for
    a look-ahead bug before we checked anything else.</p>

    <p>The edge is <strong>thin per trade and wide in aggregate</strong>: expectancy is
    ${kpis.expectancyR.toFixed(3)}R with a win rate of ${kpis.winRate.toFixed(1)}% and a payoff
    ratio of ${kpis.payoff.toFixed(2)}. That combination means results depend on trade count, not
    on a handful of outliers — the distribution above has no single bar carrying the outcome.
    It also means costs matter enormously, which is why they're modelled rather than assumed away.</p>

    <p>Out-of-sample degrades, as it should. Sharpe falls from
    ${meta.inSample.sharpe.toFixed(2)} in-sample to ${meta.outOfSample.sharpe.toFixed(2)} on data
    no parameter ever saw, and CAGR from ${pct(meta.inSample.cagr)} to
    ${pct(meta.outOfSample.cagr)}. That gap is the honest cost of fitting, and it is the number
    we'd want a client looking at hardest.</p>

    <p><strong>Where it hurts:</strong> ${worstYear.year} returned ${pct(worstYear.ret)} with a
    ${worstYear.maxDD.toFixed(1)}% drawdown, and the strategy spent
    ${kpis.maxDDDays} sessions — over ${(kpis.maxDDDays / 252).toFixed(1)} years — below a prior
    equity peak at its worst stretch. Any assessment of whether this is tradeable has to start
    with whether that stretch is survivable, psychologically and financially, at your size.</p>
  `;
}

/**
 * The robustness read is appended separately because it depends on the
 * deferred Monte Carlo and CSCV blocks — running it eagerly would pull ~80ms
 * of arithmetic back onto the boot path for a paragraph nobody has scrolled to.
 */
function appendRobustnessRead(root) {
  const mc = getMonteCarlo();
  const rb = getRobustness();
  const rg = getRegimes();
  const worstRegime = rg.reduce((a, r) => (r.sharpe < a.sharpe ? r : a), rg[0]);

  const p = document.createElement('div');
  p.innerHTML = `
    <p><strong>How much of this was luck?</strong> Reshuffling the realised trades in blocks
    ${mc.paths.toLocaleString()} times puts the backtested ${pct(mc.realised)} near the
    ${pct(mc.finalP50)} median — so the headline result is not an outlier path. The tail is the
    part worth reading: the worst 5% of resamples drew down
    ${mc.ddP95.toFixed(1)}% against the ${mc.ddRealised.toFixed(1)}% actually realised, and
    ${mc.probDD20.toFixed(1)}% of paths breached −20% at some point. Size for that number, not
    for the one on the equity curve.</p>

    <p><strong>And overfitting?</strong> The deflated Sharpe puts the edge at
    ${rb.dsr >= 99.95 ? '>99.9' : rb.dsr.toFixed(1)}% likely to be real after accounting for
    ${rb.trials} configurations being tried — the bar it had to clear was Sharpe
    ${rb.sr0.toFixed(2)}, not zero. CSCV returns a
    ${rb.pbo.toFixed(1)}% probability of backtest overfitting; under 20% is the range we'd
    call robust, 50% would mean the in-sample winner is a coin flip. Across volatility regimes
    the edge persists but thins — Sharpe falls to ${worstRegime.sharpe.toFixed(2)} in the
    ${worstRegime.label.toLowerCase()} bucket, which is where a live deployment would be
    tested hardest.</p>
  `;
  root.appendChild(p);
}

/**
 * Run `fn` when `elm` gets within a screenful of the viewport.
 *
 * The Monte Carlo, CSCV and regime blocks cost ~80ms of arithmetic between
 * them. That is fine to spend — but not during boot, on a page that paid
 * traffic lands on and bounces from. Their containers reserve their own
 * height in CSS, so deferring costs no layout shift.
 */
function whenNear(elm, fn) {
  if (!elm) return;
  if (!('IntersectionObserver' in window)) {
    fn();
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      try {
        fn();
      } catch (err) {
        console.warn('[report] deferred block failed:', err);
      }
    },
    { rootMargin: '900px 0px' }
  );
  io.observe(elm);
}

/* ══════════════════════════════════════════════════════════════════════════ */
export function initReport(cfg) {
  if (!document.getElementById('reportRoot')) return;

  if (!cfg.isSample) {
    document.getElementById('sampleBanner')?.remove();
  }

  renderHead();
  renderKpis();
  renderOos();
  renderYearly();
  renderAssumptions();
  renderRead();

  renderEquity(document.getElementById('chartEquity'));
  renderDrawdown(document.getElementById('chartDrawdown'));
  renderMonthly(document.getElementById('chartMonthly'));
  renderDistribution(document.getElementById('chartDist'));
  renderSensitivity(document.getElementById('chartSens'));

  const mcBox = document.getElementById('chartMonteCarlo');
  whenNear(mcBox, () => {
    renderMonteCarlo(mcBox);
    renderMonteCarloStats(document.getElementById('mcStats'));
  });

  const robBox = document.getElementById('robGrid');
  whenNear(robBox, () => renderRobustness(robBox));

  const regTable = document.getElementById('regimeTable');
  whenNear(regTable, () => renderRegimes(regTable));

  const readEl = document.getElementById('readBlock');
  whenNear(readEl, () => appendRobustnessRead(readEl));
}

export { data };

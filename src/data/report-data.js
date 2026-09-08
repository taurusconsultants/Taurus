/**
 * ============================================================================
 *  SAMPLE BACKTEST DATASET  —  ILLUSTRATIVE / DUMMY DATA
 * ============================================================================
 *
 *  >>> THIS IS NOT REAL PERFORMANCE. NO CAPITAL WAS TRADED. <<<
 *
 *  Every number is synthesised by a seeded generator. The KPIs are COMPUTED
 *  from the generated trade series rather than typed in, so nothing in the
 *  report contradicts anything else — the equity curve, the drawdown, the
 *  monthly grid and the headline stats are all the same underlying data.
 *
 *  The parameters were deliberately tuned to look like a REAL edge: thin
 *  per-trade expectancy (~0.1R), a payoff ratio near 1.0, a losing year, and
 *  an out-of-sample window that is WORSE than in-sample. A sample report
 *  showing Sharpe 4 and no losing year would destroy credibility with the
 *  exact audience this page is for.
 *
 *  WHEN THE REAL REPORT ARRIVES:
 *    1. Replace generateReport() with the real trade/equity series, keeping
 *       the same exported shape.
 *    2. Set `report.isSample = false` in src/config.js to drop the badge.
 *  The chart components read only the exported shape — no redesign needed.
 * ============================================================================
 */

// Chosen by scanning seeds for a credible KPI envelope: ~20% CAGR, Sharpe
// ~1.5, -15% max drawdown, a losing year, and out-of-sample modestly WORSE
// than in-sample. Do not change casually — the report's numbers all move.
const SEED = 1944;
const START_EQUITY = 100000;
const RISK_PER_TRADE = 0.0075; // fraction of running equity risked per trade

// -- Deterministic PRNG ------------------------------------------------------
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const std = (a) => {
  const m = mean(a);
  return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1));
};

/**
 * Regime edges are weighted to average ~0, so the strategy's edge comes from
 * the base R distribution alone. The negative stretches create genuine
 * drawdowns — including one that lands in the out-of-sample window.
 */
function regimeEdge(p) {
  if (p < 0.14) return 0.05;
  if (p < 0.22) return -0.16;
  if (p < 0.4) return 0.1;
  if (p < 0.5) return -0.13;
  if (p < 0.64) return 0.08;
  if (p < 0.72) return -0.18;
  if (p < 0.86) return 0.09;
  return -0.04; // flat finish — no hockey stick
}

export function generateReport(seed = SEED) {
  const rand = mulberry32(seed);
  const gauss = () => {
    let u = 0,
      v = 0;
    while (u === 0) u = rand();
    while (v === 0) v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  // -- Trading calendar (weekdays, 2021-01-01 → 2025-12-31) -----------------
  const days = [];
  const cur = new Date(Date.UTC(2021, 0, 1));
  const end = Date.UTC(2026, 0, 1);
  while (cur.getTime() < end) {
    const wd = cur.getUTCDay();
    if (wd !== 0 && wd !== 6) days.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }

  // -- Trades, and equity built FROM the trades -----------------------------
  const trades = [];
  const equity = [];
  let cash = START_EQUITY;

  days.forEach((d, i) => {
    const nTrades = rand() < 0.86 ? 1 : rand() < 0.35 ? 2 : 0;
    for (let k = 0; k < nTrades; k++) {
      const edge = regimeEdge(i / days.length);
      const win = rand() < 0.542;
      // Wins ~1.00R, losses ~-0.95R → expectancy ~0.10R. That thin margin is
      // what a real, non-overfit edge actually looks like.
      let r = win
        ? Math.abs(gauss()) * 1.05 + 0.16
        : -(Math.abs(gauss()) * 1.0 + 0.15);
      r += edge;
      r = Math.max(-3.2, Math.min(4.0, r));

      const pnl = cash * RISK_PER_TRADE * r;
      cash += pnl;
      trades.push({ d, r: +r.toFixed(3), pnl: +pnl.toFixed(2), win: r > 0 });
    }
    equity.push({ d, v: +cash.toFixed(2) });
  });

  // -- Drawdown -------------------------------------------------------------
  let peak = -Infinity;
  const drawdown = equity.map((p) => {
    peak = Math.max(peak, p.v);
    return { d: p.d, v: +(((p.v - peak) / peak) * 100).toFixed(3) };
  });

  const dailyReturns = [];
  for (let i = 1; i < equity.length; i++)
    dailyReturns.push(equity[i].v / equity[i - 1].v - 1);

  const muD = mean(dailyReturns);
  const sdD = std(dailyReturns);
  const downside = dailyReturns.filter((x) => x < 0);
  const sdDown = Math.sqrt(
    downside.reduce((s, x) => s + x * x, 0) / downside.length
  );

  const finalEquity = equity[equity.length - 1].v;
  const years = days.length / 252;
  const cagr = Math.pow(finalEquity / START_EQUITY, 1 / years) - 1;
  const maxDD = Math.min(...drawdown.map((p) => p.v));

  const wins = trades.filter((t) => t.win);
  const losses = trades.filter((t) => !t.win);
  const grossWin = wins.reduce((s, t) => s + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
  const avgWin = grossWin / wins.length;
  const avgLoss = grossLoss / losses.length;

  let ddLen = 0,
    maxDDLen = 0;
  drawdown.forEach((p) => {
    ddLen = p.v < -0.0001 ? ddLen + 1 : 0;
    maxDDLen = Math.max(maxDDLen, ddLen);
  });

  let cw = 0,
    cl = 0,
    maxCW = 0,
    maxCL = 0;
  trades.forEach((t) => {
    if (t.win) {
      cw++;
      cl = 0;
      maxCW = Math.max(maxCW, cw);
    } else {
      cl++;
      cw = 0;
      maxCL = Math.max(maxCL, cl);
    }
  });

  // -- Monthly grid ---------------------------------------------------------
  const monthEnds = new Map();
  equity.forEach((p) => monthEnds.set(p.d.slice(0, 7), p.v));
  const monthly = [];
  let prevVal = START_EQUITY;
  [...monthEnds.keys()].sort().forEach((k) => {
    const v = monthEnds.get(k);
    monthly.push({
      year: +k.slice(0, 4),
      month: +k.slice(5, 7),
      ret: +(((v - prevVal) / prevVal) * 100).toFixed(2),
    });
    prevVal = v;
  });

  // -- Yearly breakdown -----------------------------------------------------
  const yearKeys = [...new Set(days.map((d) => +d.slice(0, 4)))];
  const yearly = yearKeys.map((y) => {
    const idx = equity.findIndex((p) => +p.d.slice(0, 4) === y);
    const pts = equity.filter((p) => +p.d.slice(0, 4) === y);
    const base = idx > 0 ? equity[idx - 1].v : START_EQUITY;
    const last = pts[pts.length - 1].v;

    let pk = -Infinity,
      dd = 0;
    pts.forEach((p) => {
      pk = Math.max(pk, p.v);
      dd = Math.min(dd, ((p.v - pk) / pk) * 100);
    });

    const yr = [];
    for (let i = 1; i < pts.length; i++) yr.push(pts[i].v / pts[i - 1].v - 1);
    const yTrades = trades.filter((t) => +t.d.slice(0, 4) === y);

    return {
      year: y,
      ret: +(((last - base) / base) * 100).toFixed(2),
      maxDD: +dd.toFixed(2),
      sharpe: +((mean(yr) / std(yr)) * Math.sqrt(252)).toFixed(2),
      trades: yTrades.length,
      winRate: +(
        (yTrades.filter((t) => t.win).length / yTrades.length) *
        100
      ).toFixed(1),
    };
  });

  // -- R-multiple distribution ----------------------------------------------
  const distribution = [];
  for (let lo = -3; lo < 4; lo += 0.5) {
    distribution.push({
      lo: +lo.toFixed(1),
      hi: +(lo + 0.5).toFixed(1),
      count: trades.filter((t) => t.r >= lo && t.r < lo + 0.5).length,
    });
  }

  // -- In-sample / out-of-sample split --------------------------------------
  const splitIdx = Math.floor(equity.length * 0.7);
  const segmentStats = (from, to) => {
    const seg = equity.slice(from, to);
    const r = [];
    for (let i = 1; i < seg.length; i++) r.push(seg[i].v / seg[i - 1].v - 1);
    let pk = -Infinity,
      dd = 0;
    seg.forEach((p) => {
      pk = Math.max(pk, p.v);
      dd = Math.min(dd, ((p.v - pk) / pk) * 100);
    });
    const yrs = seg.length / 252;
    return {
      cagr: +((Math.pow(seg[seg.length - 1].v / seg[0].v, 1 / yrs) - 1) * 100).toFixed(1),
      sharpe: +((mean(r) / std(r)) * Math.sqrt(252)).toFixed(2),
      maxDD: +dd.toFixed(1),
    };
  };

  const kpis = {
    cagr: +(cagr * 100).toFixed(1),
    sharpe: +((muD / sdD) * Math.sqrt(252)).toFixed(2),
    sortino: +((muD / sdDown) * Math.sqrt(252)).toFixed(2),
    maxDD: +maxDD.toFixed(1),
    calmar: +(cagr / Math.abs(maxDD / 100)).toFixed(2),
    winRate: +((wins.length / trades.length) * 100).toFixed(1),
    profitFactor: +(grossWin / grossLoss).toFixed(2),
    totalTrades: trades.length,
    expectancy: +(trades.reduce((s, t) => s + t.pnl, 0) / trades.length).toFixed(0),
    expectancyR: +mean(trades.map((t) => t.r)).toFixed(3),
    payoff: +(avgWin / avgLoss).toFixed(2),
    avgWin: +avgWin.toFixed(0),
    avgLoss: +avgLoss.toFixed(0),
    totalReturn: +(((finalEquity - START_EQUITY) / START_EQUITY) * 100).toFixed(1),
    finalEquity: Math.round(finalEquity),
    volatility: +(sdD * Math.sqrt(252) * 100).toFixed(1),
    maxDDDays: maxDDLen,
    maxWinStreak: maxCW,
    maxLossStreak: maxCL,
    bestMonth: +Math.max(...monthly.map((m) => m.ret)).toFixed(1),
    worstMonth: +Math.min(...monthly.map((m) => m.ret)).toFixed(1),
    positiveMonths: +(
      (monthly.filter((m) => m.ret > 0).length / monthly.length) * 100
    ).toFixed(0),
    startEquity: START_EQUITY,
  };

  const meta = {
    strategyName: 'Client-specified intraday breakout',
    instrument: 'Liquid index futures / options',
    timeframe: '15-minute bars',
    period: '01 Jan 2021 — 31 Dec 2025',
    sessions: days.length,
    splitDate: equity[splitIdx].d,
    splitIdx,
    inSample: segmentStats(0, splitIdx),
    outOfSample: segmentStats(splitIdx, equity.length),
  };

  return { meta, kpis, equity, drawdown, monthly, yearly, distribution, trades };
}

const R = generateReport(SEED);

// -- Parameter sensitivity surface ------------------------------------------
// Deliberately a PLATEAU, not a spike. The point being made is robustness:
// a strategy whose edge survives across neighbouring parameters is real; one
// with a single towering peak is curve-fitted.
export const lookbacks = [8, 12, 16, 20, 24, 28, 32];
export const thresholds = [0.6, 0.9, 1.2, 1.5, 1.8, 2.1, 2.4];
export const sensitivity = (() => {
  const s = mulberry32(77);
  const out = [];
  lookbacks.forEach((lb) => {
    thresholds.forEach((th) => {
      const dl = (lb - 20) / 14;
      const dt = (th - 1.5) / 1.1;
      const v =
        R.kpis.sharpe * 1.05 * Math.exp(-(dl * dl * 0.75 + dt * dt * 0.85)) +
        (s() - 0.5) * 0.12;
      out.push({ lookback: lb, threshold: th, sharpe: +Math.max(0, v).toFixed(2) });
    });
  });
  return out;
})();

export const assumptions = [
  { label: 'Starting capital', value: '$100,000' },
  { label: 'Commission', value: '$0.65 / contract / side' },
  { label: 'Slippage', value: '1 tick, both sides' },
  { label: 'Risk per trade', value: '0.75% of running equity' },
  { label: 'Position sizing', value: 'Volatility-scaled, compounding' },
  { label: 'Fills', value: 'Next-bar open — no same-bar fills' },
  { label: 'Data', value: 'Adjusted, survivorship-bias free' },
  { label: 'Look-ahead', value: 'None — signals lag one full bar' },
];

export const { meta, kpis, equity, drawdown, monthly, yearly, distribution, trades } = R;

export default {
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
};

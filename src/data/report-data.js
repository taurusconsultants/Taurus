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

/** Central moment of order k, normalised by the sample standard deviation. */
function moment(a, k) {
  const m = mean(a);
  const s = std(a);
  return mean(a.map((x) => ((x - m) / s) ** k));
}

/** Linear-interpolated quantile of an ALREADY-SORTED ascending array. */
function quantile(sorted, p) {
  const i = (sorted.length - 1) * p;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
}

/**
 * Standard normal CDF — Abramowitz & Stegun 26.2.17. Accurate to ~7.5e-8,
 * which is well inside what any figure on this report is quoted to.
 */
function normCdf(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp((-z * z) / 2);
  const p =
    d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z > 0 ? 1 - p : p;
}

/** Inverse standard normal CDF — Acklam's rational approximation. */
function normInv(p) {
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const pl = 0.02425;
  if (p < pl) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p > 1 - pl) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  const q = p - 0.5;
  const r = q * q;
  return ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
    (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

/**
 * Memoise a zero-argument computation.
 *
 * The Monte Carlo, CSCV and regime blocks together cost ~150ms — which is
 * fine, but not on the boot path of a page paid traffic lands on. These are
 * exposed as functions so the renderer can run them when the report section
 * approaches the viewport, and each one runs at most once.
 */
function memo(fn) {
  let done = false;
  let value;
  return () => {
    if (!done) {
      value = fn();
      done = true;
    }
    return value;
  };
}

/** Box–Muller draw from a supplied uniform PRNG. */
function gaussFrom(rand) {
  let u = 0,
    v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

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

  // -- Distribution / tail statistics ---------------------------------------
  // All computed from the same daily series the headline metrics use, so the
  // risk panel can never disagree with the performance panel.
  const sortedDaily = [...dailyReturns].sort((a, b) => a - b);
  const var95 = quantile(sortedDaily, 0.05);
  const tail = sortedDaily.filter((x) => x <= var95);
  const cvar95 = mean(tail);
  const upDays = dailyReturns.filter((x) => x > 0);
  const downDays = dailyReturns.filter((x) => x < 0);
  const omega =
    upDays.reduce((s, x) => s + x, 0) / Math.abs(downDays.reduce((s, x) => s + x, 0));
  // Ulcer index: RMS of the underwater curve. Penalises long shallow pain the
  // way a single max-drawdown number never does.
  const ulcer = Math.sqrt(mean(drawdown.map((p) => p.v * p.v)));
  const sortedR = trades.map((t) => t.r).sort((a, b) => a - b);
  const tailRatio = Math.abs(quantile(sortedR, 0.95) / quantile(sortedR, 0.05));
  const skew = moment(dailyReturns, 3);
  const kurtExcess = moment(dailyReturns, 4) - 3;

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

    // -- Risk & distribution -------------------------------------------------
    omega: +omega.toFixed(2),
    ulcer: +ulcer.toFixed(2),
    // Ulcer performance index — excess return per unit of *sustained* pain.
    upi: +((cagr * 100) / ulcer).toFixed(2),
    recoveryFactor: +(((finalEquity - START_EQUITY) / START_EQUITY) * 100 / Math.abs(maxDD)).toFixed(2),
    var95: +(var95 * 100).toFixed(2),
    cvar95: +(cvar95 * 100).toFixed(2),
    skew: +skew.toFixed(2),
    kurtosis: +kurtExcess.toFixed(2),
    tailRatio: +tailRatio.toFixed(2),
    bestTrade: +Math.max(...sortedR).toFixed(2),
    worstTrade: +Math.min(...sortedR).toFixed(2),
    tradesPerMonth: +(trades.length / monthly.length).toFixed(1),
    // Kept for the deflated-Sharpe calculation further down; not displayed.
    dailySharpe: (muD / sdD),
    dailyStd: sdD,
    sessions: dailyReturns.length,
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

  return { meta, kpis, equity, drawdown, monthly, yearly, distribution, trades, dailyReturns };
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

/* ══════════════════════════════════════════════════════════════════════════
   MONTE CARLO  —  bootstrap resampling of the realised trade sequence
   ══════════════════════════════════════════════════════════════════════════
   The single backtest equity curve is ONE path out of a very large number the
   same edge could have produced. Reshuffling the realised trades (i.i.d.
   bootstrap, same count, same sizing rule) answers the question a single
   curve cannot: how much of this result was the edge, and how much was the
   order the trades happened to arrive in?

   Deliberately kept to 1,000 paths — enough for stable 5th/95th percentiles,
   cheap enough not to cost anything visible at page load.
   ────────────────────────────────────────────────────────────────────────── */
const MC_PATHS = 1000;
const MC_CHECKS = 60;
// Moving-BLOCK bootstrap, not i.i.d. Resampling single trades destroys the
// clustering that produces real drawdowns, and flatters the result badly —
// every path comes back profitable and the tail looks far tamer than it is.
// Blocks of ~25 consecutive trades keep the losing streaks intact.
const MC_BLOCK = 25;

export const getMonteCarlo = memo(() => {
  const rnd = mulberry32(20260912);
  const rs = R.trades.map((t) => t.r);
  const n = rs.length;

  // Checkpoints where every path is sampled, so the fan chart has a common x.
  const checkAt = Array.from({ length: MC_CHECKS }, (_, i) =>
    Math.floor(((i + 1) * n) / MC_CHECKS) - 1
  );

  const atCheck = Array.from({ length: MC_CHECKS }, () => []);
  const finals = [];
  const maxDDs = [];

  for (let p = 0; p < MC_PATHS; p++) {
    let cash = START_EQUITY;
    let peak = START_EQUITY;
    let dd = 0;
    let ci = 0;
    let i = 0;

    while (i < n) {
      const start = (rnd() * n) | 0;
      const len = Math.min(MC_BLOCK, n - i);
      for (let j = 0; j < len; j++, i++) {
        cash += cash * RISK_PER_TRADE * rs[(start + j) % n];
        if (cash > peak) peak = cash;
        const d = ((cash - peak) / peak) * 100;
        if (d < dd) dd = d;
        if (ci < MC_CHECKS && i === checkAt[ci]) atCheck[ci++].push(cash);
      }
    }
    finals.push(cash);
    maxDDs.push(dd);
  }

  const PCTS = [0.05, 0.25, 0.5, 0.75, 0.95];
  const bands = atCheck.map((col, i) => {
    col.sort((a, b) => a - b);
    return {
      t: (checkAt[i] + 1) / n,
      p: PCTS.map((q) => quantile(col, q)),
    };
  });

  // The realised path, sampled at the SAME checkpoints, so it can be drawn
  // inside the cone. Rebuilt from trade P&L rather than the daily equity
  // series, so the x-axis is genuinely trade count and not an approximation.
  let c = START_EQUITY;
  const byTrade = R.trades.map((t) => (c += t.pnl));
  const realisedPath = checkAt.map((i) => byTrade[i]);

  const fs = [...finals].sort((a, b) => a - b);
  const dd = [...maxDDs].sort((a, b) => a - b); // ascending → worst first
  const ret = (v) => +(((v - START_EQUITY) / START_EQUITY) * 100).toFixed(1);
  const share = (arr, fn) => +((arr.filter(fn).length / arr.length) * 100).toFixed(1);

  return {
    paths: MC_PATHS,
    block: MC_BLOCK,
    bands,
    realisedPath,
    percentiles: PCTS,
    finalP5: ret(quantile(fs, 0.05)),
    finalP25: ret(quantile(fs, 0.25)),
    finalP50: ret(quantile(fs, 0.5)),
    finalP75: ret(quantile(fs, 0.75)),
    finalP95: ret(quantile(fs, 0.95)),
    realised: R.kpis.totalReturn,
    ddMedian: +quantile(dd, 0.5).toFixed(1),
    ddP95: +quantile(dd, 0.05).toFixed(1), // the worst 5% of outcomes
    ddRealised: R.kpis.maxDD,
    probProfit: share(finals, (v) => v > START_EQUITY),
    probDD20: share(maxDDs, (v) => v <= -20),
    probDD30: share(maxDDs, (v) => v <= -30),
    probHalved: share(maxDDs, (v) => v <= -50),
  };
});

/* ══════════════════════════════════════════════════════════════════════════
   ROBUSTNESS  —  is this an edge, or the best of N tries?
   ══════════════════════════════════════════════════════════════════════════
   Any parameter sweep produces a winner. The winner looks good BECAUSE it
   won, not necessarily because it is real. Two standard corrections:

     PSR — Probabilistic Sharpe Ratio (Bailey & López de Prado). The
           probability the true Sharpe exceeds zero, correcting for track
           length, skew and fat tails.
     DSR — Deflated Sharpe Ratio. PSR with the benchmark raised to the Sharpe
           you would EXPECT the best of N trials to show under no edge at all.
     PBO — Probability of Backtest Overfitting, via Combinatorially Symmetric
           Cross-Validation. Split the track into S blocks, take every way of
           choosing half as in-sample, pick the in-sample winner, and see
           where it lands out-of-sample. If the winner is a coin flip out of
           sample, PBO tends to 50%.

   The trial series below are synthesised to match each grid configuration's
   Sharpe — consistent with the rest of this sample being synthetic. On a real
   engagement CSCV runs on the actual per-configuration return series.
   ────────────────────────────────────────────────────────────────────────── */
const CSCV_SPLITS = 8;
// Neighbouring configurations of the SAME strategy trade largely the same
// signals, so their return series are strongly correlated. Generating them
// independently is the common mistake: it makes the in-sample winner close to
// random and pushes PBO toward 50% for strategies that are genuinely robust.
const CSCV_RHO = 0.9;

export const getRobustness = memo(() => {
  const T = R.kpis.sessions;
  const sd = R.kpis.dailyStd;
  const srHat = R.kpis.dailySharpe;
  const N = sensitivity.length;

  // -- PSR / DSR ------------------------------------------------------------
  const g3 = R.kpis.skew;
  const g4 = R.kpis.kurtosis + 3; // non-excess kurtosis, as the formula wants
  const denom = Math.sqrt(1 - g3 * srHat + ((g4 - 1) / 4) * srHat * srHat);
  const psr = normCdf((srHat * Math.sqrt(T - 1)) / denom);

  // Expected maximum Sharpe across N independent trials with no true edge.
  const trialSr = sensitivity.map((c) => c.sharpe / Math.sqrt(252));
  const vTrial = std(trialSr);
  const EULER = 0.5772156649015329;
  const sr0 =
    vTrial * ((1 - EULER) * normInv(1 - 1 / N) + EULER * normInv(1 - 1 / (N * Math.E)));
  const dsr = normCdf(((srHat - sr0) * Math.sqrt(T - 1)) / denom);

  // -- PBO via CSCV ---------------------------------------------------------
  // Per-configuration daily series, generated once, reduced immediately to
  // per-block sums so the combination loop is O(1) per block rather than O(T).
  const rnd = mulberry32(90210);
  const blockLen = Math.floor(T / CSCV_SPLITS);

  // One market-wide shock series shared by every configuration, plus an
  // idiosyncratic component per configuration. rho controls how much of the
  // variance is common.
  const wc = Math.sqrt(CSCV_RHO);
  const wi = Math.sqrt(1 - CSCV_RHO);
  const common = Array.from({ length: CSCV_SPLITS * blockLen }, () => gaussFrom(rnd));

  const blocks = sensitivity.map((cfg) => {
    const mu = (cfg.sharpe / Math.sqrt(252)) * sd;
    const bs = [];
    for (let b = 0; b < CSCV_SPLITS; b++) {
      let s = 0;
      let ss = 0;
      for (let i = 0; i < blockLen; i++) {
        const x = mu + sd * (wc * common[b * blockLen + i] + wi * gaussFrom(rnd));
        s += x;
        ss += x * x;
      }
      bs.push({ s, ss });
    }
    return bs;
  });

  const sharpeOver = (bs, idx) => {
    let s = 0;
    let ss = 0;
    const n = idx.length * blockLen;
    idx.forEach((b) => {
      s += bs[b].s;
      ss += bs[b].ss;
    });
    const m = s / n;
    return m / Math.sqrt(ss / n - m * m);
  };

  // Every way of splitting S blocks into equal in-sample / out-of-sample halves.
  const combos = [];
  (function choose(start, picked) {
    if (picked.length === CSCV_SPLITS / 2) return combos.push(picked.slice());
    for (let i = start; i < CSCV_SPLITS; i++) {
      picked.push(i);
      choose(i + 1, picked);
      picked.pop();
    }
  })(0, []);

  const logits = [];
  combos.forEach((is) => {
    const oos = [...Array(CSCV_SPLITS).keys()].filter((b) => !is.includes(b));
    let best = 0;
    let bestSr = -Infinity;
    blocks.forEach((bs, k) => {
      const sr = sharpeOver(bs, is);
      if (sr > bestSr) {
        bestSr = sr;
        best = k;
      }
    });
    const oosSr = blocks.map((bs) => sharpeOver(bs, oos));
    const rank = oosSr.filter((x) => x <= oosSr[best]).length;
    const w = rank / (N + 1);
    logits.push(Math.log(w / (1 - w)));
  });

  const pbo = logits.filter((l) => l <= 0).length / logits.length;

  return {
    trials: N,
    splits: CSCV_SPLITS,
    combinations: combos.length,
    psr: +(psr * 100).toFixed(1),
    dsr: +(dsr * 100).toFixed(1),
    pbo: +(pbo * 100).toFixed(1),
    sr0: +(sr0 * Math.sqrt(252)).toFixed(2), // shown annualised, like every other Sharpe
    sharpe: R.kpis.sharpe,
    medianLogit: +quantile([...logits].sort((a, b) => a - b), 0.5).toFixed(2),
  };
});

/* ══════════════════════════════════════════════════════════════════════════
   REGIME ANALYSIS  —  k-means over rolling realised volatility
   ══════════════════════════════════════════════════════════════════════════
   A single Sharpe hides the question that actually matters at deployment
   time: does this thing work everywhere, or does one regime carry it? Days
   are clustered (k=3, 1-D k-means) on 20-session realised volatility, and
   each cluster is scored independently.

   Clustering on the strategy's OWN volatility, not on a market factor, is
   stated plainly because it matters: this describes the conditions the
   strategy itself experienced, not a macro regime call.
   ────────────────────────────────────────────────────────────────────────── */
const REGIME_WIN = 20;
const REGIME_K = 3;

export const getRegimes = memo(() => {
  const rets = R.dailyReturns;
  const vol = [];
  for (let i = 0; i < rets.length; i++) {
    const from = Math.max(0, i - REGIME_WIN + 1);
    const w = rets.slice(from, i + 1);
    vol.push(std(w.length > 2 ? w : rets.slice(0, 3)) * Math.sqrt(252) * 100);
  }

  // 1-D k-means, seeded at evenly spaced quantiles so the result is stable.
  const sorted = [...vol].sort((a, b) => a - b);
  let cents = [quantile(sorted, 1 / 6), quantile(sorted, 3 / 6), quantile(sorted, 5 / 6)];
  let assign = new Array(vol.length).fill(0);

  for (let it = 0; it < 40; it++) {
    let moved = false;
    vol.forEach((v, i) => {
      let best = 0;
      let bd = Infinity;
      cents.forEach((c, k) => {
        const d = Math.abs(v - c);
        if (d < bd) {
          bd = d;
          best = k;
        }
      });
      if (assign[i] !== best) {
        assign[i] = best;
        moved = true;
      }
    });
    cents = cents.map((c, k) => {
      const members = vol.filter((_, i) => assign[i] === k);
      return members.length ? mean(members) : c;
    });
    if (!moved) break;
  }

  const order = cents.map((c, k) => ({ c, k })).sort((a, b) => a.c - b.c);
  const LABELS = ['Low volatility', 'Normal', 'High volatility / stress'];
  const totalPnl = R.trades.reduce((s, t) => s + t.pnl, 0);

  return order.map((o, rank) => {
    const idx = [];
    assign.forEach((a, i) => a === o.k && idx.push(i));
    const r = idx.map((i) => rets[i]);
    // Days are indexed from equity[1], so equity index i+1 maps to return i.
    const dates = new Set(idx.map((i) => R.equity[i + 1].d));
    const tr = R.trades.filter((t) => dates.has(t.d));
    const m = mean(r);
    const s = std(r);
    return {
      label: LABELS[rank],
      sessions: idx.length,
      share: +((idx.length / rets.length) * 100).toFixed(1),
      annVol: +(o.c).toFixed(1),
      annRet: +((Math.pow(1 + m, 252) - 1) * 100).toFixed(1),
      sharpe: +((m / s) * Math.sqrt(252)).toFixed(2),
      worstDay: +(Math.min(...r) * 100).toFixed(2),
      trades: tr.length,
      pnlShare: +((tr.reduce((a, t) => a + t.pnl, 0) / totalPnl) * 100).toFixed(1),
    };
  });
});

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
  getMonteCarlo,
  getRobustness,
  getRegimes,
};

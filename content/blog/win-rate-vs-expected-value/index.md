---
title: "Why a 30% win rate can beat a 90% win rate: understanding expected value"
description: "Win rate alone says how often a strategy is right; expected value says what each outcome is actually worth."
date: 2026-09-26
author: taurus
tags: [expected-value, win-rate, model-evaluation, backtesting]
draft: false
---

A trader posts a strategy with a 90% win rate and calls it proven. A few weeks
later, one unmanaged loss on the tenth trade wipes out every gain the other
nine produced. The strategy did not get unlucky. It was never measured on the
number that determines whether it is profitable.

Win rate answers how often a rule is right. It says nothing about how much is
won or lost when it is right or wrong. This post sets out how expected value
combines the two into a single figure, what that figure does and does not
capture, and where a report has to show it alongside win rate rather than in
place of it.

![A row of ten identical small circles above a second row of ten circles resized by outcome, three enlarged and seven shrunk.](./win-rate-vs-expected-value-illustration.png "Expected value weighs each outcome by its size, not just how often it happens. Illustration, AI-generated; conceptual, not data.")

## The problem

A win rate is a count. It treats a trade that returns a small amount the same
as a trade that returns a large one, as long as both are wins. Ten trades with
nine wins and one loss produces a 90% win rate whether the wins are tiny and
the loss is enormous, or the reverse.

That is precisely the gap a trader chasing a high win rate falls into.
Strategies that win often tend to do so by taking small, frequent gains and
capping risk loosely, or not at all, on the rare trade that goes wrong. The
result looks reliable on a scorecard that only counts outcomes, right up to
the trade where the uncapped loss arrives.

The reverse is also true, and less intuitive. A rule that is wrong most of the
time can still be profitable, if what it wins when it is right comfortably
outweighs what it loses when it is wrong, in proportion to how often each
happens. Judging a strategy by win rate alone throws away exactly the
information needed to tell these two cases apart.

## How it works

Expected value is the average outcome per trade, calculated from four inputs:
how often a trade wins, how much it wins on average, how often it loses, and
how much it loses on average.

### The formula

$$
\text{EV} = (p_w \times \bar{W}) - (p_l \times \bar{L})
$$

Here $p_w$ is the win rate, $\bar{W}$ is the average win, $p_l$ is the loss
rate, and $\bar{L}$ is the average loss. Because a trade can only win or lose,
$p_l = 1 - p_w$. The formula weighs each side by how often it occurs, then
nets one against the other.

### A worked example

Take a rule that wins 30% of the time. Its exits are asymmetric by design: a
winning trade returns $300, a losing trade is cut at $100.

$$
\text{EV} = (0.30 \times \$300) - (0.70 \times \$100) = \$90 - \$70 = \$20
$$

The rule is wrong on seven trades out of ten, and the average outcome per
trade is still positive. Nothing about that result depends on predicting
which seven trades will lose. It depends only on the ratio between how big
the wins are and how big the losses are being allowed to get, relative to how
often each occurs.

Flip the asymmetry and the same win rate turns negative. A 30% win rate paying
$100 a time against a $300 loss the other 70% of the time gives
$(0.30 \times \$100) - (0.70 \times \$300) = -\$180$. Same win rate, opposite
sign, because the sizes moved.

## What it means for a backtest

A report that states win rate without also stating average win and average
loss has stated a number that cannot be interpreted on its own. The table
below is the worked example above, shown the way these figures need to sit
together.

| Metric | Value |
|---|---|
| Win rate | 30% |
| Loss rate | 70% |
| Average win | $300 |
| Average loss | $100 |
| Expected value per trade | +$20 |

Illustrative figures, used to demonstrate the calculation, not a backtested
result.

Read on its own, the 30% figure in the first row looks like a weak strategy.
Read against the other four rows, it is the strategy that is actually worth
funding. A report that prints win rate in isolation, or highlights it as the
headline number, invites the reader to draw the first conclusion instead of
the second.

## What it does not tell you

Expected value is an average. It says what a trade is worth over a large
number of repetitions, not what happens on any particular run of ten or fifty
trades. A rule with a positive expected value can still produce a losing
streak long enough to breach a drawdown limit or exhaust an account, because
the calculation says nothing about how outcomes are sequenced.

It also assumes the win rate, average win and average loss observed in the
past continue to hold. If the market regime that produced them changes, the
inputs to the formula change with it, and a figure computed from history
stops describing what comes next. Expected value is a statement about a set
of trades that already happened, not a forecast.

Finally, the formula treats every trade as the same size. It says nothing
about position sizing, so two strategies with an identical expected value per
trade can carry very different risk of ruin once the size of each bet is
accounted for.

## How this shows up in a Taurus report

The headline metrics block in a Taurus report lists win rate next to average
win, average loss and profit factor on the same line, so none of them can be
read in isolation from the others. The plain-English read at the end of the
report states directly whether the combination nets to a positive or negative
average outcome, rather than leaving a reader to react to whichever figure is
printed largest.

If a report you already have shows a win rate with no average win or average
loss beside it, that is the figure to ask for before treating the win rate as
meaningful on its own.

## FAQ

### Why can nine winning trades in a row still leave a strategy unprofitable?

Because the size of the tenth trade, the loss, determines the outcome as much
as the count of the previous nine. If that loss is left uncapped, it can
exceed the combined value of every win that came before it. The win rate over
those ten trades stays high while the expected value per trade, once the
uncapped loss is included, can be negative.

### Is loss rate always just one minus win rate?

Yes, for a rule where every trade closes as either a win or a loss with no
other outcome. Some traders track a third category, trades closed at
breakeven, in which case win rate, loss rate and breakeven rate together sum
to one, and the expected value formula extends with a third term that
contributes zero.

### Can expected value stay positive if losses are not capped?

It can, as long as the average loss stays small enough relative to the
average win and the win rate to keep the formula positive. The risk is that
an uncapped loss has no upper bound, so a single outlier can move the average
loss enough to flip the sign, which a capped exit rule prevents by design.

### Does a positive expected value mean every individual trade is a win?

No. Expected value describes the average across many trades, not any single
one. A strategy with a positive expected value is still expected to lose on
whatever share of trades its loss rate specifies. The claim is about the
long-run average, not about the outcome of the next trade.

---
title: "You Don't Need to Predict the Market"
description: "A rule that wins under half its trades can still have positive expectancy once win size and loss size are weighed, not just frequency."
date: 2026-09-26
author: taurus
tags: [expectancy, probability, backtesting, robustness]
draft: true
---

A strategy backtests well, then loses four trades in a row once it goes live. The instinct is to read that streak as proof the edge was never real, because trading gets framed as a series of correct or incorrect predictions about where price goes next.

That framing is the wrong lens for a rule meant to be judged over hundreds or thousands of trades. A single trade tells you almost nothing on its own. Even a method with a real, measurable edge can lose its next trade, and the one after that. This post is about the shift from asking whether one trade will win to asking what a large enough sample of trades under the same conditions actually does, and why that shift changes what counts as evidence.

![A loose cloud of small and slightly larger circles scattered with no order, with a single thin line extending from their centre to a point on one side.](./outcome-cloud-expectancy-illustration.png "Individual outcomes look random on their own; weighed by size they settle into one direction. Illustration, AI-generated; conceptual, not data.")

## The problem

Predicting a single trade is a coin flip dressed up as analysis. Even a rule with a genuine statistical edge can string together a run of losses purely by chance, because a positive expectancy measured over a large sample says nothing about the order individual trades arrive in. Judging a strategy by its last few trades, or by whether the next one lands, is judging noise rather than the rule.

The cost of that framing is not just wasted worry. A trader who reads a losing streak as a verdict often exits a method exactly when its long run distribution says it should be kept, and a trader who reads a winning streak as validation often keeps a method with no measurable edge at all. Both mistakes come from asking the same wrong question: will this trade win, instead of what does this rule do across many trades under these conditions.

Treating a single outcome as informative also invites overfitting. Chasing a run of trades that felt right leads to adjusting rules around the last few outcomes rather than the distribution the rule was built to capture, which is a fast way to end up with something that worked once and nothing more.

## How it works

A rule's expectancy is the average result it would produce, per trade, if it ran many times under the same conditions. It is a probability weighted average of the two outcomes a trade can have:

$$
E = p_w \bar{W} - (1 - p_w) \bar{L}
$$

where $p_w$ is the probability of a winning trade, $\bar{W}$ is the average size of a win, and $\bar{L}$ is the average size of a loss. When $E$ is positive, the rule pays on average, even though any single trade might still lose.

The result is not obvious from the win rate alone. A rule that wins only 45% of the time looks, at a glance, like a losing proposition. But expectancy weighs frequency against size, and if the average win is large enough relative to the average loss, the average still comes out positive. Algebraically, the breakeven point at a 45% win rate sits where the average win is about 1.22 times the average loss, since the breakeven ratio is the loss probability divided by the win probability, 0.55 divided by 0.45. Above that ratio, the rule is losing more often than it wins and still paying over time, because size, not frequency, is doing the work.

Positive expectancy is a statement about the centre of a distribution, not a promise about the next draw from it. Even a rule whose expectancy is comfortably positive produces a spread of outcomes around that centre, and a real run of trades can sit well below it for a stretch before catching back up. That is why win size, loss size and frequency all matter individually and not only once multiplied together: two rules with identical expectancy but different spreads around it are not equally comfortable to sit through.

## What it means for a backtest

A backtest exists to turn "the wins look bigger than the losses" into a measured expectancy, computed from every trade a rule would have taken rather than a feeling about the last handful. That means recording, at minimum, how often the rule wins, the average size of a win, the average size of a loss, and the shape of the full distribution around those averages, not only the two averages themselves.

The distribution matters because expectancy is a long run statement, and a report has to say how long the run needs to be before the average shows up reliably, and how far a real sequence of trades can drift from it in the meantime. A rule can be strongly positive on average and still produce a stretch of trades that most people would abandon before the average reasserts itself. Drawdown and volatility measures put a number on exactly that stretch, separately from the headline win rate.

None of this is a promise. Historical data describes what happened under conditions that will not repeat exactly, so an expectancy computed on one stretch of history has to be checked against others: different years, different volatility regimes, different market conditions, to see whether it holds up or was specific to the sample it was measured on. A number computed once, on one window, is a hypothesis about expectancy, not a confirmed one.

## What it does not tell you

A positive expectancy is a statement about averages, not about certainty. It says nothing about which specific trade in a sequence will be the winner that makes the average work, and a losing streak long enough to test conviction is compatible with a rule whose expectancy has never been higher.

Expectancy also assumes the future resembles the sample it was measured on closely enough for the average to keep meaning something. If the conditions that produced the win rate and payoff sizes shift, an expectancy that was genuinely positive on historical data can decay or flip, and no backtest can rule that out in advance.

Finally, expectancy alone says nothing about position size. A rule can have a comfortably positive expectancy and still be unsurvivable if sized so that its normal drawdown erodes the capital behind it before the long run average has a chance to show up.

## How this shows up in a Taurus report

The headline metrics block in every report states win rate and profit factor together, precisely so the two cannot be read separately: a low win rate next to a high profit factor is the report's way of pointing at the trade-off this post describes. The trade distribution section behind those two numbers shows the spread each average is drawn from, not just its centre.

The Monte Carlo section, a moving-block bootstrap over the trade series, is where the width of that distribution gets tested directly: it shows how far a real sequence of trades could plausibly wander from the reported average before catching back up to it. On a report you already have, the quick check is to read win rate and profit factor as a pair rather than separately, then look at the Monte Carlo spread before judging how comfortable that pair actually is to sit through.

## FAQ

### Can a strategy with a win rate under 50% still have positive expectancy?

Yes, if the average win is large enough relative to the average loss. Win rate alone says how often a rule is right, not how much each right or wrong result is worth, and expectancy needs both numbers to mean anything.

### How is expectancy different from predicting whether a trade will win?

Prediction asks for a single answer about one event: whether this trade lands in profit. Expectancy asks for a probability and two payoff sizes, multiplies them together, and describes what a rule does on average across many trades rather than what happens on any one of them.

### Does a positive expectancy guarantee a strategy keeps working?

No. Expectancy is computed from historical data and assumes the conditions that produced it hold closely enough for the average to keep meaning something. If those conditions shift, a genuinely positive historical expectancy can decay or turn negative, and no backtest can rule that out in advance.

### Why look at the full distribution of outcomes instead of just win rate and average size?

Because expectancy is a long run average, and a real sequence of trades can sit well above or below it for a stretch before catching up. The distribution, and how far a sequence can wander from its centre, is what shows how uncomfortable that stretch could get, which the two averages alone cannot show.

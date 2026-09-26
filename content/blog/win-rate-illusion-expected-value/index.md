---
title: "The Win-Rate Illusion: Why Professional Traders Focus on Expected Value"
description: "Win rate on its own says nothing about profitability; expected value combines it with the size of wins and losses to show whether a rule has an edge."
date: 2026-09-26
author: taurus
tags: [expected-value, risk-reward, backtesting, trade-evaluation]
draft: false
---

A trader can win nine trades in a row and still be running a strategy with a negative edge. The habit that produces this is familiar: the trader lets the tenth trade run against them rather than close it, because closing it would break the streak, and the loss on that one trade wipes out everything the previous nine produced.

The instinct to chase a high win rate is understandable. It feels like being right. But how often a rule wins says nothing on its own about whether it should be traded. A rule that wins seven times in ten can be more profitable than one that wins nine times in ten, and the only way to tell the difference is to weigh the size of the wins and losses, not just count them. This post is about the calculation that does that weighing: expected value.

![Two rows of small shapes, a row of identical squares above a row of differently sized rectangles, with two lines converging into a single dot below them.](./expected-value-combination-illustration.png "Win rate and payoff size are separate quantities that combine into one number. Illustration, AI-generated; conceptual, not data.")

## The problem

Win rate is the easiest statistic to compute from a trade log, and the easiest to misread. It answers one question: out of the trades taken, what fraction closed positive. It says nothing about how large the wins were relative to the losses, so two rules with identical win rates can sit on opposite sides of breakeven.

Treating win rate as the headline number encourages a specific mistake: sizing exits to protect the streak rather than to protect the account. A rule that lets winners run to a small, fixed target locks in a high win rate by construction, because most trades are closed the moment they are slightly ahead. The same rule, run without a matching discipline on the loss side, leaves losing trades open in the hope they turn around, because closing one at a loss breaks the streak and dents the number the trader is watching.

The result is a return distribution with many small gains and a small number of large losses. The win rate on that distribution can be as high as 90%. Its expected value can still be negative, because the size of the rare loss outweighs the frequency of the frequent small gain. A single unmanaged loss in that tail is enough to remove several months of the small wins that built the streak.

## How it works

Expected value treats a trading rule the way an actuary treats a bet: as a weighted average of every possible outcome, where the weight is how often that outcome occurs. Applied to a strategy, it collapses two separate questions, how often a rule wins and how large the wins and losses are, into a single number denominated in the rule's own units of risk.

### Win rate and loss rate

Win rate is the share of closed trades that were profitable, estimated from the trade log as wins divided by total trades. Loss rate is the complement, one minus the win rate, assuming every trade closes as a clean win or loss. Both are frequencies, estimated the same way any probability is estimated from a finite sample: they carry sampling error, and the estimate gets noisier the fewer trades it is drawn from.

### Average win and average loss

Average win is the mean profit of the winning trades; average loss is the mean loss of the losing trades, both taken as positive numbers so the formula below reads cleanly. These two figures depend on exits, not on entries. A rule with a wide profit target and a tight stop will show a large average win and a small average loss even if the entries are picked at random, which is why average win and average loss have to be read together with the rate that produced them, never alone.

### Putting the two together

Expected value per trade is the win rate multiplied by the average win, minus the loss rate multiplied by the average loss:

$$
\mathrm{EV} = p_w \bar{W} - (1 - p_w)\bar{L}
$$

where $p_w$ is the win rate, $\bar W$ is the average win and $\bar L$ is the average loss.

Take a rule with a win rate of 30%, an average win of $300 and an average loss capped at $100. Plugging in:

$$
\mathrm{EV} = (0.30 \times 300) - (0.70 \times 100) = 90 - 70 = 20
$$

The rule loses seven trades out of ten and is still positive by $20 a trade on average. Over a long enough run of independent trades, the sample average of the outcomes converges toward this figure, which is the sense in which the number describes an edge: not that any one trade will be profitable, but that the size and frequency of the wins are set up to outweigh the size and frequency of the losses across the sample.

The same formula works in percentage terms as well as currency, using average win and loss as a share of the entry price or of account equity. That is the form it takes once position size varies from trade to trade rather than staying fixed at $300 and $100 throughout.

## What it means for a backtest

A backtest report that stops at win rate is reporting half the calculation. Two rules can share an identical win rate and sit on opposite sides of zero once the size of their wins and losses is taken into account, so a report has to state win rate, average win and average loss, or the equivalent payoff ratio $\bar W / \bar L$, together, never win rate on its own.

The table below shows two synthetic rules built to have the same win rate and opposite expected value, to make the point concrete.

| Rule | Win rate | Average win | Average loss | Expected value |
|---|---|---|---|---|
| A | 40% | $150 | $80 | $28 |
| B | 40% | $80 | $150 | −$58 |

Illustrative. Two synthetic trade series constructed to share a win rate and diverge on expected value.

Rule A and Rule B would look identical on a report that only stated win rate. A reader relying on that single figure has no way to tell which one is which. Expected value, or the payoff ratio that feeds it, is what separates them.

Sample size matters here as much as the calculation itself. Win rate, average win and average loss are all estimated from a finite trade log, and a rule with fifty trades gives a much noisier estimate of each than one with five hundred. A positive expected value on a short trade log is weaker evidence of an edge than the same figure on a long one, even before any question of overfitting is considered.

## What it does not tell you

Expected value is a per-trade average, not a description of the path taken to get there. It says nothing about the order in which wins and losses arrive, so a positive expected value is fully compatible with a long run of losses before the average reasserts itself, and with a drawdown deep enough to force the account, or the trader, out before it does.

It also does not account for position sizing. A rule with a positive expected value in currency terms can still carry a high probability of ruin if the position size relative to account equity is too large, because expected value does not fold in variance, tail risk or the compounding effect of a large loss on capital that has already shrunk.

Nor does it say anything about whether the win rate and payoff figures used to compute it will hold outside the sample they were measured on. Expected value is only as good as the trade log that produced it, and a log confined to one regime describes an edge in that regime, not a permanent property of the rule.

## How this shows up in a Taurus report

The headline metrics block in a Taurus report already carries win rate and profit factor, the ratio of gross wins to gross losses, which is closely related to expected value: a profit factor above one and a win rate below fifty per cent can only coexist if the average win is larger than the average loss, the same relationship the expected value formula makes explicit. Expected value itself is not a default headline figure, but it can be requested as a custom metric in section 10 of the specification, alongside the trade size and time basis it should be measured in.

The check a reader can run on a report they already have: read win rate and profit factor together, not win rate alone. If the win rate is high and the profit factor is close to or below one, the wins are small relative to the losses, and the strategy sits closer to Rule B in the table above than the headline win rate suggests.

## FAQ

### Is a high win rate ever a useful thing to look for?

It is useful as one input, not as a stand-alone target. A high win rate that comes with a payoff ratio close to or below one describes a fragile strategy, and a high win rate combined with a healthy payoff ratio describes a strong one. The number is informative only once it is read next to average win and average loss.

### How many trades does it take before an expected value estimate is trustworthy?

There is no fixed threshold. What matters is how variable the win and loss sizes are: a rule with tightly clustered outcomes needs fewer trades to pin down its average than one with occasional very large wins or losses, because the sample mean of a high-variance series takes longer to settle. A report should show how the estimate moves as more trades are added, not just its final value.

### Does a positive expected value mean a single trade is likely to be profitable?

No. Expected value describes the average outcome across many repetitions of the same set of odds, not the likely result of any one trade. With a 30% win rate, seven trades out of ten still lose, even though the sequence as a whole is set up to be profitable on average.

### What is the difference between expected value and profit factor?

Profit factor is the ratio of total gains to total losses across a trade log; expected value is the average outcome per trade. The two move together, a profit factor above one implies a positive expected value and the reverse, but profit factor does not separate frequency from size the way the expected value formula does, so two rules with the same profit factor can have very different win rates and payoff ratios underneath it.

# reference_blog.md — how to turn a draft into a Taurus blog post

**Who this file is for:** an AI model. A Taurus author attaches this file to a chat
together with their draft (PDF, DOC, TXT, Markdown, anything) and any images, and
types one line: the post title. You, the model, return a finished post folder that
drops straight into `content/blog/` and builds without edits.

Everything the build enforces, everything the reviewer checks, and the house style
are in this one file. Do not ask the author for anything this file already answers.
If something is genuinely undecidable, make the safer choice, deliver anyway, and
flag it in the notes described in §11.

---

## 0. For the human: how to prompt

Attach this file, your draft, and your images. Then send:

```
Title: <the post title>
```

Optional second and third lines:

```
Author: <your key in src/authors.js>        (default: taurus)
Date: YYYY-MM-DD                            (default: today)
```

You get back a folder. Paste it into `content/blog/`, follow §12, done.

---

## 1. The contract

You receive:

| Input | Always? | What to do with it |
|---|---|---|
| This file | yes | Follow it. |
| A title | yes | Use it verbatim as `title`. Derive the slug from it (§3). |
| A draft document | yes | The source of every argument, number and claim in the post. |
| Images | sometimes | Copy into the folder, rename, reference, caption (§6). |
| An author key | rarely | Use it. Otherwise `author: taurus`. |
| A date | rarely | Use it. Otherwise today's date. |
| `reference_image.md` | sometimes | When attached and no images were supplied, follow it as well: one conceptual illustration slot plus the prompt to generate it (§6). |

You return **one folder**, named by the slug, containing:

```
<slug>/
  index.md            ← the only Markdown file, exactly this name
  <image files>       ← only images the post references, nothing else
```

Nothing else goes in the folder. Every non-Markdown file in it is copied to the
public site as-is, so a `notes.txt` or `README.md` inside the folder would be
published. Notes go outside the folder (§11).

Deliver as a zip if you can produce files. If you cannot, use the text fallback in
§10.

---

## 2. The rule that overrides everything else

Taurus **tests and reports on trading strategies that the client specifies**. It
does not originate strategies, does not give investment advice, does not
recommend trades, does not forecast returns, and never mentions price or cost.

Every sentence you write must pass this test: *is it a statement about what a
test showed, how a method works, or how a report is built?* If it is a statement
about what a reader should trade, what will happen in a market, or what a
strategy will earn, it does not ship. Rewrite it as a statement about testing.

**Sell avoided loss, never gained profit.** The value of the work is stopping
someone from funding a strategy that is not there. Never phrase it as improving
returns, finding an edge, or making money.

**Never present a backtest as an expectation.** Every figure is labelled as
backtested, simulated, synthetic, or illustrative. "Past" and "would have" are
your friends. "Will" and "expect" are not.

### 2.1 The lint — patterns the build checks

The build strips code blocks and maths, then runs these regular expressions over
the prose. Check your output against them yourself before delivering.

**Hard — the build FAILS and the post cannot merge:**

```
/\bguaranteed? (returns?|profits?|gains?|income)\b/i
/\brisk[- ]free (returns?|profits?|gains?)\b/i
/\bwill (make|earn|generate|return) (you )?(money|profits?|\d+\s?%)/i
/\b(you|we|readers?|traders?) should (buy|sell|short|go long|enter|exit)\b/i
/\bwe recommend (buying|selling|shorting|going long|trading|entering|exiting)\b/i
/\b(buy|sell|short|strong buy|strong sell) (rating|call|recommendation)s?\b/i
/\bprice targets?\b/i
/\b(buy|sell) (the )?(dip|top|breakout|bounce)\b/i
```

**Soft — the build warns. Treat these as hard too**, unless the term is used in its
strict statistical sense and the sentence is plainly about a test, not a promise:

```
/\bexpected returns?\b/i        → "expected return" as E[r] in a formula is fine; as a forecast is not
/\boutperform(s|ed|ing)?\b/i    → only when describing a backtest comparison, never a forecast
/\bmake money\b/i               → reframe as avoided loss
/\bstock picks?\b/i             → we do not pick anything
/\bthis (strategy|setup|system) works\b/i → say what the test showed instead
/\b(free|no cost|complimentary|pricing|per report|per month)\b/i → no price, no cost, ever
```

Note that the last soft pattern catches the word **"free"** in any sense, including
"risk-free rate" and "free of leakage". Write "riskless rate" or $r_f$, and "without
leakage". It also catches "pricing" in "option pricing" — write "option valuation".

### 2.2 Things the lint does not catch but the reviewer will

- A market view. "Rates are likely to fall" — no. "In the 2022 rate-rise window the
  strategy's drawdown was…" — yes.
- Naming a specific instrument as attractive or unattractive.
- Implying the reader's strategy will pass. "Once you fix this, it will hold up" — no.
- A number with no label. Every figure in a table or caption is backtested,
  simulated, synthetic, or illustrative, and the caption or surrounding sentence
  says which.
- A source's chart or number reproduced without attribution.

---

## 3. Slug and folder name

The folder name is the URL: `content/blog/<slug>/` → `taurusconsultancy.com/blog/<slug>/`.

Rules the build enforces: lowercase `a–z`, digits, single hyphens between words.
No leading or trailing hyphen, no double hyphen, no other characters. Regex:
`^[a-z0-9]+(?:-[a-z0-9]+)*$`.

Rules of taste: three to seven words. Keep the nouns that carry the idea, drop
articles and filler. Under 60 characters.

| Title | Slug |
|---|---|
| Why we resample blocks of trades, not single trades | `why-we-resample-blocks-of-trades` |
| The Deflated Sharpe Ratio: what 49 trials do to a 1.5 | `deflated-sharpe-49-trials` |
| Purged cross-validation for a client-trained model | `purged-cross-validation` |

The slug must not collide with an existing post. Existing posts as of this file:
`why-we-resample-blocks-of-trades`.

---

## 4. Frontmatter

`index.md` opens with a YAML block. This exact shape:

```yaml
---
title: "The title, verbatim as given"
description: "One sentence. Under 160 characters. The search snippet and the blog-index card."
date: 2026-09-26
author: taurus
tags: [backtesting, overfitting]
draft: true
---
```

| Field | Required | Rules |
|---|---|---|
| `title` | yes | Verbatim from the author. **Always double-quoted** (a colon in an unquoted title breaks YAML). Escape inner double quotes as `\"`. |
| `description` | yes | One sentence, **under 160 characters** (the build warns above 200; aim lower). Not a repeat of the title. States the problem or the finding, not "In this post we…". Always double-quoted. |
| `date` | yes | `YYYY-MM-DD`. Today unless the author gives one. Controls ordering on the index. |
| `author` | yes | A key that exists in `src/authors.js`. Currently the only key is `taurus`. Use what the author gives; otherwise `taurus`. An unknown key fails the build. |
| `tags` | yes | Two to five, lowercase kebab-case, as a flow list `[a, b, c]`. Reuse existing tags where they fit: `backtesting`, `monte-carlo`, `drawdown`, `robustness`. Other good ones: `overfitting`, `optimisation`, `walk-forward`, `cross-validation`, `execution`, `slippage`, `costs`, `regime`, `model-evaluation`, `leakage`, `sharpe`, `data`, `deployment`. |
| `draft` | yes | **Always `true`.** Publishing is a separate one-line PR after review. Never emit `draft: false`. |
| `updated` | no | Omit. Only used when revising an already published post. |

Do not add any other field. `cover` is read but unused; do not emit it. Do not put
`{{` anywhere in `title` or `description`.

---

## 5. What the page adds for you — so you do not

The post template wraps the body. **Do not write** any of the following into the
Markdown, they would appear twice:

- An H1. The title renders as the H1. Never use a single `#` heading in the body.
- The description as an opening line. It renders as the lede under the title.
- A byline, date, or reading time.
- A call to action. The template ends every post with "Have a rule you want tested
  this way?", a contact button, and a link to the spec template.
- A disclaimer. The template adds one specific to the post and the site footer
  adds the full one.
- "About the author". Rendered from `src/authors.js`.
- Tags. Rendered from the frontmatter.

---

## 6. Body: what the renderer supports

Plain Markdown, rendered by markdown-it with typographer on. Straight quotes
become curly, `--` becomes an en dash, `...` an ellipsis. Bare URLs become links.

### Headings

- `##` for sections. `###` for sub-sections and FAQ questions. Nothing deeper.
- Never `#` (see §5).
- Headings get automatic `id` anchors from their text.

### Code

Fenced, with the language named. Highlighted at build time; readers get a copy
button. **Only these languages are loaded:**

```
python javascript typescript bash shell json yaml sql r text diff toml csv
```

Any other language name **fails the build** with "Language `x` not found". For
C++, Rust, Pine Script, MQL, Excel formulas or anything not in the list, write
`text`. Code is exempt from the lint, but it is not exempt from the reviewer: a
comment saying `# buy here` still reads as advice. Keep comments about mechanics.

````markdown
```python
def sharpe(r, periods=252):
    return (periods ** 0.5) * r.mean() / r.std(ddof=1)
```
````

### Maths

KaTeX, rendered at build time. Inline `$\sigma_p$`, block:

```markdown
$$
\mathrm{SR} = \frac{\mu - r_f}{\sigma}
$$
```

Use maths where the source uses it or where a formula is clearer than a sentence.
Do not add maths for decoration. Maths is exempt from the lint.

### Images

```markdown
![Alt text: what the chart shows, one sentence.](./file-name.svg "Caption shown under the image. Say what the data is: illustrative, synthetic, backtested.")
```

- Relative path, `./` prefix, file in the same folder.
- File names: lowercase kebab-case, descriptive, correct extension. Rename the
  author's `Screenshot 2026-09-20 at 14.02.11.png` to `drawdown-histogram.png`.
- **Alt text always.** Describe what is shown, for a reader who cannot see it.
- **Caption (the quoted title) always.** It renders as a `<figcaption>` and is
  where the data label lives: *Illustrative. Synthetic series.* / *Backtest,
  2015–2024, costs included.* An image with no title renders bare, with no caption.
- SVG for line charts and diagrams. PNG for anything else. JPG only for photos.
  Keep each file under about 500 KB. Do not embed images as base64.
- Only include images the post actually references. Only reference images that
  exist.
- If the draft describes a chart in words but no image was supplied, **do not
  invent one** and do not reference a missing file. Write the finding as a table
  or a sentence, and flag the gap in the notes (§11).
- If an image is not the author's own work, its caption names the source.
- If **`reference_image.md` is also attached** and the author supplied no images,
  follow it. It specifies exactly one conceptual illustration, the line to place
  after the opening paragraphs, and a ready-to-paste prompt the author uses to
  generate the file. It is never a chart and never stands in for a described
  figure. This is the one case where `index.md` may reference a file that is not
  yet in the folder; the build fails, naming the file, until the author adds it.

### Tables

Standard pipe tables. They scroll sideways on phones. Use the Unicode minus
`−` (U+2212) for negative numbers, as in `−13.3%`, to match the site's report.
Right-align nothing; leave alignment default.

### Links

- External: full `https://` URL. They open in a new tab automatically.
- Internal, written **relative to the post's URL** `/blog/<slug>/`:
  - Home page: `../../`
  - Sample report: `../../#report`
  - Process: `../../#process`
  - Spec template: `../../spec-template/`
  - Another post: `../other-post-slug/`
- Never write the absolute domain into an internal link.

### Do not use

- Raw HTML. Markdown only.
- Horizontal rules (`---`) in the body. Sections are separated by headings.
- Emoji, exclamation marks, bold whole sentences, ALL CAPS.
- Footnotes (not supported).
- Nested blockquotes, task lists, definition lists.
- `{{` anywhere in prose. If a code sample genuinely needs it (Jinja, Go
  templates), it is fine inside a fenced block; the build escapes it.

---

## 7. Structure: the six-part anatomy

Every post argues **one idea**, fully. Not five ideas skimmed. If the draft
contains three ideas, pick the strongest, use it, and list the others in the
notes as candidate follow-up posts.

The shape, in this order, with these headings unless the content clearly wants
a more specific title:

| # | Section | What it does | Length |
|---|---|---|---|
| — | *(no heading)* | Two or three short paragraphs. Open with the reader's problem in terms a competent trader recognises. Not the method, not "in this post". State what the post is about in the last sentence. | 80–150 words |
| 1 | `## The problem` | What goes wrong, mechanically, and why it is worse than it looks. | 200–400 |
| 2 | `## What the test does` | Method. Code, maths, the one or two parameters that matter and how they are chosen. | 300–600 |
| 3 | `## What it shows` | The result, with the chart or table. Two or three "things to notice". | 200–400 |
| 4 | `## What it does not tell you` | Every method has a limit. State it honestly. This section is what makes the post credible. | 100–250 |
| 5 | `## How this shows up in a Taurus report` | One or two paragraphs. Which block of the sample report this method feeds, what the report states, and one check a reader can run on a report they already have. **Never a market view.** | 100–200 |
| 6 | `## FAQ` | Three to five `###` questions a reader would actually type into a search engine, each answered in one or two paragraphs. **Must be the last `##` section.** | 250–500 |

Total: **1,200 to 2,500 words** of prose. The build warns below 300. If the draft
is much longer than 2,500 words, cut repetition and asides first, then move
secondary points to the FAQ, then trim examples. Do not cut the limits section.

### 7.1 Facts about Taurus you may state in section 5

Only reference things that exist. The sample report on the home page contains,
in page order:

- headline metrics (CAGR, Sharpe, max drawdown, win rate, profit factor and so on)
- risk and distribution KPIs
- equity curve and underwater (drawdown) curve
- in-sample versus out-of-sample comparison
- **Monte Carlo** — moving-block bootstrap, blocks of 25 trades, 1,000 paths
- monthly returns heatmap and a yearly table
- trade distribution
- **regime analysis** — k-means (k = 3) over 20-session realised volatility
- parameter sensitivity
- **robustness diagnostics** — Probabilistic Sharpe Ratio, Deflated Sharpe
  Ratio (deflated against the number of configurations tried), and Probability
  of Backtest Overfitting via combinatorially symmetric cross-validation
- assumptions (costs, slippage, fill model, data source)
- a plain-English read of the whole thing

All figures in a report are computed from one trade series, so no two numbers
on the page can disagree. Every engagement starts with a written specification
(the spec template at `../../spec-template/`), scope is agreed in writing first,
and a report comes back on a deadline.

The six services: backtesting, optimisation, signal visualisation, algo
deployment, trading-idea refinement, model evaluation (auditing a model the
client already trained for leakage, look-ahead, cross-validation rigour and
decay).

Do **not** state prices, turnaround times, team size, names, credentials,
client names, or results for real clients. Do not say "our clients have found
that…". Do not describe capabilities that are not in the list above.

### 7.2 FAQ rules

- Heading exactly `## FAQ` (or `## Frequently asked questions`).
- Each question is a `###` heading ending in `?`. Phrase as the reader would
  search: "Does block length have to match the holding period?" not "Block
  length considerations".
- Each answer is one or two paragraphs. A question with no answer is dropped.
- No code, images or tables in the FAQ; plain prose and inline maths only. The
  answers are also emitted as FAQ structured data, which is plain text.
- Three to five items. Not two, not eight.

---

## 8. Voice

Read the worked example in §9 before writing; it is the reference. In brief:

- **British spelling**, matching the existing posts: optimisation, realised,
  recognise, favourable, behaviour, modelling.
- Write to someone who knows what a Sharpe ratio is. Do not define drawdown,
  Sharpe, out-of-sample, overfitting, slippage. Do define a method the reader
  may not have met (block bootstrap, CSCV, purged CV) in one sentence, then use it.
- Short paragraphs, two to four sentences. One idea per paragraph.
- Concrete over abstract. A number with a label beats an adjective. "The tail
  moves by six points" beats "the tail moves significantly".
- Confident, plain, a little dry. No hype, no hedging padding ("it is worth
  noting that"), no rhetorical questions in a row, no "in this post we will".
- Italics for the one phrase in a paragraph that carries the point. Bold almost
  never. Never a whole bold sentence.
- Sentences that describe what a report *states* or *shows*, not what a reader
  should *do* with their money.
- End section 5 with a check the reader can run, not with a pitch. The template
  supplies the pitch.
- Where the site is named in prose, write "Taurus" (as in "a Taurus report").
  Once or twice per post, not in every section.

---

## 9. Worked example — the seed post, complete

This is `content/blog/why-we-resample-blocks-of-trades/index.md` exactly as it
ships, with `drawdown-distribution.svg` beside it. Match its density, register,
paragraph length, and the way every number is labelled.

`````markdown
---
title: Why we resample blocks of trades, not single trades
description: Monte Carlo on a trade list flatters the tail if you shuffle trades one at a time. Losses cluster. The resampling has to keep the clusters.
date: 2026-09-13
author: taurus
tags: [monte-carlo, backtesting, drawdown, robustness]
draft: false
---

A Monte Carlo section is standard in a backtest report. Take the list of trades, resample
it a thousand times, look at the spread of outcomes. It answers a question the equity
curve alone cannot: *how much of this result is the particular order the trades happened
to arrive in?*

Most implementations answer it wrong, and wrong in the flattering direction. They shuffle
trades one at a time. This post is about why that understates drawdown, what we do
instead, and how to tell which one a report used.

## The problem

Real trade sequences are not independent draws. A trend strategy loses in chop, and chop
lasts weeks. A mean-reversion strategy loses when a range breaks, and the break is
followed by more breaks. Whatever the rule, its losses arrive in runs, because the market
state that causes them persists.

That clustering is *the* thing that produces a deep drawdown. Twenty losing trades spread
evenly through a year cost you twenty small dips. The same twenty trades in a row cost
you a drawdown that gets the strategy switched off.

Resampling single trades destroys the clustering. Each draw is independent of the last, so
the resampled paths have losses scattered uniformly through time. Every path looks
smoother than the real one. The distribution of maximum drawdown shifts toward zero, the
"worst 5% of paths" line moves to a comfortable place, and the report says the strategy
survives scenarios it would not survive.

## What the test does

A moving-block bootstrap resamples *runs* of consecutive trades instead of individual
trades. Pick a random start point, take the next $b$ trades in their original order,
append them, repeat until the path is as long as the original. Within each block the
sequence is preserved, so the clusters survive. Between blocks the order is random, so
you still get a distribution rather than one path.

```python
import numpy as np

def block_bootstrap(trades: np.ndarray, block: int = 25, paths: int = 1000, seed: int = 7):
    """Moving-block bootstrap over a 1-D array of per-trade returns."""
    rng = np.random.default_rng(seed)
    n = len(trades)
    starts = rng.integers(0, n - block, size=(paths, int(np.ceil(n / block))))
    idx = (starts[:, :, None] + np.arange(block)[None, None, :]).reshape(paths, -1)[:, :n]
    return trades[idx]                      # shape: (paths, n)

def max_drawdown(path_returns: np.ndarray) -> np.ndarray:
    """Vectorised max drawdown for each row of a (paths, n) return matrix."""
    equity = np.cumprod(1.0 + path_returns, axis=1)
    peak = np.maximum.accumulate(equity, axis=1)
    return (equity / peak - 1.0).min(axis=1)

paths = block_bootstrap(trade_returns, block=25, paths=1000)
dd = max_drawdown(paths)
print(f"median max DD {np.median(dd):.1%}, worst 5% {np.quantile(dd, 0.05):.1%}")
```

The one parameter that matters is the block length $b$. Too short and you are back to
shuffling single trades. Too long and every path is a rearrangement of a handful of
chunks of the real history, which is barely a distribution. A reasonable default is a
block that spans the typical losing streak with room to spare. For most daily and
intraday rules we start at 25 trades and check the result is not sensitive to moving it
to 15 or 40. If it is sensitive, that itself goes in the report.

There is a formal answer too. For a series with autocorrelation that decays
geometrically, the block length that minimises the bootstrap's mean squared error scales
with the sample size:

$$
b^{*} \propto n^{1/3}
$$

In practice the constant in front depends on the strength of the dependence, which you do
not know precisely, so the rule above is what gets used and the formula is what tells you
the order of magnitude is right.

## What it shows

Below is the same synthetic 600-trade series resampled both ways, 2,000 paths each. The
series was generated with a hidden regime that flips between favourable and unfavourable,
so losses cluster the way they do in a real strategy. Its actual maximum drawdown is
−13.3%.

![Two histograms of maximum drawdown. The i.i.d. distribution sits closer to zero; the block distribution is shifted left with a longer tail.](./drawdown-distribution.svg "Illustrative. Synthetic trade series with regime clustering, 2,000 resampled paths per method.")

| Method | Median max drawdown | Worst 5% of paths |
|---|---|---|
| i.i.d. (single trades) | −11.0% | −20.3% |
| Moving block, 25 trades | −14.3% | −26.3% |
| Actual series | −13.3% | — |

Two things to notice. The i.i.d. median is *shallower than the real drawdown*. A method
whose typical scenario is better than what already happened is not stress-testing
anything. And the tail moves by six points. If the sizing rule was "I can tolerate a 20%
drawdown", the i.i.d. version says the strategy fits and the block version says one path
in twenty does not.

On the sample report on our home page the same choice moved the worst-5% line from −22%
to −26% and turned "100% of paths finish above their starting equity" into 99.6%. Neither
number is dramatic on its own. The point is that the honest one is the one you fund
against.

## What it does not tell you

A block bootstrap resamples the trades you have. It cannot invent a regime the strategy
never traded through. If the backtest window has no 2008, no 2020, no rate shock, no path
will contain one. The distribution is a statement about *reordering history*, not about
the future, and it should be read next to the regime analysis rather than instead of it.

It also inherits every flaw in the trade list. Look-ahead in the entry rule, optimistic
fills, missing costs: all of it is resampled faithfully. Monte Carlo is a test of
sequence risk. It is not a test of whether the backtest was honest to begin with.

## How this shows up in a Taurus report

The Monte Carlo block in every report we produce uses a moving-block bootstrap, states
the block length, and shows the sensitivity of the worst-5% drawdown to that length. It
sits between the in-sample versus out-of-sample comparison and the monthly heatmap, and
its numbers are computed from the same trade series as every other figure on the page,
so they cannot disagree with the equity curve above them.

If a report you already have shows a Monte Carlo section, the quickest check is to
compare its median drawdown with the strategy's actual drawdown. If the median is
shallower than what really happened, trades were shuffled one at a time.

## FAQ

### Why not just use a longer backtest instead of a bootstrap?

A longer backtest is better evidence, and you should use all the history you have. But
it still gives you one path. The bootstrap tells you how different that path could have
looked with the same trades in a different order, which is a separate question from how
the strategy did over more time.

### Does block length have to match the strategy's holding period?

No. It has to be longer than the typical losing streak in trades, not in time. A scalping
rule with hundred-trade losing runs needs a longer block than a swing rule with five-trade
runs, even though the scalper's block covers less calendar time.

### What about a stationary bootstrap with random block lengths?

It works too, and it removes the hard edge at block boundaries. The results are close to
the fixed-block version for most trade series we see. We use fixed blocks because the
block length is then a single number a reader can check, and a report is easier to
challenge when its parameters are visible.

### Is resampling daily returns better than resampling trades?

It depends on what the strategy is. For an always-in-market rule, daily returns are the
natural unit. For a rule that is flat most of the time, resampling days mixes flat days
into the blocks and dilutes the clustering. We resample whichever unit the strategy's
losses actually cluster in, and say which in the report.
`````

Note that the example ships with `draft: false` because it is already published.
**Your output always says `draft: true`.**

---

## 10. Converting the draft: what to keep, change, and never add

**Keep**

- Every argument, finding, number, table, code sample and formula in the source.
  The author's substance is the post; you are changing its shape and register.
- The author's terminology where it is standard.
- The author's images, with better file names, alt text and captions.

**Change**

- Structure: reorganise into the §7 anatomy. Merge and split sections freely.
- Register: rewrite into the §8 voice. Cut hedges, hype, filler, throat-clearing.
- Spelling to British. Numbers to labelled numbers. Negatives to `−`.
- Anything that fails §2: rewrite as a statement about what a test showed. If a
  sentence cannot be rewritten that way, delete it and flag it.
- A draft with no "What it does not tell you" section: write one from the
  standard, well-known limitations of the method described. This is
  methodological knowledge, not a new claim, and is permitted. Flag that you
  added it.
- A draft with no FAQ: write three to five from questions the body raises but
  does not fully answer, using only material in the body. Flag that you added it.
- A draft with no "How this shows up in a Taurus report": write it from §7.1.
  Flag that you added it.

**Never add**

- A number, statistic, date, result, or comparison that is not in the source.
- A citation, paper, author, or URL that is not in the source. If the source
  mentions a paper without a reference, name it as the source does, no link.
- A chart that was not supplied. See §6, Images.
- A claim about Taurus not in §7.1.
- A market view, an instrument recommendation, a forecast, a price.
- Filler to reach the word count. A tight 1,200 words beats a padded 2,000.

**If the source is not about strategy testing at all** (a market commentary, a
trade idea, a product review), do not convert it. Deliver a short note explaining
that the piece cannot be published under the positioning rule and, if there is a
testable method buried in it, suggest the post that could be written about that
method instead.

---

## 11. Delivery format

### 11.1 Preferred: files

A zip named `<slug>.zip` that unpacks to the folder in §1. No `__MACOSX`, no
`.DS_Store`, no nested extra directory, no files other than `index.md` and the
referenced images.

### 11.2 Fallback: text

If you cannot produce files, output in this order:

1. The folder listing.
2. `index.md` in full, in a single fenced block opened and closed with **four**
   backticks (so the triple-backtick code fences inside survive).
3. A file map for images, so the author can rename their originals:

   ```
   Rename:  Screenshot 2026-09-20 at 14.02.11.png  →  drawdown-histogram.png
   Rename:  fig2.svg                                →  block-length-sensitivity.svg
   ```

### 11.3 Notes to the author (always, outside the folder)

After the deliverable, a short block headed **Notes**, at most ten lines, listing
only things the author must act on or know:

- Sentences removed or rewritten for the positioning rule, quoted, with the
  reason.
- Sections you added that were not in the source (limits, FAQ, Taurus section).
- Images described in the source but not supplied.
- If an illustration was specified under `reference_image.md`: its filename, and
  that the build fails until the author generates it and saves it into the folder.
- Ideas from the source that were cut and could be their own post.
- If an author key other than `taurus` was requested and you have no way to
  confirm it exists, say so, and include this ready-to-paste block for
  `src/authors.js`:

  ```js
  <key>: {
    name: 'Full Name',
    role: 'One line, e.g. Quantitative developer',
    bio: 'One or two sentences. What you work on, not a CV.',
    url: '',
  },
  ```

- If today's date could not be determined, say which date you used.

If there is nothing to note, write **Notes: none.**

---

## 12. Before you deliver: the self-check

Run every line. Fix, do not report, anything that fails.

**Frontmatter**
- [ ] `title`, `description`, `date`, `author`, `tags`, `draft` all present. Nothing else.
- [ ] `title` and `description` double-quoted; inner quotes escaped.
- [ ] `description` under 160 characters and not a restatement of the title.
- [ ] `date` is `YYYY-MM-DD`.
- [ ] `author` is `taurus` or the key the author supplied.
- [ ] `tags` is a flow list of two to five lowercase kebab-case items.
- [ ] `draft: true`.

**Folder**
- [ ] Folder name matches `^[a-z0-9]+(?:-[a-z0-9]+)*$`, under 60 characters, not `why-we-resample-blocks-of-trades`.
- [ ] Exactly one Markdown file, named `index.md`.
- [ ] Every image referenced in `index.md` exists in the folder; every file in the folder is referenced. Sole exception: an illustration specified under `reference_image.md`, which the author generates afterwards and which is named in the Image to generate section and in the Notes.
- [ ] Image file names are lowercase kebab-case with a correct extension.

**Body**
- [ ] No `#` heading. Sections are `##`, sub-sections and FAQ questions `###`.
- [ ] Opening paragraphs have no heading; the six sections follow in order; `## FAQ` is last.
- [ ] Every image has alt text and a quoted caption that labels the data.
- [ ] Every table and figure has a data label (backtested / simulated / synthetic / illustrative) in its caption or the sentence before it.
- [ ] Every code fence names a language from the §6 list, or `text`.
- [ ] No raw HTML, no horizontal rules, no emoji, no `{{` in prose.
- [ ] Internal links are relative (`../../`, `../../#report`, `../../spec-template/`).
- [ ] Prose word count between 1,200 and 2,500.
- [ ] FAQ has three to five `###` questions, each ending `?`, each with an answer.

**Positioning**
- [ ] Every hard regex in §2.1 run against the prose (not code, not maths): zero matches.
- [ ] Every soft regex in §2.1: zero matches, or the match is a strict statistical term in a sentence about a test.
- [ ] No market view, no instrument recommendation, no forecast, no price or cost, no "free".
- [ ] No claim about Taurus outside §7.1. No client names, results, prices, turnaround, credentials.
- [ ] Nothing added that is not in the source, except the three permitted sections, and each is flagged in the notes.
- [ ] Section 5 ends with a check the reader can run, not a pitch.

---

## 13. For the human: what happens after you paste the folder

1. Drop the folder into `content/blog/`. Check nothing else came along (no
   `__MACOSX`, no `.DS_Store`).
2. If you have the repo locally: `npm run blog:check`. It prints the post with
   its word count, or names the exact line that fails.
3. Branch: `git checkout -b post/<slug>`. Commit the folder. Push.
   Or on GitHub.com: *Add file → Upload files* into `content/blog/<slug>/` on a
   new branch.
4. Open a pull request against `main`. Fill in the checklist in the template.
   Paste the AI's **Notes** block into the PR description so the reviewer sees
   what was changed or added.
5. The *Check pull request* action builds the site. Green means it builds. Red
   names the file and the phrase.
6. The compliance reviewer reads it in full and approves. Merge. The post is now
   live at its URL but unlisted and unindexed. Share the link for feedback.
7. To publish: a one-line PR changing `draft: true` to `draft: false`. Same
   review, same merge. It is on the index, in the sitemap and in the RSS feed
   within a couple of minutes.

The full author guide is `CONTRIBUTING.md`. The build rules this file describes
live in `scripts/build-blog.mjs`; if the two ever disagree, the script is right
and this file needs updating.

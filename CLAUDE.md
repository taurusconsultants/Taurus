# CLAUDE.md — Taurus

Persistent project context for Claude Code. Read this first in every session.
This file is the source of truth for project state, decisions, and constraints.

> **Brand name is NOT final.** It is currently "Taurus" (renamed from the working name
> "Quant Monk" on 2026-09-08) and must remain a configurable token, never hardcoded.
> See [Brand Tokenization](#brand-tokenization).
>
> Note: the repo directory is still named `Quant Monk/`. Directory name ≠ brand.

---

## Current Status

**Last updated:** 2026-09-13

**Phase:** Site is **live at taurusconsultancy.com, served by GitHub Pages** (discovered
2026-09-13 — DNS already pointed there; Hostinger was never used). Blog pipeline built.
Blockers before any paid traffic: untested lead form, no analytics.

> ⚠ Until the changes of 2026-09-13 are pushed, the live site is still being built with
> `NOINDEX=1` and carries a `noindex, nofollow` tag on every page. The fix is in
> `.github/workflows/deploy.yml`; it takes effect on the next push to `main`.

### Done
- [x] Business model, positioning, and legal constraints defined
- [x] Target audience defined
- [x] Design direction defined
- [x] `CLAUDE.md` created as persistent context file
- [x] Hosting target decided — Hostinger shared hosting
- [x] Build tooling decided — Vite, static output, upload `dist/`
- [x] Motion approach decided — hybrid: one WebGL hero + GSAP/CSS below
- [x] Lead capture decided — WhatsApp + 3-field form
- [x] Form backend defaulted — Web3Forms (swappable)
- [x] Pricing stance decided — page stays silent on price
- [x] Market scope decided — any tradable instrument with data availability
- [x] Site built — Vite scaffold, WebGL hero, full sample report, form, disclaimer
- [x] GitHub Pages preview pipeline (Actions, noindex, `.nojekyll`)

- [x] Real contact details wired — WhatsApp number and email are live in
      `src/config.js` (`brand.whatsappNumber`, `brand.whatsappDisplay`, `brand.email`)
- [x] Web3Forms access key configured — the lead form now actually sends
- [x] Brand mark designed (Taurus glyph) + PNG/JPG exports in `brand/`

- [x] **Domain registered — `taurusconsultancy.com`.** `brand.url` / `brand.domain`
      now point at it. (Earlier drafts of this file said `taurusconsultants.com`;
      that was never registered and was wrong.)
- [x] **Invented legal entity removed.** The footer no longer claims an LLC or a
      jurisdiction. `brand.legalEntity` and `brand.jurisdiction` are gone from config.
- [x] **Audience broadened to retail *and* enterprise** — individual traders,
      systematic traders / small funds, and desks / prop firms / fund teams.
- [x] **Page restructured pain-first** — hero mirrors the prospect's problem instead
      of stating our capability; the sample report moved earlier in the scroll.
- [x] **Report deepened** — risk & distribution KPIs, Monte Carlo, robustness
      diagnostics (PSR / DSR / PBO-CSCV), regime analysis. See [Sample Report](#sample-report).
- [x] **SEO infrastructure** — sitemap, robots, JSON-LD, OG image, manifest, icons,
      404. See [SEO Infrastructure](#seo-infrastructure).
- [x] **Cost objection handled** without stating a price (FAQ item 01).
- [x] **Lead magnet shipped** — `/spec-template/`, ungated. See [Lead Magnet](#lead-magnet).
- [x] Response-time promise tokenised as `brand.responseTime` ("within 24 hours").

- [x] **Blog pipeline built (2026-09-13)** — Markdown in `content/blog/`, rendered at
      build time; PR-based publishing for five authors; wording lint; drafts; RSS;
      per-post structured data; CONTRIBUTING.md. See [Blog](#blog). One seed post live.
- [x] **Production deploy = GitHub Pages on push to `main`.** `NOINDEX=1` removed from
      the deploy workflow. PR check workflow added (`.github/workflows/check.yml`).

### Pending
- [ ] **Push the 2026-09-13 changes** so the live site stops being noindexed and the
      blog goes live. Then: Settings → Branches → protect `main` (require a PR + 1
      approval), add the four other authors as collaborators, name the compliance
      reviewer here.
- [ ] **Authors' real names** — `src/authors.js` has only the `taurus` team byline.
      Each author adds themselves in the PR that carries their first post.
- [ ] **Test the lead form end to end** — submit it once and confirm the email arrives.
      Still the single biggest launch blocker: untested + no analytics means we could
      lose every form lead and never know.
- [ ] **Analytics + ad conversion tracking** — `analytics` in `src/config.js` is still
      empty. The event wiring already exists (`src/main.js`, `src/js/form.js`,
      `src/spec.js`); it is dormant only because the IDs are blank.
- [ ] **Move email off Gmail** to `hello@taurusconsultancy.com` once mail is set up.
      A gmail.com address next to a premium page is a live credibility cost.
- [ ] Replace the dummy sample report with authentic, client-authorised results.
- [ ] **People / founder proof** — deliberately deferred by the user (2026-09-12).
      Still the largest remaining trust gap: the page has no named human on it. Blog
      bylines (`src/authors.js`) are the agreed first step.
- [ ] **Blog content** — pipeline exists; the writing is the work now. Competitor's only
      real moat is ~30k words; see [Competitive Position](#competitive-position).
      Phase 3 items when a post needs them: per-post OG image, tag/author pages.

### Open Questions (need user input)
- **Real sample report** — user will supply later. Full-depth dummy in place until then.
- **Whether to ever name a legal entity.** Removed rather than invented. If one is
  registered later it goes back in the footer; until then the page claims nothing.

---

## Project Overview

### Product
A landing page + lead-generation funnel for a quant trading services startup.

### Business model
We provide **fully personalized, human-delivered quant trading services** to traders:
- Backtesting
- Optimization
- Signal visualization
- Algo deployment
- Trading idea refinement
- Model evaluation (validating a client-trained model: leakage, CV rigour, decay)

**The client supplies the trading idea/rules.** We refine and stress-test what they
specify. We do **not** originate strategies and we do **not** give investment advice.
We only test and report on strategies the client defines.

### Funnel
```
Host landing page (Hostinger)
  → run paid ads
    → visitor lands on page
      → page builds enough trust + clarity that they contact us
        → WhatsApp message or form submission
          → we reach out manually
            → manual, end-to-end delivery, scoped per engagement, delivered by a deadline
```

### Deliverable
A full backtesting report with standard KPIs **plus custom KPIs on request**.

### Current business phase
Fully custom / white-glove delivery, to validate demand.
**Deliberately not scalable yet.** Automation and self-serve tooling come later, only
after this phase succeeds. The advanced/custom service tier remains available to
premium clients even after automation exists.

### Billing — current stance
**No billing at present.** Early engagements are delivered free to validate demand and
build a client base. Pricing is introduced later, once the model is proven.

**The page must not mention price at all** — not the free part, not future rates. Scope
and cost are discussed in conversation after contact. Rationale: stating "free" would
attract tire-kickers without serious strategies and anchor future paid value lower.

### Legal / positioning constraint — HARD RULE
Page copy must **never** imply investment advice or trade recommendations.
Only strategy **testing** and **reporting**.

Any copy Claude writes for this project must pass this check before it ships. When in
doubt, phrase it as testing/reporting on a client-specified strategy — never as a
suggestion about what to trade.

---

## Target Audience

Anyone who trades **a rule they can write down** and wants it properly tested,
optimized, or deployed, but lacks the tooling or the time to do it rigorously.

Three segments, served by the same process at different scope and reporting depth
(the page states this explicitly in the "Who this is for" section):

| Segment | What they arrive with | What they want |
|---|---|---|
| **Individual traders** | A setup that works on the chart, and a suspicion it won't survive costs | An honest answer before they fund it |
| **Systematic traders & small funds** | Running automated strategies already | More research throughput than one person can produce |
| **Desks, prop firms & fund teams** | Infrastructure and people, no spare cycles | Scoped validation / overflow research capacity |

> Supersedes the original "individual traders only" framing, broadened 2026-09-12.
> Retail remains the majority of expected enquiries; enterprise is served, not chased.

**Client geography:** majority **US**, with global reach.

**Market scope:** we test strategies for **anything tradable with available data.**
This is deliberately broad and should be stated as such on the page — instrument
coverage is a function of data availability, not of a fixed supported-markets list.

Common examples to cite concretely (illustrative, not limiting):
- US equity options
- NIFTY futures and options

> Supersedes the original brief's narrower "Indian markets + US equity options" framing.
> Retained here as historical context: the initial positioning was those two markets
> specifically, broadened on 2026-09-07.

Implication for copy: this reader is not a beginner. They know what a Sharpe ratio and
a drawdown curve are. Do not over-explain fundamentals; do demonstrate rigor.

---

## Design Direction

- **Tone:** Premium, credible, confident. **Not** a generic SaaS template.
- **Visual language:** Bold typography, confident scroll-based motion, strong visual identity.
- **Reference:** [activetheory.net/work](https://activetheory.net/work) — for *tone and
  craft*, not literal execution.

### Critical counterweight to that reference
This is a **conversion-focused lead-gen page for a financial service**, not an agency
portfolio. Therefore:
- It must **load fast** — paid ad traffic bounces on slow first paint, which burns budget.
- It must communicate **what we do / why trust us / how to start** within the first
  scroll, with zero ambiguity.
- Motion serves comprehension and credibility. Motion that delays the message is a bug.

### Required page elements
1. A **full-depth sample backtesting report** — not a teaser, not a screenshot crop. A
   prospect should be able to judge our output quality from the page alone.
   *Currently a dummy/placeholder with realistic structure; real report supplied later.*
2. An **explicit disclaimer**: we test and report on client-specified strategies; we do
   not provide investment advice or recommend trades.

---

## Tech Stack

| Concern | Choice | Notes |
|---|---|---|
| Build tooling | **Vite** | Static output; `dist/` built and deployed by GitHub Actions |
| Hosting | **GitHub Pages** (custom domain) | Was planned as Hostinger; DNS was pointed at Pages instead. See [Deployment](#deployment) |
| Blog | **Markdown → HTML at build time** | `content/blog/`, rendered by `scripts/build-blog.mjs`. See [Blog](#blog) |
| Motion | **Hybrid: one WebGL hero + GSAP/CSS below** | ~250KB budget; static fallback required |
| Styling | TBD | Decide at scaffold time |
| Lead capture | **WhatsApp deep link + 3-field form** | See below |
| Form backend | **Web3Forms** | Default choice; swappable endpoint |
| Analytics | TBD | Must support ad conversion tracking |

### Hosting constraints (Hostinger shared)
- **No Node runtime, no server-side rendering.** Output must be plain static assets.
- Build locally, upload `dist/`.
- Use **relative asset paths** — set Vite `base: './'` so the build works regardless of
  subdirectory placement.
- Avoid anything requiring a Node server, edge functions, or serverless routes.
- Client-side WebGL is fine — it runs in the visitor's browser, not on the host.

### Motion budget
- **Hero:** a single lightweight WebGL/canvas moment. Highest visual impact per byte.
- **Below the fold:** GSAP + CSS scroll motion — reveals, parallax, animated counters,
  chart draw-ins.
- **Hard requirements:**
  - Static fallback for mobile, low-power devices, and WebGL-unsupported browsers.
  - Respect `prefers-reduced-motion`.
  - Hero must never block first paint or the headline's readability.

### Lead capture
Two parallel paths, both prominent:
1. **WhatsApp** — deep link with a prefilled message.
2. **Form** — exactly three fields:
   - Email — *required only if no phone given*
   - Contact number — *required only if no email given*
   - What they're seeking from us (free text) — **always required**

Keep the form to these three fields. Every extra field costs conversions.

**Contact rule: email OR phone, at least one — never both mandatory.** Neither input
carries an HTML `required` attribute; the rule lives in `validate()` in
`src/js/form.js`, with the message shown in the shared `[data-err="contact"]` slot.
Format is checked per field *only when that field is filled in*. A prospect willing to
share one channel but not the other is still a real lead — demanding both loses them.

The submit payload omits an empty field entirely rather than sending `''`: Web3Forms
treats `email` as reply-to and rejects a blank one, so a phone-only enquiry would fail
if the key were sent empty. A "Reply via" line is added so the notification email shows
at a glance which channel the lead actually left.

---

## Deployment

**Production is GitHub Pages. Merging to `main` is deploying.**

| What | How |
|---|---|
| Repo | `github.com/taurusconsultants/Taurus`, public, default branch `main` |
| Domain | `taurusconsultancy.com` → GitHub Pages IPs; `www` CNAME → `taurusconsultants.github.io`. Custom domain is set in Settings → Pages (no `CNAME` file in `public/`). |
| Deploy | `.github/workflows/deploy.yml` — on push to `main`: `npm ci`, `npm run build`, upload `dist/`, deploy. Live in ~2 minutes. |
| PR check | `.github/workflows/check.yml` — on pull request: full build (validates every post), attaches `dist/` as a downloadable artifact. Never deploys. |
| Hostinger | **Not used.** Was the plan; DNS went to Pages instead (2026-09-13). Only relevant if mail is hosted there. |

### Why `base: './'` must not change

`vite.config.js` sets `base: './'`, emitting **relative** asset paths. That is what lets
the same build work at the domain root, a github.io project subpath, or a local
`file://` preview. Do not change it to `/<repo-name>/` — it would pin the build to one
path and break the custom-domain deploy.

### The noindex flag — history and current rule

`npm run build:preview` sets `NOINDEX=1`, which injects `<meta name="robots"
content="noindex, nofollow">` on every page and emits a `Disallow: /` robots.txt.
It exists for throwaway previews only.

**It was set on the Pages deploy job while Pages was preview-only, and stayed set after
the real domain was pointed at Pages — so production shipped noindexed.** Found and
removed 2026-09-13. The deploy workflow must never set `NOINDEX`. Unpublished blog
posts are handled per page instead (`draft: true`), not with a site-wide flag.

### Files that are generated, not committed

`robots.txt`, `sitemap.xml` and `site.webmanifest` are **not in the repo** — they are
emitted by the `brandTokens()` plugin during the build. Don't go looking for them in
source, and don't add committed copies: they have to differ between the two targets
(production invites crawlers, the Pages preview turns them away) and a committed file
cannot do that. `dist/` is the only place they exist.

`public/` *is* committed, and holds what genuinely is static: `og.png`, the PWA icons,
`apple-touch-icon.png`, `404.html`, `.nojekyll`. Regenerate the images with
`node scripts/make-images.mjs` after any change to the brand mark or the hero headline.

### GitHub Pages setup

- Workflow: `.github/workflows/deploy.yml` — builds on push to `main`, deploys the
  artifact. No `dist/` is ever committed (`.gitignore` excludes it).
- **One-time repo setting:** Settings → Pages → Source → **GitHub Actions**.
- `public/.nojekyll` stops GitHub's Jekyll layer processing the output; the workflow
  also `touch`es it as a fallback.

### Canonical URLs

`brand.url` is `https://taurusconsultancy.com` (real, registered, live). Canonical, OG,
sitemap, RSS and structured-data URLs are all derived from it. Superseded note: earlier
drafts of this file carried the placeholder `taurusconsultants.com`.

---

## Brand Tokenization

**The brand name is not final.** Never hardcode it.

- Define brand strings in a **single config file** (name, tagline, WhatsApp number,
  email, domain, response time).
- `brand.legalEntity` and `brand.jurisdiction` were **removed on 2026-09-12** — they
  held values Claude invented. If a real entity is ever registered, add them back to
  `src/config.js` and to the `tokens` map in `vite.config.js`, then put
  `{{brand.legalEntity}}` back in the footer's `.footer-bottom`.
- Reference the token everywhere — markup, `<title>`, OG tags, footer, form copy.
- Changing the brand must be a **one-file edit**, then rebuild.
- This applies to the logo/wordmark treatment too: keep it swappable, don't bake the
  name into an image that can't be regenerated.

Current value: `Taurus` (was `Quant Monk` until 2026-09-08).

### Brand mark

The symbol is a **Taurus glyph — horns above, ring below**, defined as an SVG path
string in `src/config.js` (`brand.markSvg` + `brand.markViewBox`).

- It is **stroke-based, not filled**, so it stays crisp from 16px favicon to any size.
- It is drawn in `currentColor`, so CSS owns the colour (accent lime on dark; it also
  inverts cleanly onto light backgrounds).
- **One definition feeds three places** — header, footer, and the favicon data URI —
  all substituted at build time by the `brandTokens()` plugin in `vite.config.js`
  (`{{brand.mark}}` and `{{brand.faviconDataUri}}`).
- To change the symbol: replace the paths in `brand.markSvg` and rebuild. Nothing else
  needs touching. Do **not** add a separate favicon file — it would drift from the mark.

---

## Architecture

```
index.html                  Landing page — all copy lives in the markup, with
                            {{brand.*}} tokens substituted at build time
spec-template/index.html    Lead magnet page (see below)
content/blog/<slug>/        BLOG SOURCE — index.md + images, one folder per post
blog/                       GENERATED from content/blog/ on every build; gitignored
public/                     Copied verbatim to dist/: og.png, icon-*.png,
                            apple-touch-icon.png, 404.html, .nojekyll
scripts/make-images.mjs     Regenerates the raster brand images from config
scripts/build-blog.mjs      Markdown → HTML: frontmatter validation, wording lint,
                            Shiki highlighting, KaTeX, FAQ split, reading time
scripts/new-post.mjs        `npm run new-post -- "Title"` scaffolds a draft
CONTRIBUTING.md             The authors' end-to-end guide. Keep it in step with
                            build-blog.mjs — it is what non-developers read.
src/
  config.js                 SINGLE SOURCE OF TRUTH for brand, form, analytics,
                            motion and report flags
  authors.js                Blog bylines, keyed; a post's `author:` must match
  templates/post.html       Post layout ({{post.*}} filled by the generator,
  templates/blog-index.html {{brand.*}} left for the Vite plugin)
  main.js                   Landing-page entry (report → hero → motion → form)
  spec.js                   Spec-template entry — CSS + clipboard/print only,
                            deliberately does NOT pull in GSAP/Lenis/WebGL
  blog.js                   Blog entry — CSS + KaTeX CSS + copy-code button only
  js/hero.js                WebGL hero shader, with static CSS fallback
  js/motion.js              GSAP ScrollTrigger reveals, counters, Lenis
  js/form.js                Lead form; `validate()` exported for unit testing
  js/report.js              Hand-rolled inline-SVG report renderer, no chart lib
  data/report-data.js       Seeded synthetic dataset + all analytics maths
  styles/main.css           One stylesheet, design tokens at the top
vite.config.js              ASYNC config: runs build-blog first, then token
                            substitution, build guards, structured data,
                            robots.txt / sitemap.xml / site.webmanifest / RSS
                            emission, multi-page entry points (STATIC_PAGES + posts)
```

**Adding a static page** means adding one row to `STATIC_PAGES` in `vite.config.js`.
**Adding a blog post** means adding a folder under `content/blog/`. Together they
drive the Rollup entry points, `sitemap.xml`, and the per-page canonical URL — if they
were maintained separately they would drift and we'd sitemap a 404.

### Blog

Five people write for it. The pipeline is designed so none of them needs the build
system; the full author-facing process is in `CONTRIBUTING.md` and is not repeated
here. What Claude needs to know:

- **Source** is `content/blog/<slug>/index.md` with YAML frontmatter (`title`,
  `description`, `date`, `author`, `tags`, optional `draft`, `updated`). The folder
  name is the URL. Images sit beside the file and are referenced relatively; Vite
  hashes them into `assets/`.
- **`vite.config.js` is async** and calls `buildBlog()` first. It renders every post
  into `blog/<slug>/index.html` (plus `blog/index.html`) using `src/templates/`, then
  hands the post manifest back so posts become entry points, sitemap rows, RSS items
  and BlogPosting / BreadcrumbList / FAQPage structured data. In dev, a watcher
  regenerates on any change under `content/blog/` or `src/templates/`.
- **The build fails** on: missing frontmatter field, unknown author key, invalid slug,
  or a **hard wording violation** (`HARD_PATTERNS` in `scripts/build-blog.mjs`:
  guaranteed returns, "you should buy", price targets, etc.). Soft patterns warn.
  Code blocks and maths are stripped before linting. This is the machine half of the
  positioning rule; the human half is the required PR review.
- **Drafts** (`draft: true`) build and get a URL, but: page carries `noindex`, no
  sitemap row, no feed item, no listing card, no structured data. Flipping the flag is
  what publishes. There is no separate preview site any more.
- **FAQ**: a trailing `## FAQ` with `###` questions is split out, rendered as
  `<details class="faq-item">` (same styling as the landing page) and emitted as
  FAQPage schema from the same list.
- **Body `{{` is escaped** to `&#123;&#123;` so Jinja/Go-template snippets in code can't
  be mistaken for brand tokens by the Vite plugin.
- **Charts are images** (decided 2026-09-13). No chart DSL; authors export SVG/PNG.
- **Maths** is KaTeX rendered at build time; `src/blog.js` imports the KaTeX CSS so
  the fonts are bundled. No maths JS is shipped.
- **Highlighting** is Shiki at build time, theme `github-dark-default`, background
  overridden to `var(--surface)` in CSS. Language list is in `getMarkdown()`; add one
  there if a post needs it.
- **`npm run blog:check`** validates every post without building the site.

### Sample Report

`src/data/report-data.js` generates everything from one seed and **computes** every
KPI from the generated trade series, so no two figures in the report can disagree.

Blocks, in page order: headline metrics · risk & distribution · equity curve ·
underwater curve · IS/OOS · **Monte Carlo** · monthly heatmap · yearly table · trade
distribution · **regime analysis** · parameter sensitivity · **robustness diagnostics**
· assumptions · plain-English read.

The three bold blocks were added 2026-09-12 and are genuinely computed, not typed in:

- **Monte Carlo** — moving-**block** bootstrap (blocks of 25 trades), 1,000 paths.
  Block, not i.i.d.: resampling single trades destroys the clustering that produces
  real drawdowns and flatters the tail badly. Don't "simplify" it back.
- **Robustness** — Probabilistic Sharpe, Deflated Sharpe (deflated against the
  49-configuration trial count), and PBO via CSCV over 8 blocks / 70 symmetric splits.
- **Regime analysis** — 1-D k-means (k=3) over 20-session realised volatility.

`CSCV_RHO = 0.9` is load-bearing. The synthetic per-configuration trial series share a
common factor because neighbouring settings of one strategy trade largely the same
signals. Generating them independently is the common mistake and drives PBO to ~48%
(a coin flip) even for a robust strategy. Current outputs: PSR >99.9%, DSR 97.3%,
PBO 10.0%.

**These three blocks render lazily** via `whenNear()` (IntersectionObserver, 900px
margin) — together they cost ~80ms of arithmetic, which is fine to spend but not on
the boot path of a page paid traffic lands on. Their containers reserve height in CSS
(`.mc-box` aspect-ratio, `.mc-grid` / `.rob-grid` min-height) so deferring costs no
layout shift. **Anything added inside `.mc-box` will push the chart out of its
reserved box** — that's why the Monte Carlo legend has its own `#mcLegend` slot.

### Lead Magnet

`/spec-template/` — a ten-section strategy specification template.

- **Ungated by design.** No email wall. With no named humans on the site yet, trading
  a useful document for an email address costs more credibility than the address is
  worth. It also earns a second indexable URL and pre-qualifies: anyone who fills it
  in is serious.
- Copy-to-clipboard (plain-text version lives in `src/spec.js`) and print-to-PDF via
  the print stylesheet — no PDF tooling, nothing to keep in sync.
- It is the same document step 2 of the process produces, so it can't drift from what
  we'd actually ask for.

### SEO Infrastructure

| Artefact | Where it comes from |
|---|---|
| `sitemap.xml` | Emitted from `STATIC_PAGES` + published posts (draft posts excluded; `lastmod` = post `updated`/`date`). Production build only. |
| `blog/feed.xml` | RSS 2.0, emitted from published posts. |
| `robots.txt` | Emitted. `Allow: /` + sitemap on production; `Disallow: /` on preview. |
| `site.webmanifest` | Emitted from `brand.*` so a rename stays a one-file edit. |
| JSON-LD | Injected per page: WebSite + Organization + WebPage, plus ProfessionalService + FAQPage on the landing page, Blog on `/blog/`, BlogPosting + Person + BreadcrumbList (+ FAQPage) on each post. Production build only; skipped on drafts. |
| `og.png`, icons | `node scripts/make-images.mjs` — rasterised from `brand.markSvg` by headless Chrome. Committed under `public/`. |
| `404.html` | `public/404.html`, deliberately self-contained. |

**The FAQ schema is parsed out of the rendered markup**, not maintained as a second
copy. A duplicated list is how FAQ rich results end up quoting answers the page no
longer gives — Google treats the mismatch as a violation and drops the enhancement.

**`og.png` must stay in sync with the H1.** A link preview promising different words
from the page it opens reads as bait-and-switch. Change the hero headline → change
`scripts/make-images.mjs` → re-run it.

### Competitive Position

Benchmarked against **referentiallabs.com** (2026-09-12). They are *not* a direct
competitor — they sell an observability **platform** to mid-size quant teams; we sell
**manual per-engagement work**. Worth keeping in view anyway:

- **Where they beat us:** 20 indexed URLs against our 2, ~30,000 words of technical
  blog content, a live GA4, and an explicit response-time promise. Their acquisition
  is an owned channel; ours is 100% paid until the blog exists.
- **Where we beat them:** we *show the deliverable*. Their platform page has zero
  product screenshots — everything is described, nothing is demonstrated. Our full
  sample report is the strongest asset either site has, and it is structurally hard
  for them to copy.
- **Where we're both weak:** neither site names a single human.

---

## Copy Guidelines

- Never imply investment advice, trade recommendations, or expected returns.
- Never present past backtest performance as an indicator of future results.
- **Never mention price, rates, or that early work is free.** Note the distinction
  added 2026-09-12: *not stating a number* is required; *not addressing cost at all*
  was costing contacts. The FAQ now answers "what does it cost?" with process — scope
  and a fixed quote agreed in writing before anything starts, nothing billed until
  approved — and no number, and no mention of the free pilot.
- **Sell avoided loss, not gained profit.** The compliant argument is also the
  stronger one: the value is not in us finding an edge, it's in stopping you trading
  one that isn't there. Never phrase our value as improving returns or profitability.
- Client owns the strategy idea; we own the rigor of the testing.
- Speak to a competent trader, not a novice.
- Market coverage framed as "anything tradable with available data," not a fixed list.
- Concrete over vague: name the KPIs, show the report, state the process.

---

## Maintenance Instructions for Claude

**This file must not go stale.**

1. **Update on every meaningful change.** New section, new component, tech decision,
   copy change, deployment step, bug fix pattern, or architectural choice → update
   `CLAUDE.md` in the same working session to reflect the current state.
2. **Keep `## Current Status` accurate at the top.** It should always reflect done vs.
   pending, so a new session can resume immediately without re-reading conversation
   history.
3. **Keep `## Decisions Log` at the bottom.** One dated line per non-obvious choice.
4. **Do not delete institutional knowledge.** Append or revise. Only remove content
   that has genuinely been superseded — and when superseding, note it in the Decisions
   Log rather than silently dropping it.

---

## Decisions Log

<!-- Newest entries at the bottom. Format: YYYY-MM-DD: one-line decision + brief why. -->

- 2026-09-07: Created `CLAUDE.md` as the persistent cross-session context file, with
  Current Status pinned at the top and this Decisions Log at the bottom.
- 2026-09-07: Locked positioning constraint — page copy may describe strategy testing
  and reporting only, never investment advice or trade recommendations. Treated as a
  hard rule that gates all copy.
- 2026-09-07: Committed to white-glove manual delivery for the current phase to validate
  demand before investing in automation; advanced/custom tier stays available to premium
  clients post-automation.
- 2026-09-07: Adopted activetheory.net as a craft/tone reference only, explicitly
  subordinated to load speed and first-scroll clarity, since this is a conversion page
  and not an agency portfolio.
- 2026-09-07: Hosting target is Hostinger shared hosting → build must emit plain static
  assets with relative paths; no SSR, no Node runtime, no serverless.
- 2026-09-07: Chose Vite with static output over hand-written HTML, for minification and
  maintainable structure while still producing an uploadable `dist/`.
- 2026-09-07: Chose hybrid motion — one WebGL hero plus GSAP/CSS scroll motion below —
  over full Three.js, to get activetheory-level impact without the 600KB+ first paint
  that would burn paid ad budget on bounces.
- 2026-09-07: Brand name "Quant Monk" is provisional; all brand strings must live in one
  config file so a rename is a single-file edit.
- 2026-09-07: Broadened market scope from "Indian NIFTY F&O + US equity options" to
  "anything tradable with available data." Client base is majority US; the two original
  markets remain as concrete illustrative examples.
- 2026-09-07: No billing in the current phase — early engagements delivered free to
  validate demand and build a client base.
- 2026-09-07: Page stays completely silent on pricing, including the free pilot.
  Rationale: advertising "free" attracts tire-kickers and anchors future paid value low.
- 2026-09-07: Lead capture is WhatsApp deep link plus a deliberately minimal 3-field form
  (email, contact number, what they're seeking).
- 2026-09-07: Defaulted the form backend to Web3Forms — no PHP, works on static shared
  hosting, reliable deliverability, free at early volume. Chosen by Claude after the
  question was left open twice; endpoint is a one-line swap if the user prefers otherwise.
- 2026-09-07: Sample backtesting report ships as a full-depth dummy with realistic
  structure and placeholder numbers; user supplies an authentic report later. Structure
  must be built so swapping in real data does not require a redesign.
- 2026-09-08: Brand renamed from "Quant Monk" to **Taurus**; domain/email updated to
  `taurusconsultants.com`. Because brand strings were tokenised, this was a single-file
  edit in `src/config.js` plus a rebuild — no markup changes. Still not treated as final.
- 2026-09-08: Brand mark changed from the abstract chart-line glyph to a **Taurus
  symbol** (horns + ring), to match the new name. Stored as an SVG path string in
  `src/config.js`, injected at build time into header, footer and favicon so the mark
  has exactly one source of truth and the favicon can never drift from the logo.
- 2026-09-08: Sample-report figures re-tuned for credibility after the first generated
  dataset produced Sharpe 4.96 / +2,050% — numbers a quant audience would read as fake.
  Seed scanned for a realistic envelope: ~20% CAGR, Sharpe 1.49, -15.3% max drawdown, a
  losing year, and out-of-sample *worse* than in-sample. Do not "improve" these numbers.
- 2026-09-08: Chart palette is blue/red (validated for colour-vision deficiency and
  contrast on the dark surface); the brand lime is a UI colour and is used for data only
  where a chart has a single series. Keep the two roles separate.
- 2026-09-08: Added GitHub Pages as a **preview** target alongside Hostinger production.
  Rejected the standard `base: '/<repo-name>/'` advice — `base: './'` was already set at
  scaffold time and serves both targets from one build, whereas the repo-name base would
  break the Hostinger deploy. See the Deployment section before changing this.
- 2026-09-08: `noindex` for the preview is an env flag (`NOINDEX=1`), not a config value,
  so it cannot leak into the Hostinger production build and deindex the real site.
- 2026-09-08: Added `.gitignore` (repo had none) excluding `node_modules/` and `dist/`;
  the Pages build produces `dist/` in CI rather than it being committed.
- 2026-09-09: **Bug + guard — Web3Forms access key.** The key had been pasted with a
  stray leading `R` (`R4de01c1e-…`, 37 chars), so the API rejected every submission and
  the form failed for all visitors. Web3Forms keys are bare 36-char UUIDs with no
  prefix. Fixed, and `vite.config.js` now warns at build time if the key isn't a valid
  UUID. The runtime error handler also logs the provider's own failure reason to the
  console, since the visitor-facing message deliberately says nothing useful.
  Note: Web3Forms cannot be tested with curl — Cloudflare blocks non-browser requests,
  so the only way to verify a submission is to submit the real form in a browser.
- 2026-09-09: Lead form contact fields changed from **both required** to **either/or** —
  email or phone, at least one. Requiring both cost conversions for no gain. `required`
  attributes removed from both inputs; the rule is enforced in `validate()` and covered
  by unit tests (either alone passes, neither fails, per-field format still enforced
  when filled). `validate()` is exported from `src/js/form.js` purely so it stays
  testable without a browser.
- 2026-09-09: **Bug + guard — WhatsApp country code.** `brand.whatsappNumber` had been
  entered as the local subscriber number with no country code, while `whatsappDisplay`
  showed the `+91` form. That produces a `wa.me/<local-number>` link, which cannot
  resolve an account: every WhatsApp click — the primary conversion path — would have
  failed silently, with no error surfaced anywhere and no sign in analytics beyond
  "the ads aren't converting". Fixed by prefixing the country code, and
  `vite.config.js` now warns at build time if the number has fewer than 11 digits.
  **`whatsappNumber` must always include the country code (India 91…, US 1…).**
- 2026-09-09: Contact details and Web3Forms access key are now real, not placeholders.
  The form is wired but has NOT been tested end to end — do that before running ads.
- 2026-09-09: Brand assets exported to `brand/` (PNG/JPG lockups, mark, rounded icon),
  generated from `brand.markSvg` so they cannot drift from the site. `brand/` is
  gitignored — the SVG in `src/config.js` remains the single source of truth.
- 2026-09-12: **Benchmarked against referentiallabs.com** and restructured off the
  findings. Concluded they are an adjacent, not direct, competitor (platform-for-teams
  vs. manual-work-for-anyone) so their positioning was deliberately *not* copied —
  only three mechanics were: problem-first framing, answering the objections that
  block contact, and building an owned channel.
- 2026-09-12: **Hero rewritten pain-first** — "Great backtest. Then it went live."
  replaces "Your strategy. Tested properly." A capability statement is accurate and
  forgettable; a mirror of the reader's own experience creates urgency. Added a
  section 01 naming the four failure modes, which is also the copy a blog would
  later rank for.
- 2026-09-12 (later): **Hero rewritten again, from an event to a feeling.** Now
  "Perfect on paper. / Still don't trust it?" with the lede opening "Good — you
  shouldn't yet." The previous line described something that *happened* (going
  live and losing); the doubt after over-tuning a strategy is more universal, is
  the exact moment a prospect would reach out, and works for a PM reading a
  researcher's backtest as well as for a retail trader. CTAs changed to "Find out
  if it's real" / "See what you'd get back". Rejected "The curve looks perfect. /
  You still don't trust it." (stronger, but 25 characters won't fit one line at
  hero size) and "Great backtest. / Would you fund it?" (softer).
- 2026-09-12 (final): **Hero copy settled on the three-beat scoreboard** —
  "Backtest: great. / Paper: promising. / Live: disappointing." with the lede
  "Sound familiar? The problem isn't your strategy. It's that nobody checked where
  it breaks. We do…". Structure borrowed deliberately from referentiallabs.com's
  opening paragraph (their strongest copy, buried under a jargon headline): a
  three-stage story arc plus a blame-removing reframe. Chosen by the user from eight
  compositions. The third line is set in `--neg` red, not lime, so headline and the
  chart strip's red live segment read as one statement — flip `.down` to
  `var(--accent)` if it ever feels too harsh. Three-line hero uses the
  `.hero-title-3` size variant.
- 2026-09-12: **Hero chart loops.** Draws, holds `motion.heroChartHold` seconds
  (default 4), fades, redraws — a paused GSAP timeline with `repeat:-1` whose t=0
  `.set()`s reset it on every cycle. Paused by IntersectionObserver when the strip
  is off-screen. `heroChartHold: 0` draws once and stops.
- 2026-09-12: **Critical CSS inlined in `<head>`** on both pages: dark background,
  brand-mark size, skip-link off-screen. Fixes the "blue smile" the user saw — the
  horns of the mark rendered full-width in link-blue before the stylesheet arrived
  (always visible in `npm run dev`, where Vite injects CSS via JS; possible on slow
  connections in production). Also removes the white flash on slow mobile.
- 2026-09-12: **Hero chart strip** — the headline drawn: a lime backtest curve
  draws in, pauses at a dashed "live" marker, then continues red and jagged. Paths
  are static, seeded and inlined in `index.html` (regenerate with the snippet in
  the session notes if the shape ever needs changing — seed 7, LCG 16807). Animated
  as the last beat of the hero timeline in `motion.js`; fully visible without JS or
  under reduced motion. `vector-effect="non-scaling-stroke"` was deliberately left
  OFF: it makes `stroke-dasharray` units ambiguous across browsers and breaks the
  draw-in.
- 2026-09-12: **Motion/polish layer added** — cursor-tracked spotlight on all card
  grids (`.spot`, via CSS custom properties; hidden on touch), header
  reading-progress line, blur-to-sharp on section titles only, primary-CTA glow
  (`.btn-glow`, hero + contact only so "primary" still means something), marquee
  edge fades, 3.5% SVG film grain, a lime hairline on the report, and a glow behind
  the contact form. Everything is CSS/GSAP, no new dependencies, and every piece is
  switched off under `prefers-reduced-motion` and in print.
- 2026-09-12: **Primary CTA lowered from "Send your strategy" to "Tell us what you
  trade."** Asking a stranger for their proprietary alpha on first contact is the
  largest possible ask and adversely selects — whoever has a genuinely good edge
  won't do it. The WhatsApp prefill was changed to match.
- 2026-09-12: **Sample report moved earlier in the scroll** (section 04, was 06 after
  the new sections were added). It is the strongest proof on the page and was sitting
  below three sections of claims.
- 2026-09-12: **Invented legal entity and jurisdiction removed** rather than replaced.
  Claiming an LLC in a named jurisdiction is specific and verifiable; being wrong
  about it on a page selling rigour is worse than saying nothing.
- 2026-09-12: **Audience broadened to retail *and* enterprise.** Same process, scope
  and reporting depth vary. A "who this is for / not for" block was added so readers
  self-qualify — including an explicit "not for you if you want signals or tips",
  which doubles as positioning-rule enforcement.
- 2026-09-12: **Cost objection answered without a price.** See Copy Guidelines — the
  pricing-silence rule is unchanged, but silence on *cost as a topic* was suppressing
  contact, since a premium page that hides price reads as "expensive, don't bother".
- 2026-09-12: **Report extended** with Monte Carlo, robustness diagnostics
  (PSR/DSR/PBO-CSCV) and regime analysis, all genuinely computed. Chose a
  moving-block bootstrap over i.i.d. after the i.i.d. version returned 100% of paths
  profitable and a −22% worst-5% drawdown — flattering and methodologically wrong,
  because resampling single trades destroys the clustering that creates real
  drawdowns. Blocks of 25 give 99.6% / −26.2%.
- 2026-09-12: **CSCV trial series are correlated (rho = 0.9), not independent.**
  Independent series drove PBO to ~48% — a coin flip — for a strategy the rest of the
  report shows is robust. Neighbouring parameter settings of one strategy trade
  largely the same signals; modelling them as independent is the standard mistake.
- 2026-09-12: **Deflated Sharpe is computed against 49 trials, not "millions."** The
  page's million-combination capability claim lives in the Scale & Method section
  instead. Deflating against a trial count that large correctly eats the entire edge,
  which would have made our own showcase report conclude "indistinguishable from
  luck". The two claims are about different things and are kept apart.
- 2026-09-12: **Heavy report blocks render lazily** (IntersectionObserver). Module
  boot went from 192ms to 60ms. Containers reserve height in CSS so there is no
  layout shift and no ScrollTrigger invalidation.
- 2026-09-12: **Full SEO infrastructure added**, generated rather than committed so
  it can differ between the production and preview targets and can never drift from
  `PAGES` or from `src/config.js`. FAQ structured data is parsed out of the markup
  for the same reason.
- 2026-09-12: **Lead magnet shipped ungated** at `/spec-template/`. An email wall
  would trade a useful document for an address, and on a site with no named humans
  that exchange costs more credibility than the address is worth.
- 2026-09-12: **Site is now multi-page.** `PAGES` in `vite.config.js` is the single
  list driving entry points, sitemap and canonicals. The spec page gets its own tiny
  entry (`src/spec.js`) so it doesn't load the 68KB motion/WebGL bundle it has no use for.
- 2026-09-12: **Response time promised explicitly** ("within 24 hours") as
  `brand.responseTime`, surfaced in the hero, contact block, form and FAQ. Vagueness
  ("we reply to every enquiry") reduces the cost of contacting by nothing.
- 2026-09-13: **Found production noindexed.** `taurusconsultancy.com` had been pointed
  at GitHub Pages (not Hostinger as this file assumed), but the Pages workflow still
  built with `NOINDEX=1` from its preview-only days, so every live page carried
  `noindex, nofollow`. Removed the flag from `deploy.yml`; Pages is now the documented
  production target and Hostinger is dropped. Lesson recorded in Deployment: the
  deploy workflow must never set `NOINDEX`.
- 2026-09-13: **Blog built as Markdown-in-repo rendered at build time**, not
  WordPress (second stack, breaks brand tokenisation), not an Astro migration (rewrite
  of a finished page for no visible gain), not a headless CMS (needs an OAuth gateway;
  revisit only if authors stall on GitHub). Benchmarked referentiallabs.com first:
  their repo is *built output only*, one author pushing "Update site" — a one-person
  process we deliberately did not copy. Their post *anatomy* was copied: problem →
  method with code → summary table → honest limits → how it shows up in our work →
  FAQ, with a real byline.
- 2026-09-13: **Publishing is a pull request with a required review.** Five authors
  under one hard positioning rule needs a gate that is a person, not a lint. The lint
  (`HARD_PATTERNS`) exists to fail obvious violations before a human reads them, not
  to replace the read. Branch per post, never a shared staging branch.
- 2026-09-13: **Drafts are per-page, not per-site.** With Pages now production, the
  old "preview build includes drafts" idea died. `draft: true` builds an unlisted,
  noindexed page with a real URL — authors share it for feedback, and flipping the
  flag publishes. Simpler than a second Pages site and needs nothing extra.
- 2026-09-13: **Charts are images.** Authors export SVG/PNG into the post folder. A
  chart-from-data block was considered and rejected for phase 1: more build surface
  for a narrower set of chart types than matplotlib gives for free.
- 2026-09-13: **Maths and highlighting at build time** (KaTeX, Shiki). The reader gets
  HTML and one CSS file; the blog entry ships ~0.5 KB of JS (a copy button).
- 2026-09-13: **Seed post** "Why we resample blocks of trades, not single trades" —
  the Monte Carlo block-bootstrap argument already in this file, written up as the
  first article. Its chart is generated from a seeded synthetic series with regime
  clustering (i.i.d. worst-5% DD −20.3% vs block −26.3%, actual −13.3%), labelled
  illustrative. Bylined `taurus` until real author names are supplied.
- 2026-09-13: **`.gitignore` uses `/blog/`, not `blog/`.** The bare pattern also
  matched `content/blog/` and would have silently kept every post out of git.
- 2026-09-08: Added **Model evaluation** as a sixth service (card 06) — validating a
  model the client already trained (leakage/look-ahead audit, purged & embargoed CV,
  feature stability). Kept inside the hard positioning rule: we assess a client-supplied
  model and report findings; we do not build models or advise on what to trade. Services
  section heading is now "Six things, done by hand" — update it if the count changes.

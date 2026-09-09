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

**Last updated:** 2026-09-08

**Phase:** Decisions locked, scaffolding not yet started. Ready to build.

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

### Pending
- [ ] **Test the lead form end to end** — submit it once and confirm the email arrives
- [ ] Analytics + ad conversion tracking (`analytics` in `src/config.js` is still empty)
- [ ] Register the real domain, then update `brand.url` / `brand.domain`
- [ ] Replace the dummy sample report with authentic, client-authorised results
- [ ] Build + deploy to Hostinger (production) — Pages is preview only
- [ ] Confirm legal entity name + jurisdiction (footer still says "Taurus Consultants
      LLC · Delaware, United States" — a placeholder Claude invented)

### Open Questions (need user input)
- **Domain name** — `taurusconsultants.com` is still a placeholder in config; canonical
  and OG tags point there. Update the moment a real domain is registered.
- **Legal entity name + jurisdiction** — footer and disclaimer currently use invented
  values. These are legal text; they must be corrected before any paid traffic runs.
- **Real sample report** — user will supply later. Full-depth dummy in place until then.

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

Traders who **already have a strategy idea** (even a rough one) and want it properly
tested, optimized, or deployed, but lack the tooling or the time to do it rigorously.

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
| Build tooling | **Vite** | Static output; upload `dist/` to Hostinger |
| Hosting | **Hostinger shared hosting** | Static files via File Manager or FTP |
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

**Two targets, one codebase, one `dist/`.**

| Target | Purpose | Command | Indexed? |
|---|---|---|---|
| **Hostinger** | **Production** | `npm run build`, upload `dist/` | Yes |
| **GitHub Pages** | Preview / sharing | Automatic on push to `main` | **No** |

### Why `base: './'` must not change

`vite.config.js` sets `base: './'`, emitting **relative** asset paths (`./assets/…`).
That single setting is what lets the same build work at both the GitHub Pages subpath
(`username.github.io/repo-name/`) and the Hostinger document root.

> **Do not change this to `/<repo-name>/`.** It is the standard GitHub Pages advice and
> it is wrong for this project: it pins the build to one GitHub path, and the identical
> `dist/` would then 404 every asset on Hostinger. Relative paths already solve it.

### The noindex flag

The preview must not be indexed, or a github.io copy competes with the real site in
search results. This is an **environment flag, not a config value** — deliberately:

```
npm run build           # production — indexable
npm run build:preview   # NOINDEX=1 — injects <meta name="robots" content="noindex, nofollow">
```

If noindex lived in `src/config.js`, it would travel with the build to Hostinger and
deindex production. The Pages workflow sets `NOINDEX=1`; nothing else does.

### GitHub Pages setup

- Workflow: `.github/workflows/deploy.yml` — builds on push to `main`, deploys the
  artifact. No `dist/` is ever committed (`.gitignore` excludes it).
- **One-time repo setting:** Settings → Pages → Source → **GitHub Actions**.
- `public/.nojekyll` stops GitHub's Jekyll layer processing the output; the workflow
  also `touch`es it as a fallback.

### Canonical URL caveat

`brand.url` is still the placeholder `taurusconsultants.com`. Canonical/OG tags point
there. That is correct while Pages is preview-only, but **update `brand.url` the moment
the real domain is registered**, or link previews and canonical tags point at nothing.

---

## Brand Tokenization

**The brand name is not final.** Never hardcode it.

- Define brand strings in a **single config file** (name, tagline, WhatsApp number,
  email, domain, social links).
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

*To be populated at scaffold time: directory layout, component inventory, where copy
lives, how the sample report is rendered, asset pipeline, brand config location.*

---

## Copy Guidelines

- Never imply investment advice, trade recommendations, or expected returns.
- Never present past backtest performance as an indicator of future results.
- **Never mention price, rates, or that early work is free.**
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
- 2026-09-08: Added **Model evaluation** as a sixth service (card 06) — validating a
  model the client already trained (leakage/look-ahead audit, purged & embargoed CV,
  feature stability). Kept inside the hard positioning rule: we assess a client-supplied
  model and report findings; we do not build models or advise on what to trade. Services
  section heading is now "Six things, done by hand" — update it if the count changes.

/**
 * Blog generator — Markdown in `content/blog/` → HTML pages in `blog/`.
 *
 * Called by vite.config.js before every build and dev start, so `npm run
 * build` and `npm run dev` are the only commands anyone needs. Can also be run
 * directly (`node scripts/build-blog.mjs`) to check a post without Vite.
 *
 * INPUT   content/blog/<slug>/index.md   (+ any images beside it)
 * OUTPUT  blog/<slug>/index.html         (gitignored, regenerated every build)
 *         blog/index.html                (the listing)
 *
 * The generator only substitutes {{post.*}} and {{blog.*}} tokens. {{brand.*}}
 * and {{site.*}} tokens are left in place for the brandTokens() plugin in
 * vite.config.js, so brand strings stay a one-file edit even for the blog.
 *
 * Everything that can be checked mechanically is checked here and FAILS THE
 * BUILD: missing frontmatter fields, unknown authors, bad slugs, and wording
 * that breaks the no-advice rule. A post that reaches production has passed
 * these plus a human review — see CONTRIBUTING.md.
 */

import { readdir, readFile, writeFile, mkdir, copyFile, rm, stat } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';
import Shiki from '@shikijs/markdown-it';
import katexPlugin from '@vscode/markdown-it-katex';
import matter from 'gray-matter';
import { authors } from '../src/authors.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = join(ROOT, 'content', 'blog');
const OUT_DIR = join(ROOT, 'blog');
const TEMPLATE_DIR = join(ROOT, 'src', 'templates');

const WORDS_PER_MINUTE = 220;

/* ────────────────────────────────────────────────────────────────────────────
   WORDING LINT — the positioning rule, enforced by machine before a human.
   Hard patterns fail the build. Soft patterns warn. Both are checked against
   the prose only (code blocks and maths are stripped first).
   ──────────────────────────────────────────────────────────────────────────── */
const HARD_PATTERNS = [
  [/\bguaranteed? (returns?|profits?|gains?|income)\b/i, 'promises a guaranteed outcome'],
  [/\brisk[- ]free (returns?|profits?|gains?)\b/i, 'promises a risk-free outcome'],
  [/\bwill (make|earn|generate|return) (you )?(money|profits?|\d+\s?%)/i, 'promises a future return'],
  [/\b(you|we|readers?|traders?) should (buy|sell|short|go long|enter|exit)\b/i, 'tells the reader what to trade'],
  [/\bwe recommend (buying|selling|shorting|going long|trading|entering|exiting)\b/i, 'is a trade recommendation'],
  [/\b(buy|sell|short|strong buy|strong sell) (rating|call|recommendation)s?\b/i, 'is a trade recommendation'],
  [/\bprice targets?\b/i, 'states a price target'],
  [/\b(buy|sell) (the )?(dip|top|breakout|bounce)\b/i, 'is a trade recommendation'],
];

const SOFT_PATTERNS = [
  [/\bexpected returns?\b/i, '"expected return" — fine as a statistical term, not as a promise'],
  [/\boutperform(s|ed|ing)?\b/i, '"outperform" — make sure this describes a backtest, not a forecast'],
  [/\bmake money\b/i, '"make money" — reframe as avoided loss'],
  [/\bstock picks?\b/i, '"stock pick" — we do not pick anything'],
  [/\bthis (strategy|setup|system) works\b/i, 'claims a strategy works — say what the test showed instead'],
  [/\b(free|no cost|complimentary|pricing|per report|per month)\b/i, 'mentions price or cost — the page stays silent on both'],
];

/* ────────────────────────────────────────────────────────────────────────────
   MARKDOWN
   ──────────────────────────────────────────────────────────────────────────── */
let mdPromise;
function getMarkdown() {
  mdPromise ??= (async () => {
    const md = MarkdownIt({ html: true, linkify: true, typographer: true });

    md.use(
      await Shiki({
        theme: 'github-dark-default',
        langs: ['python', 'javascript', 'typescript', 'bash', 'shell', 'json', 'yaml', 'sql', 'r', 'text', 'diff', 'toml', 'csv'],
      })
    );
    md.use(katexPlugin.default ?? katexPlugin);

    // Heading anchors, so sections can be linked to and the FAQ can be found.
    const headingOpen = md.renderer.rules.heading_open || ((t, i, o, e, s) => s.renderToken(t, i, o));
    md.renderer.rules.heading_open = (tokens, idx, opts, env, self) => {
      const text = tokens[idx + 1]?.content || '';
      const id = slugify(text);
      if (id && !tokens[idx].attrGet('id')) tokens[idx].attrSet('id', id);
      return headingOpen(tokens, idx, opts, env, self);
    };

    // Images: lazy by default, and inside a <figure> when they carry a title,
    // which becomes the caption: ![alt](./chart.svg "Caption text").
    md.renderer.rules.image = (tokens, idx, opts, env, self) => {
      const t = tokens[idx];
      t.attrSet('loading', 'lazy');
      t.attrSet('decoding', 'async');
      const alt = md.utils.escapeHtml(t.content);
      const title = t.attrGet('title');
      // markdown-it stores alt as an empty attr and the text in `content`;
      // drop the attr so the rendered tag has exactly one alt.
      t.attrs = t.attrs.filter(([k]) => k !== 'title' && k !== 'alt');
      const img = `<img${self.renderAttrs(t)} alt="${alt}">`;
      return title ? `<figure>${img}<figcaption>${md.utils.escapeHtml(title)}</figcaption></figure>` : img;
    };

    // Tables scroll inside their own box on narrow screens instead of the page.
    md.renderer.rules.table_open = () => '<div class="table-wrap"><table>';
    md.renderer.rules.table_close = () => '</table></div>';

    // External links open in a new tab; internal ones don't.
    const linkOpen = md.renderer.rules.link_open || ((t, i, o, e, s) => s.renderToken(t, i, o));
    md.renderer.rules.link_open = (tokens, idx, opts, env, self) => {
      const href = tokens[idx].attrGet('href') || '';
      if (/^https?:\/\//i.test(href)) {
        tokens[idx].attrSet('target', '_blank');
        tokens[idx].attrSet('rel', 'noopener');
      }
      return linkOpen(tokens, idx, opts, env, self);
    };

    return md;
  })();
  return mdPromise;
}

/* ────────────────────────────────────────────────────────────────────────────
   HELPERS
   ──────────────────────────────────────────────────────────────────────────── */
const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z]+;/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const stripHtml = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' ').trim();

/** YYYY-MM-DD from a string or the Date that gray-matter produces for bare dates. */
function toDateString(v, field, slug) {
  if (v instanceof Date && !Number.isNaN(v)) return v.toISOString().slice(0, 10);
  const s = String(v ?? '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  throw new Error(`[blog] ${slug}: "${field}" must be a date in YYYY-MM-DD form (got "${s}")`);
}

function fmtDate(iso) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });
}

/** Prose only: drop fenced code, inline code and maths before linting/counting. */
function proseOnly(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/~~~[\s\S]*?~~~/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/`[^`\n]*`/g, ' ')
    .replace(/\$[^$\n]+\$/g, ' ');
}

/**
 * Pull a trailing "## FAQ" section out of the body. Questions are `###`
 * headings; the paragraphs under each are the answer. Returned separately so
 * the template can render it as <details> and vite.config.js can emit FAQPage
 * structured data from the same source — one list, never two.
 */
function splitFaq(markdown) {
  const re = /^##\s+(?:faq|frequently asked questions)\s*$/im;
  const m = re.exec(markdown);
  if (!m) return { body: markdown, faqMd: '' };
  const start = m.index;
  const rest = markdown.slice(start + m[0].length);
  const next = /^##\s+/m.exec(rest);
  const faqMd = next ? rest.slice(0, next.index) : rest;
  const body = markdown.slice(0, start) + (next ? rest.slice(next.index) : '');
  return { body, faqMd };
}

function parseFaq(faqMd) {
  const items = [];
  const parts = faqMd.split(/^###\s+/m).slice(1);
  for (const part of parts) {
    const nl = part.indexOf('\n');
    const q = (nl === -1 ? part : part.slice(0, nl)).trim();
    const a = (nl === -1 ? '' : part.slice(nl + 1)).trim();
    if (q && a) items.push({ q, a });
  }
  return items;
}

function lint(markdown, slug) {
  const prose = proseOnly(markdown);
  const errors = [];
  for (const [re, why] of HARD_PATTERNS) {
    const m = re.exec(prose);
    if (m) errors.push(`  ✗ "${m[0]}" — ${why}`);
  }
  for (const [re, why] of SOFT_PATTERNS) {
    const m = re.exec(prose);
    if (m) console.warn(`[blog] ${slug}: ⚠ "${m[0]}" — ${why}`);
  }
  if (errors.length) {
    throw new Error(
      `[blog] ${slug}: wording fails the positioning rule (testing and reporting only, never advice):\n` +
        errors.join('\n') +
        `\n  Rewrite the sentence, or if it is a false positive adjust HARD_PATTERNS in scripts/build-blog.mjs — with a reviewer.`
    );
  }
}

function fill(template, tokens) {
  return template.replace(/\{\{\s*((?:post|blog)\.[\w.]+)\s*\}\}/g, (match, key) => {
    if (key in tokens) return tokens[key];
    console.warn(`[blog] unknown template token: ${match}`);
    return '';
  });
}

/** Body HTML may legitimately contain "{{" (Jinja, Go templates…). Neutralise
 *  it so the brandTokens() plugin never mistakes it for a brand token. */
const guardBraces = (html) => html.replace(/\{\{/g, '&#123;&#123;');

/* ────────────────────────────────────────────────────────────────────────────
   ONE POST
   ──────────────────────────────────────────────────────────────────────────── */
async function readPost(slug) {
  const dir = join(CONTENT_DIR, slug);
  const file = join(dir, 'index.md');

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`[blog] folder "${slug}" is not a valid slug — lowercase letters, digits and single hyphens only. It becomes the URL.`);
  }

  let raw;
  try {
    raw = await readFile(file, 'utf8');
  } catch {
    throw new Error(`[blog] ${slug}: no index.md found in content/blog/${slug}/`);
  }

  const { data: fm, content } = matter(raw);

  const required = ['title', 'description', 'date', 'author'];
  const missing = required.filter((k) => fm[k] === undefined || fm[k] === null || String(fm[k]).trim() === '');
  if (missing.length) {
    throw new Error(`[blog] ${slug}: frontmatter is missing ${missing.map((k) => `"${k}"`).join(', ')}`);
  }

  const author = authors[fm.author];
  if (!author) {
    throw new Error(
      `[blog] ${slug}: unknown author "${fm.author}". Known keys: ${Object.keys(authors).join(', ')}. Add yourself to src/authors.js.`
    );
  }

  const title = String(fm.title).trim();
  const description = String(fm.description).trim();
  if (description.length > 200) console.warn(`[blog] ${slug}: description is ${description.length} chars — search engines truncate around 160.`);

  const date = toDateString(fm.date, 'date', slug);
  const updated = fm.updated ? toDateString(fm.updated, 'updated', slug) : date;
  const draft = fm.draft === true;

  let tags = fm.tags ?? [];
  if (typeof tags === 'string') tags = tags.split(',');
  if (!Array.isArray(tags)) throw new Error(`[blog] ${slug}: "tags" must be a list, e.g. tags: [backtesting, overfitting]`);
  tags = tags.map((t) => slugify(t)).filter(Boolean);

  lint(content, slug);

  const { body: bodyMd, faqMd } = splitFaq(content);
  const faq = parseFaq(faqMd);

  const md = await getMarkdown();
  const bodyHtml = guardBraces(md.render(bodyMd));
  const faqHtml = faq.length
    ? `<section class="post-faq" aria-labelledby="faq-title">
  <h2 id="faq">Frequently asked questions</h2>
  <div class="faq-list">
${faq
  .map(
    (f) =>
      `    <details class="faq-item">
      <summary>${esc(f.q)}</summary>
      <div>${guardBraces(md.render(f.a))}</div>
    </details>`
  )
  .join('\n')}
  </div>
</section>`
    : '';

  const wordCount = stripHtml(bodyHtml).split(/\s+/).filter(Boolean).length + faq.reduce((n, f) => n + f.a.split(/\s+/).length, 0);
  const readingTime = Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));

  if (wordCount < 300) console.warn(`[blog] ${slug}: only ${wordCount} words — is this finished?`);

  // Assets beside the post: everything except the Markdown itself.
  const assets = (await readdir(dir)).filter((f) => f !== 'index.md' && !f.startsWith('.'));

  return {
    slug,
    route: `/blog/${slug}/`,
    file: `blog/${slug}/index.html`,
    title,
    description,
    date,
    updated,
    draft,
    tags,
    authorKey: fm.author,
    author,
    wordCount,
    readingTime,
    faq: faq.map((f) => ({ q: f.q, a: stripHtml(md.render(f.a)) })),
    cover: fm.cover ? String(fm.cover) : '',
    bodyHtml,
    faqHtml,
    assets,
    dir,
  };
}

/* ────────────────────────────────────────────────────────────────────────────
   RENDER
   ──────────────────────────────────────────────────────────────────────────── */
function postTokens(p) {
  const tagsHtml = p.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('');
  return {
    'post.slug': p.slug,
    'post.route': p.route,
    'post.title': esc(p.title),
    'post.description': esc(p.description),
    'post.date': p.date,
    'post.dateHuman': fmtDate(p.date),
    'post.updated': p.updated,
    'post.updatedHuman': fmtDate(p.updated),
    'post.updatedNote': p.updated !== p.date ? `<span class="post-updated">Updated ${fmtDate(p.updated)}</span>` : '',
    'post.readingTime': String(p.readingTime),
    'post.authorName': esc(p.author.name),
    'post.authorRole': esc(p.author.role || ''),
    'post.authorBio': esc(p.author.bio || ''),
    'post.authorInitial': esc(p.author.name.trim().charAt(0).toUpperCase()),
    'post.tags': tagsHtml,
    'post.body': p.bodyHtml,
    'post.faq': p.faqHtml,
    'post.robots': p.draft ? '<meta name="robots" content="noindex, nofollow" />' : '',
    'post.draftBanner': p.draft
      ? '<p class="post-draft" role="status">Draft — unlisted and not indexed. Set <code>draft: false</code> to publish.</p>'
      : '',
  };
}

function listingHtml(posts) {
  if (!posts.length) {
    return '<p class="blog-empty">Nothing published yet. The first pieces are in review.</p>';
  }
  return posts
    .map(
      (p) => `<article class="post-card">
  <a class="post-card-link" href="./${p.slug}/">
    <p class="post-card-meta"><time datetime="${p.date}">${fmtDate(p.date)}</time> · ${p.readingTime} min read</p>
    <h2 class="post-card-title">${esc(p.title)}</h2>
    <p class="post-card-desc">${esc(p.description)}</p>
    <p class="post-card-foot"><span class="post-card-author">${esc(p.author.name)}</span>${
      p.tags.length ? `<span class="post-card-tags">${p.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</span>` : ''
    }</p>
  </a>
</article>`
    )
    .join('\n');
}

/* ────────────────────────────────────────────────────────────────────────────
   ENTRY
   ──────────────────────────────────────────────────────────────────────────── */
export async function buildBlog({ quiet = false } = {}) {
  const log = quiet ? () => {} : (...a) => console.log(...a);

  let slugs = [];
  try {
    const entries = await readdir(CONTENT_DIR, { withFileTypes: true });
    slugs = entries.filter((e) => e.isDirectory() && !e.name.startsWith('.') && !e.name.startsWith('_')).map((e) => e.name).sort();
  } catch {
    log('[blog] no content/blog directory — skipping blog build');
  }

  const posts = [];
  for (const slug of slugs) posts.push(await readPost(slug));

  // Newest first; ties broken by slug so the order is stable between builds.
  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));

  const published = posts.filter((p) => !p.draft);

  const postTpl = await readFile(join(TEMPLATE_DIR, 'post.html'), 'utf8');
  const indexTpl = await readFile(join(TEMPLATE_DIR, 'blog-index.html'), 'utf8');

  // Clean output so a deleted or renamed post cannot leave a stale page behind.
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  for (const p of posts) {
    const outDir = join(OUT_DIR, p.slug);
    await mkdir(outDir, { recursive: true });
    await writeFile(join(outDir, 'index.html'), fill(postTpl, postTokens(p)));
    for (const a of p.assets) {
      const src = join(p.dir, a);
      if ((await stat(src)).isFile()) await copyFile(src, join(outDir, a));
    }
  }

  await writeFile(
    join(OUT_DIR, 'index.html'),
    fill(indexTpl, {
      'blog.list': listingHtml(published),
      'blog.count': String(published.length),
    })
  );

  log(`[blog] ${published.length} published, ${posts.length - published.length} draft${posts.length - published.length === 1 ? '' : 's'}`);

  // What vite.config.js needs: routes, metadata, FAQ for schema. Not the HTML.
  return {
    posts: posts.map(({ bodyHtml, faqHtml, dir, assets, ...meta }) => meta),
    contentDir: CONTENT_DIR,
  };
}

// `node scripts/build-blog.mjs` — check every post without running Vite.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildBlog()
    .then(({ posts }) => {
      for (const p of posts) console.log(`  ${p.draft ? 'draft ' : 'live  '} ${p.date}  ${p.slug}  (${p.wordCount} words, ${p.author.name})`);
    })
    .catch((e) => {
      console.error(e.message);
      process.exit(1);
    });
}

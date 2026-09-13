/**
 * Scaffold a new blog post.
 *
 *   npm run new-post -- "Why block bootstrap beats resampling single trades"
 *   npm run new-post -- "Title here" --author marmik
 *
 * Creates content/blog/<slug>/index.md with the frontmatter filled in and
 * draft: true, so nothing goes live until you change it. The slug becomes the
 * URL and should not change after the post is published.
 */

import { mkdir, writeFile, access } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { authors } from '../src/authors.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const args = process.argv.slice(2);
const authorIdx = args.indexOf('--author');
const author = authorIdx !== -1 ? args[authorIdx + 1] : 'taurus';
const title = args
  .filter((a, i) => a !== '--author' && (authorIdx === -1 || i !== authorIdx + 1))
  .join(' ')
  .trim();

if (!title) {
  console.error('Usage: npm run new-post -- "Post title" [--author key]');
  process.exit(1);
}
if (!authors[author]) {
  console.error(`Unknown author "${author}". Known: ${Object.keys(authors).join(', ')}. Add yourself to src/authors.js first.`);
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 80)
  .replace(/-+$/g, '');

const dir = join(ROOT, 'content', 'blog', slug);
try {
  await access(dir);
  console.error(`content/blog/${slug}/ already exists.`);
  process.exit(1);
} catch {
  /* good — it doesn't exist yet */
}

const today = new Date().toISOString().slice(0, 10);

const md = `---
title: ${title}
description: One sentence, under 160 characters. This is the search snippet and the card on the blog index.
date: ${today}
author: ${author}
tags: [backtesting]
draft: true
---

Open with the reader's problem, not with the method. One idea per post, argued fully.

## The problem

What goes wrong, in terms a competent trader recognises.

## What the test does

Method. Code is welcome:

\`\`\`python
import numpy as np

def sharpe(returns, periods=252):
    r = np.asarray(returns)
    return np.sqrt(periods) * r.mean() / r.std(ddof=1)
\`\`\`

Maths too — inline $\\sigma_p$ or as a block:

$$
\\mathrm{SR} = \\frac{\\mu - r_f}{\\sigma}
$$

Charts are images placed in this folder and referenced by relative path. A title in
quotes becomes the caption:

![Alt text describing the chart](./chart.svg "Caption shown under the chart")

## What it does not tell you

Every method has a limit. State it.

## How this shows up in a Taurus report

One paragraph tying the method to the block of the sample report it produces. Never a
market view.

## FAQ

### A question a reader would actually search for?

The answer, in a paragraph or two. This section is optional; if present it is rendered
as expandable items and emitted as FAQ structured data.
`;

await mkdir(dir, { recursive: true });
await writeFile(join(dir, 'index.md'), md);

console.log(`Created content/blog/${slug}/index.md (draft, author: ${author})`);
console.log(`Preview with: npm run dev  →  http://localhost:5173/blog/${slug}/`);

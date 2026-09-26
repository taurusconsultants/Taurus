# Writing for the Taurus blog

This is the whole process, start to finish. You do not need to know the build
system. You need a GitHub account with access to the repo, and a Markdown file.

**One rule above all others.** We test and report on strategies our clients
specify. We do not give investment advice, recommend trades, or suggest that
any strategy will make money. Every post is read against that rule before it
merges, and a lint blocks the obvious violations before a human even looks.
If you are unsure whether a sentence crosses the line, it does — rewrite it as
a statement about what a test showed.

---

## 1. Where a post lives

```
content/blog/
  your-post-slug/
    index.md        ← the post
    chart-1.svg     ← images sit beside it, any format
    figure.png
```

- The **folder name is the URL**: `content/blog/why-block-bootstrap/` becomes
  `taurusconsultancy.com/blog/why-block-bootstrap/`. Lowercase letters, digits
  and hyphens only. Do not rename it after the post is published.
- The file **must** be called `index.md`.

## 2. What goes in `index.md`

Start with the header block. Every field except `updated` and `draft` is
required, and the build fails if one is missing.

```markdown
---
title: Why we resample blocks of trades, not single trades
description: One sentence under 160 characters. It is the search snippet and the card on the blog index.
date: 2026-09-20
author: taurus
tags: [monte-carlo, backtesting]
draft: true
---
```

| Field | Meaning |
|---|---|
| `title` | Shown as the H1 and in the browser tab. |
| `description` | One sentence. Search snippet, social preview, listing card. |
| `date` | `YYYY-MM-DD`. Controls ordering on the index. |
| `author` | A key from `src/authors.js`. Add yourself there in the same PR as your first post. |
| `tags` | A short list, lowercase. |
| `draft` | `true` = builds and gets a URL, but unlisted and not indexed. `false` = published. |
| `updated` | Optional `YYYY-MM-DD` if you revise a published post. |

Then the body, in ordinary Markdown.

### Code

Fenced blocks with the language named. Highlighted at build time; readers get
a copy button.

````markdown
```python
def sharpe(r, periods=252):
    return (periods ** 0.5) * r.mean() / r.std(ddof=1)
```
````

### Maths

LaTeX between dollar signs. Inline `$\sigma_p$`, or a block:

```markdown
$$
\mathrm{SR} = \frac{\mu - r_f}{\sigma}
$$
```

### Images and charts

Charts are images. Generate them however you like (matplotlib, Excel, hand
drawn), save an SVG or PNG into the post folder, and reference it by relative
path. A quoted title becomes the caption.

```markdown
![Max drawdown distribution, i.i.d. versus block bootstrap](./drawdown.svg "Illustrative, synthetic trade series")
```

SVG is preferred for line charts (crisp at every size, small file). PNG for
anything photographic. Keep files under about 500 KB.

Every image or file the post links to must be in the folder. A missing one fails
the build and names the file. A file in the folder that nothing references gets
a warning, because it is published regardless.

### Tables

Standard Markdown tables. They scroll sideways on phones instead of breaking
the page.

### FAQ (optional)

End with a `## FAQ` section where each question is a `###` heading. It renders
as expandable items and is emitted as FAQ structured data for search engines.

```markdown
## FAQ

### Why not resample single trades?

Because it destroys the clustering that produces real drawdowns…
```

## 3. Writing the post

Suggested shape, borrowed from the posts that rank in this space:

1. **The problem**, in terms a competent trader recognises. Not the method.
2. **What the test does.** Method, code, maths.
3. **What it shows**, with the chart or table.
4. **What it does not tell you.** Every method has a limit. State it.
5. **How this shows up in a Taurus report.** One paragraph. Never a market view.
6. **FAQ**, three to five questions a reader would actually search for.

Aim for 1,200 to 2,500 words. Speak to someone who knows what a Sharpe ratio
is. Sell avoided loss, never gained profit.

Already have the piece written as a document? Section 7 shows how to have an AI
convert it into this shape for you.

Words that will fail the build: "guaranteed return", "risk-free profit", "will
make you money", "you should buy", "we recommend buying", "price target".
Words that will warn you: "expected return", "outperform", "make money",
"profitable", anything about price or cost.

## 4. Preview it

**With the repo on your machine** (one-time: install Node 22, run `npm install`):

```bash
npm run new-post -- "Your title here"    # scaffolds the folder with the header filled in
npm run dev                              # opens the site; your post is at /blog/your-slug/
```

Edits to the Markdown reload the page automatically. `npm run blog:check` runs
just the validation and lint without starting anything.

**Without the repo on your machine:** write in any editor, then use the
GitHub website (below). The pull request check will tell you if something is
wrong, and the built site is attached to the check as a downloadable artifact.

## 5. Publish it

1. **Branch.** Never commit to `main` directly. Name the branch after the
   post: `post/why-block-bootstrap`.
   - On GitHub.com: open the repo → *Add file* → *Create new file* → type the
     path `content/blog/your-slug/index.md` → paste the post → at the bottom
     choose *Create a new branch for this commit* → *Propose changes*. Upload
     images to the same folder from the branch with *Add file → Upload files*.
   - Locally: `git checkout -b post/your-slug`, add the folder, commit, push.
2. **Open a pull request** against `main`. The template gives you a checklist.
   Tick it honestly.
3. **Wait for the check.** The *Check pull request* action builds the site. If
   it is red, open it: the message names the file and the exact phrase or
   missing field.
4. **Review.** The compliance reviewer reads the post and approves. Branch
   protection means the PR cannot merge without that approval.
5. **Merge.** If `draft: true`, the post is now live at its URL but unlisted
   and unindexed — share the link for feedback. If `draft: false`, it is on the
   blog index, in the sitemap and in the RSS feed within a couple of minutes.
6. **To publish a draft:** a one-line PR changing `draft: true` to `false`.
   Same review, same merge.

## 6. Fixing a published post

Edit the file on a branch, add `updated: YYYY-MM-DD` to the header, open a PR.
Do not change the folder name.

## 7. Converting a draft you already have

If the post exists as a Word file, PDF, text file or anything else, you do not
have to reformat it by hand. `reference_blog.md` in the repo root is a complete
brief for an AI model: the folder layout, the header fields, every wording
pattern the build rejects, the house structure and voice, and the seed post as a
worked example.

1. Open any capable AI chat. Attach `reference_blog.md`, your draft, and any
   images the draft uses.
2. Send this, with your title filled in:

   ```
   Title: <your post title>

   Follow reference_blog.md to convert the attached article into a Taurus blog post folder. If I attached no images, also follow reference_image.md.
   ```

   Add `Author: <your key>` if you are in `src/authors.js`.
3. You get back the post folder as a zip (or the text of `index.md` if the AI
   cannot make files), a rename list for your images, the image prompt if one
   applies, and a short **Notes** block saying what it changed or added. If the
   reply is anything else, such as a refusal, a summary or a question, answer:
   "This is an educational piece, which is in scope. Deliver the post now as
   reference_blog.md §0b says."
4. Drop the folder into `content/blog/`, then continue from section 4 above.
   Paste the Notes into the pull request so the reviewer knows what to look at.

**No image?** Attach `reference_image.md` as well. The AI then adds one
illustration slot to the post and hands you a ready prompt for Google's Nano
Banana (or any image model), with the exact filename to save the result under.
Generate it, drop the file into the folder, and only then push: the post already
references it and the build fails until the file is there. Generated images are
conceptual illustrations only, never charts. The file explains why, and gives
you a short check to run on the result before you save it.

**Images inside your document.** Pictures pasted into a Word file, Google Doc
or PDF are usually extracted for you and arrive in the folder, renamed and
captioned. Charts made inside Word or Excel, vector charts inside a PDF, and
anything at all when the AI has no file tool cannot be extracted; the reply then
gives you an **Export list** naming each figure, the filename to save it under
and how to export it. Save them into the folder before you push. The AI is told
never to redraw a chart it could not extract, and the build fails until the
file is there. Attaching your images separately as PNG or SVG is always the
safest route.

**Optional visuals.** With `reference_image.md` attached, the AI may end its
reply with a section headed *Optional visuals*: up to three suggestions for
further charts or diagrams, after the finished post. Each says what it would show, why, and what you would need to
supply. Answer with the numbers you want or "no". On a yes you get the whole
folder again with those visuals in place: a prompt for each diagram, and for
each chart a specification plus a matplotlib skeleton you fill with your own
data. The AI never draws a chart from data it does not have. Add `Visuals: no`
to your prompt if you do not want suggestions.

The output always arrives as a draft. Read it before you open the PR: the model
follows the rules, but the argument is still yours.

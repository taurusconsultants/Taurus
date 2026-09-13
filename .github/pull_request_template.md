<!-- For a blog post: fill in the checklist. For anything else: delete it and describe the change. -->

## Post

- **Title:**
- **Folder:** `content/blog/<slug>/`
- **Status:** draft (`draft: true`) / ready to publish (`draft: false`)

## Author checklist

- [ ] The post describes **testing and reporting**. Nowhere does it say what to trade, suggest a strategy will make money, or present a backtest as an expectation of future returns.
- [ ] No price, rate, or mention of cost anywhere.
- [ ] Every number is labelled as backtested, simulated, or illustrative. Nothing is presented as a live result.
- [ ] One idea, argued fully. Not five ideas skimmed.
- [ ] It ends by pointing at the spec template or the contact form — not with a market view.
- [ ] Images have alt text. Anything not ours has a source.
- [ ] Frontmatter is complete: `title`, `description` (under 160 chars), `date`, `author` (a key in `src/authors.js`), `tags`.
- [ ] I ran `npm run blog:check` locally, or the **Check pull request** action is green.

## Reviewer

- [ ] Read in full against the positioning rule (CLAUDE.md → *Legal / positioning constraint*).
- [ ] Technical claims are correct.
- [ ] Approved.

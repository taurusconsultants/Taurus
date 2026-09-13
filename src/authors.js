/**
 * Blog authors.
 *
 * A post's frontmatter names its author by KEY (`author: taurus`). The key
 * must exist here or the build fails — a typo can't silently produce an
 * anonymous post.
 *
 * To add yourself: copy the example block, pick a short lowercase key, fill
 * it in, and include it in the same pull request as your first post.
 *
 *   name  — as it should appear on the byline
 *   role  — one line, e.g. "Quantitative developer"
 *   bio   — one or two sentences for the "About the author" block
 *   url   — optional; LinkedIn, GitHub or a personal site. Goes into the
 *           Person structured data as well as the byline link.
 */
export const authors = {
  taurus: {
    name: 'Taurus Research',
    role: 'The team',
    bio: 'Backtesting, optimisation and model evaluation for strategies our clients specify. We test and report; we do not advise.',
    url: '',
  },

  // example: {
  //   name: 'Full Name',
  //   role: 'Quantitative developer',
  //   bio: 'One or two sentences. What you work on, not a CV.',
  //   url: 'https://www.linkedin.com/in/…',
  // },
};

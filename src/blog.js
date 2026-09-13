/**
 * Entry point for the blog listing and every post.
 *
 * Deliberately tiny, like src/spec.js: the shared stylesheet, the KaTeX
 * stylesheet (maths is rendered to HTML at build time — this is only the
 * fonts and layout rules), and a copy button on code blocks. No GSAP, no
 * Lenis, no WebGL — a post is a document, and it should load like one.
 */

import './styles/main.css';
import 'katex/dist/katex.min.css';

for (const pre of document.querySelectorAll('.prose pre')) {
  const code = pre.querySelector('code');
  if (!code) continue;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'code-copy';
  btn.textContent = 'Copy';
  btn.setAttribute('aria-label', 'Copy code to clipboard');

  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(code.innerText);
      btn.textContent = 'Copied';
    } catch {
      btn.textContent = 'Select and copy';
    }
    setTimeout(() => { btn.textContent = 'Copy'; }, 1800);
  });

  pre.appendChild(btn);
}

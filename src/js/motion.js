/**
 * Scroll motion.
 *
 * GSAP + ScrollTrigger for reveals, Lenis for smooth scrolling. Roughly 45KB
 * gzipped for the three of them, which is the deliberate trade: the hero gets
 * one WebGL moment and everything below is cheap CSS-transform work.
 *
 * Two rules this file follows:
 *   1. Motion never gates the message. Reveals are short, and the headline is
 *      readable the instant it appears.
 *   2. Everything is skipped under prefers-reduced-motion, and the page is
 *      fully functional with this module absent entirely.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── header ─────────────────────────────────────────────────────────────── */
function initHeader() {
  const header = document.getElementById('siteHeader');
  if (!header) return;
  const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ── mobile nav ─────────────────────────────────────────────────────────── */
function initNav() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('siteNav');
  if (!toggle || !nav) return;

  const close = () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
  window.addEventListener('keydown', (e) => e.key === 'Escape' && close());
}

/* ── smooth scroll ──────────────────────────────────────────────────────── */
function initSmoothScroll(enabled) {
  if (!enabled || reduced()) return null;

  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.6,
  });

  // Lenis owns scrolling now — native smooth would fight it.
  document.documentElement.style.scrollBehavior = 'auto';

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

/* ── anchor links ───────────────────────────────────────────────────────── */
function initAnchors(lenis) {
  const offset = -84; // fixed header height
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    a.addEventListener('click', (e) => {
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset });
      else target.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth' });
    });
  });
}

/* ── hero intro ─────────────────────────────────────────────────────────── */
function initHero() {
  const lines = document.querySelectorAll('.hero-title .line-i');
  const bits = document.querySelectorAll('.hero .reveal');

  if (reduced()) {
    gsap.set(lines, { y: 0 });
    gsap.set(bits, { opacity: 1, y: 0 });
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.12 });
  tl.to('.hero .eyebrow', { opacity: 1, y: 0, duration: 0.6 })
    .to(lines, { y: 0, duration: 1.05, stagger: 0.09, ease: 'expo.out' }, '-=0.35')
    .to('.hero-lede', { opacity: 1, y: 0, duration: 0.75 }, '-=0.65')
    .to('.hero-cta', { opacity: 1, y: 0, duration: 0.65 }, '-=0.5')
    .to('.hero-points', { opacity: 1, y: 0, duration: 0.65 }, '-=0.45');
}

/* ── generic reveals ────────────────────────────────────────────────────── */
function initReveals() {
  const items = gsap.utils.toArray('.reveal:not(.hero .reveal)');

  if (reduced()) {
    gsap.set(items, { opacity: 1, y: 0 });
    return;
  }

  items.forEach((elm) => {
    gsap.to(elm, {
      opacity: 1,
      y: 0,
      duration: 0.85,
      ease: 'power3.out',
      scrollTrigger: { trigger: elm, start: 'top 88%', once: true },
    });
  });

  // Cards and grid children stagger together rather than one-by-one.
  ['.cards', '.approach-grid', '.market-tags', '.faq-list'].forEach((sel) => {
    const parent = document.querySelector(sel);
    if (!parent) return;
    const kids = parent.querySelectorAll('.reveal');
    if (!kids.length) return;
    ScrollTrigger.create({
      trigger: parent,
      start: 'top 84%',
      once: true,
      onEnter: () =>
        gsap.to(kids, { opacity: 1, y: 0, duration: 0.8, stagger: 0.07, ease: 'power3.out' }),
    });
  });
}

/* ── KPI counters ───────────────────────────────────────────────────────── */
function initCounters() {
  const tiles = document.querySelectorAll('.kpi-value[data-count]');
  if (!tiles.length) return;

  tiles.forEach((t) => {
    const target = parseFloat(t.dataset.count);
    const dec = parseInt(t.dataset.dec, 10) || 0;
    const suffix = t.dataset.suffix || '';

    if (reduced()) {
      t.textContent = target.toFixed(dec) + suffix;
      return;
    }

    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: t,
      start: 'top 92%',
      once: true,
      onEnter: () =>
        gsap.to(obj, {
          v: target,
          duration: 1.15,
          ease: 'power2.out',
          onUpdate: () => (t.textContent = obj.v.toFixed(dec) + suffix),
          onComplete: () => (t.textContent = target.toFixed(dec) + suffix),
        }),
    });
  });
}

/* ── equity line draw-in ────────────────────────────────────────────────── */
function initChartDraw() {
  const path = document.querySelector('.draw-in');
  if (!path || reduced()) return;
  const len = path.getTotalLength();
  gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
  gsap.to(path, {
    strokeDashoffset: 0,
    duration: 1.9,
    ease: 'power2.inOut',
    scrollTrigger: { trigger: path, start: 'top 85%', once: true },
  });
}

export function initMotion(cfg) {
  document.documentElement.classList.add('motion-ready');

  try {
    initHeader();
    initNav();
    const lenis = initSmoothScroll(cfg.smoothScroll);
    initAnchors(lenis);
    initHero();
    initReveals();
    initCounters();
    initChartDraw();
    ScrollTrigger.refresh();
  } catch (err) {
    // Never leave content stuck at opacity:0 because an animation failed.
    console.warn('[motion] failed, showing everything:', err);
    document.documentElement.classList.remove('motion-ready');
  }
}

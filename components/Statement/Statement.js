import React, { useEffect, useRef } from 'react';
import className from 'classnames/bind';
import styles from './Statement.module.scss';

let cx = className.bind(styles);

// Placeholder copy — the big headline reveals word-by-word on scroll, the two
// paragraphs below sit offset to the right (see layout ref).
const HEADLINE =
  'From scaling modern infrastructures to engineering smooth interactive experiences, I build modern WordPress products designed for longevity and performance.';

const LEAD =
  'We are dedicated to building products that solve real problems and drive measurable results. Our work is not just about aesthetics — it is about creating meaningful connections that last.';

const SUPPORT =
  'The team blends engineering, strategy, and design to ship solutions that stand out. We are committed to building systems that help you grow and keep people engaged long after launch.';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

// Per-word ease (matches GSAP's 'expo.out') — fast in, long gentle settle.
const easeExpoOut = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));

// Catch-up factor for the smoothed scrub. Lower = more lag / smoother; this
// approximates GSAP's `scrub: 1.2` (the animation eases toward the scroll
// position instead of tracking it frame-for-frame).
const SCRUB_SMOOTH = 0.085;

// Fraction of the sweep that is mid-transition at once. Wider than a single
// character, so the reveal edge is a soft gradient across several letters
// rather than a hard on/off — this is what keeps it from feeling brutal.
const FEATHER = 0.16;

export default function Statement() {
  const headlineRef = useRef(null);
  const charsRef = useRef([]);

  useEffect(() => {
    const chars = charsRef.current.filter(Boolean);
    if (!chars.length) return undefined;

    if (prefersReducedMotion()) {
      chars.forEach((el) => {
        el.style.opacity = '1';
        el.style.filter = 'none';
        el.style.transform = 'none';
      });
      return undefined;
    }

    let rafId = null;
    let current = 0; // smoothed progress (lags behind the scroll target)
    let painted = -1;

    const paint = (progress) => {
      const total = chars.length;
      const slice = 1 / total;
      // Each char's start offset (i * slice) eats into the range, so raw
      // progress can't drive the last letter to a full reveal. Stretch progress
      // across the true span so every letter resolves by the end of the band.
      const revealSpan = (total - 1) * slice + FEATHER;
      const scaled = progress * revealSpan;

      for (let i = 0; i < total; i += 1) {
        // Ease each letter individually (expo.out), like the GSAP reference.
        const p = easeExpoOut(clamp((scaled - i * slice) / FEATHER, 0, 1));
        const inv = 1 - p;
        // Soft ghost → sharp: gentler blur / skew / lift than the word version.
        chars[i].style.opacity = (0.22 + 0.78 * p).toFixed(3);
        chars[i].style.filter = `blur(${(inv * 4).toFixed(2)}px)`;
        chars[i].style.transform = `translateY(${(inv * 0.18).toFixed(
          3
        )}em) skewY(${(inv * 2).toFixed(2)}deg)`;
      }
    };

    // Continuous rAF loop (same approach as GalleryBanner): the reveal is bound
    // to the live scroll position every frame — a true scrub that runs forward
    // and backward with the scrollbar — not a one-shot trigger on visibility.
    // `current` eases toward the scroll target for a smooth, GSAP-scrub feel,
    // and it stays in sync with Lenis smooth scrolling.
    const frame = () => {
      const el = headlineRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;

        // Track the block's CENTER through the viewport so the resolve keeps
        // happening while the headline sits in the reading zone.
        const mid = rect.top + rect.height / 2;
        const start = vh * 0.95; // center at the bottom → nothing revealed
        const end = vh * 0.35; // center in the upper third → fully revealed
        const target = clamp((start - mid) / (start - end), 0, 1);

        current += (target - current) * SCRUB_SMOOTH;
        if (Math.abs(target - current) < 0.0005) current = target;

        if (Math.abs(current - painted) > 0.0002) {
          paint(current);
          painted = current;
        }
      }
      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  // Words stay whole for wrapping; letters inside animate individually. A flat
  // running index maps each letter to its slot in charsRef / the reveal sweep.
  const words = HEADLINE.split(' ');
  let charIndex = 0;

  return (
    <section className={cx('component')}>
      <h2 className={cx('headline')} ref={headlineRef}>
        {words.map((word, wi) => (
          <React.Fragment key={wi}>
            <span className={cx('word')}>
              {word.split('').map((ch, ci) => {
                const idx = charIndex;
                charIndex += 1;
                return (
                  <span
                    key={ci}
                    ref={(el) => {
                      charsRef.current[idx] = el;
                    }}
                    className={cx('char')}
                  >
                    {ch}
                  </span>
                );
              })}
            </span>
            {wi < words.length - 1 ? ' ' : ''}
          </React.Fragment>
        ))}
      </h2>

      <div className={cx('body')}>
        <p className={cx('lead')}>{LEAD}</p>
        <p className={cx('support')}>{SUPPORT}</p>
      </div>
    </section>
  );
}

import React, { useEffect, useRef } from 'react';
import className from 'classnames/bind';
import styles from './GalleryBanner.module.scss';

let cx = className.bind(styles);

// Seconds for one full loop at rest — matches the CSS baseline (slow).
const BASE_DURATION = 200;
// How strongly the marquee speed tracks scroll velocity. Kept small for a
// discrete nudge rather than a strong surge.
const SCROLL_FOLLOW = 0.35;
// Upper bound (px/s) on the scroll-driven boost, so a fast flick can't send the
// rows flying — keeps the effect subtle.
const MAX_BOOST = 320;
// Easing applied to the scroll velocity each frame (0..1); lower = smoother,
// longer tail after you stop scrolling.
const VEL_SMOOTHING = 0.09;

// Drop the image files in `public/gallery/` and reference them below as
// `/gallery/<file>` (Next serves the public/ folder from the URL root, so the
// `public` segment is NOT part of the src). Give each image its real intrinsic
// width/height so the row reserves space before the file loads (no layout
// shift). Rows scroll forever; direction alternates right / left / right.
const ROWS = [
  {
    direction: 'right',
    images: [
      { src: '/gallery/Soundkraft-Home.jpg', width: 1707, height: 904, alt: 'Soundkraft — music theme homepage' },
      { src: '/gallery/Home-Vinyl-Omnity.jpg', width: 800, height: 614, alt: 'Omnity — vinyl shop home' },
      { src: '/gallery/Creative-Agency-MediaFoundry.jpg', width: 1600, height: 873, alt: 'MediaFoundry — creative agency' },
      { src: '/gallery/Portfolio-Vertical-Sable.jpg', width: 1600, height: 847, alt: 'Sable — vertical portfolio' },
      { src: '/gallery/main-home.jpg', width: 1600, height: 867, alt: 'Homepage design' },
      { src: '/gallery/parallax.jpg', width: 1400, height: 900, alt: 'Parallax scrolling layout' },
      { src: '/gallery/00.jpg', width: 1707, height: 904, alt: 'Project screenshot' },
    ],
  },
  {
    direction: 'left',
    images: [
      { src: '/gallery/Designer-Home-Prequelle.jpg', width: 1600, height: 758, alt: 'Prequelle — designer home' },
      { src: '/gallery/Event-Countdown-Poize.jpg', width: 1600, height: 873, alt: 'Poize — event countdown' },
      { src: '/gallery/Production-Studio-MediaFoundry.jpg', width: 1600, height: 873, alt: 'MediaFoundry — production studio' },
      { src: '/gallery/Shop-Home-Sable.jpg', width: 1600, height: 847, alt: 'Sable — shop home' },
      { src: '/gallery/designer.jpg', width: 1600, height: 875, alt: 'Designer portfolio layout' },
      { src: '/gallery/home.jpg', width: 1356, height: 848, alt: 'Homepage layout' },
    ],
  },
  {
    direction: 'right',
    images: [
      { src: '/gallery/Home-Classic-Soundkraft.jpg', width: 1707, height: 904, alt: 'Soundkraft — classic home' },
      { src: '/gallery/vertical-pres.jpg', width: 1600, height: 900, alt: 'Vertical presentation layout' },
      { src: '/gallery/interactive-links.jpg', width: 858, height: 480, alt: 'Interactive links section' },
      { src: '/gallery/04.jpg', width: 1707, height: 904, alt: 'Project screenshot' },
      { src: '/gallery/2021-07-28_18h40_32-640x350.jpg', width: 640, height: 350, alt: 'Project screenshot' },
      { src: '/gallery/slider-rpes-l-1-748x418.webp', width: 748, height: 418, alt: 'Slider presentation' },
    ],
  },
];

function MarqueeItem({ image, duplicate }) {
  return (
    <figure
      className={cx('marquee-item')}
      // The second (duplicate) set is decorative — hide it from assistive tech
      // and blank its alt so the images aren't announced twice.
      aria-hidden={duplicate ? 'true' : undefined}
    >
      <img
        src={image.src}
        width={image.width}
        height={image.height}
        alt={duplicate ? '' : image.alt}
        loading="lazy"
        decoding="async"
      />
    </figure>
  );
}

function MarqueeRow({ direction, images }) {
  return (
    <div className={cx('marquee-row', `marquee-row--${direction}`)}>
      <div
        className={cx('marquee-track')}
        data-direction={direction}
        data-count={images.length}
      >
        {/* Real set — carries the descriptive alt text. */}
        {images.map((image, i) => (
          <MarqueeItem key={`real-${i}`} image={image} />
        ))}
        {/* Identical duplicate set — makes the -50% loop seamless. */}
        {images.map((image, i) => (
          <MarqueeItem key={`dup-${i}`} image={image} duplicate />
        ))}
      </div>
    </div>
  );
}

export default function GalleryBanner() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    // Respect reduced-motion: leave the (paused) CSS animation in place and
    // don't drive anything.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return undefined;

    // The seamless loop distance is the offset of the first duplicated figure:
    // real-set width + one gap. Item widths come from the img width/height
    // attributes, so this is stable even before the images finish loading.
    const measurePeriod = (el) => {
      const count = Number(el.dataset.count) || 0;
      const first = el.children[0];
      const dup = el.children[count];
      return dup && first ? dup.offsetLeft - first.offsetLeft : el.scrollWidth / 2;
    };

    const tracks = Array.from(section.querySelectorAll('[data-direction]')).map(
      (el) => {
        el.style.animation = 'none'; // take over from the CSS marquee
        return {
          el,
          dir: el.dataset.direction === 'left' ? 1 : -1,
          period: measurePeriod(el),
          pos: 0,
        };
      }
    );

    const onResize = () => {
      tracks.forEach((t) => {
        t.period = measurePeriod(t.el);
      });
    };
    window.addEventListener('resize', onResize);

    // Scroll velocity: accumulate scrolled pixels between frames, convert to
    // px/s each frame, then ease it so it decays smoothly once scrolling stops.
    let accum = 0;
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      accum += Math.abs(y - lastY);
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    let scrollVel = 0;
    let raf;
    let last = performance.now();
    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05); // clamp after tab switches
      last = now;

      const instVel = dt > 0 ? accum / dt : 0;
      accum = 0;
      scrollVel += (instVel - scrollVel) * VEL_SMOOTHING;

      tracks.forEach((t) => {
        if (t.period <= 0) return;
        const base = t.period / BASE_DURATION; // slow baseline, px/s
        const boost = Math.min(scrollVel * SCROLL_FOLLOW, MAX_BOOST);
        const speed = base + boost;
        t.pos = (t.pos + speed * dt) % t.period;
        // dir 1 (left) slides content left; dir -1 (right) slides it right.
        const x = t.dir === 1 ? -t.pos : t.pos - t.period;
        t.el.style.transform = `translateX(${x}px)`;
      });

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      tracks.forEach((t) => {
        t.el.style.animation = '';
        t.el.style.transform = '';
      });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={cx('gallery-banner')}
      aria-labelledby="gallery-title"
    >
      <h2 id="gallery-title" className="sr-only">
        Selected work
      </h2>
      {ROWS.map((row, i) => (
        <MarqueeRow key={i} direction={row.direction} images={row.images} />
      ))}
    </section>
  );
}

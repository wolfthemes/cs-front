import { useEffect, useRef } from 'react';
import className from 'classnames/bind';
import styles from './Signature.module.scss';

let cx = className.bind(styles);

// Signature draw-on-entrance — a vanilla stroke-dashoffset version of a GSAP
// DrawSVG effect (ported from the constantin-saguin project). Runs once on
// mount rather than on scroll, since it's the hero entrance.
export default function Signature({ className: extraClass }) {
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return undefined;

    const paths = Array.from(svg.querySelectorAll('path'));
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const TOTAL_DURATION = 2000; // ms for the full signature

    const lengths = paths.map((p) => p.getTotalLength() || 1);
    const totalLength = lengths.reduce((sum, l) => sum + l, 0);

    paths.forEach((path, i) => {
      path.style.strokeDasharray = lengths[i];
      path.style.strokeDashoffset = reducedMotion ? 0 : lengths[i];
    });

    if (reducedMotion) return undefined;

    let raf;
    const start = performance.now();
    const offsets = lengths.map((l) => (l / totalLength) * TOTAL_DURATION);
    const step = (now) => {
      const elapsed = now - start;
      paths.forEach((path, i) => {
        const pathStart = offsets.slice(0, i).reduce((s, d) => s + d, 0);
        const progress = Math.min(
          Math.max((elapsed - pathStart) / offsets[i], 0),
          1
        );
        path.style.strokeDashoffset = lengths[i] * (1 - progress);
      });
      if (elapsed < TOTAL_DURATION) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={cx(['component', extraClass])}>
      <svg
        ref={svgRef}
        viewBox="0 0 951 262"
        aria-label="Constantin Saguin signature"
      >
        <path d="M121,138.5c99.63-245.42-162.47,55.77-55.11,93.34,33.1,3.08,93.66-15.3,100.77-57.03,3.06-11.47-5.07-5.85-10.5-1.81-44.78,69.72,76.82,47.56,42.83-14.64-.86-8.33-23.78-23.28-29.89-17.39,4.67,20.55,49.91,11.08,61.58,7.94,48.08-21.66-9.31,75.08,24.14,54.59,6.44-4.88,11.09-12.8,17.15-19,7.65-16.19,5.73-13.82,3.15,3.5-10.65,32.45,37.41,6.13,45.13-3.5,14.24-18.28,7.65-25.8,21.34-3.5,8.44,7.53,7.94,31.67-3.5,38.59-4.45-11.34,14.64-30.13,24.6-38.59,25.66-20.8,48.58-81.35,53.78-100.67-3.94,11.28-25.47,93.94-21.48,121.67,7.17-22.57,26.9-63.79,62.77-73.73" />
        <path d="M528.8,170.5c-14.09-65.36-131.83,70.59-34.29,31.5,28.17-11.83,33.19-21.65,44.09-42.6-25.89,46.57,33.5,58.67,51.79,7.59-6.3,16.47,11.29,32.89,25.19,13.33-6.89,37.45,53.91,19.81,66.88,2.57" />
        <path d="M740.08,39.74c-4.47,22.31-88.62,137.57-25.09,153.26,36.67-1.42,61.4-28.36,80.01-55.28-28.74,36.29,6.55,47.09,39.61,29.27-.44,31.69,3.25-7.49,20.99,15.51,30.22-14.13,18.02,21.24,54.4-5.6" />
        <path d="M723.34,109.72c12.25-4.43,24.49-8.86,36.74-13.3" />
        <path d="M826.56,50.24c-.04,5.66-18.91,12.11-22.04,8.05" />
      </svg>
    </div>
  );
}

import React from 'react';
import className from 'classnames/bind';
import styles from './HomeHero.module.scss';

let cx = className.bind(styles);

// Explicit line breaks so the copy animates line by line (each is its own
// block with a staggered fade-in-up).
const LINES = [
  'I architect and scale WordPress products:',
  'Awwwards-nominated premium themes, custom plugins,',
  'WooCommerce solutions, and complete systems',
  'for creators, small businesses, and enterprises.',
];

const LINE_BASE_DELAY = 0.2; // seconds
const LINE_STAGGER = 0.15; // seconds between lines

// Render a line, setting the word "WordPress" in EB Garamond via `.wordpress`.
function renderLine(line) {
  return line.split(/(WordPress)/).map((part, i) =>
    part === 'WordPress' ? (
      <span key={i} className={cx('wordpress')}>
        {part}
      </span>
    ) : (
      part
    )
  );
}

export default function HomeHero() {
  return (
    <section className={cx('component')}>
      <p className={cx('intro')}>
        {LINES.map((line, i) => (
          <span
            key={i}
            className={cx('line')}
            style={{
              animationDelay: `${LINE_BASE_DELAY + i * LINE_STAGGER}s`,
            }}
          >
            {renderLine(line)}
          </span>
        ))}
      </p>
    </section>
  );
}

import React from 'react';
import className from 'classnames/bind';
import styles from './GalleryBanner.module.scss';

let cx = className.bind(styles);

// Drop the image files in `public/gallery/` and reference them below as
// `/gallery/<file>` (Next serves the public/ folder from the URL root, so the
// `public` segment is NOT part of the src). Give each image its real intrinsic
// width/height so the row reserves space before the file loads (no layout
// shift). Rows scroll forever; direction alternates right / left / right.
const ROWS = [
  {
    direction: 'right',
    images: [
      { src: '/gallery/row1-01.jpg', width: 1600, height: 900, alt: 'Selected work — screenshot 1' },
      { src: '/gallery/row1-02.jpg', width: 1400, height: 900, alt: 'Selected work — screenshot 2' },
      { src: '/gallery/row1-03.jpg', width: 1800, height: 900, alt: 'Selected work — screenshot 3' },
      { src: '/gallery/row1-04.jpg', width: 1500, height: 900, alt: 'Selected work — screenshot 4' },
    ],
  },
  {
    direction: 'left',
    images: [
      { src: '/gallery/row2-01.jpg', width: 1600, height: 900, alt: 'Selected work — screenshot 5' },
      { src: '/gallery/row2-02.jpg', width: 1920, height: 900, alt: 'Selected work — screenshot 6' },
      { src: '/gallery/row2-03.jpg', width: 1440, height: 900, alt: 'Selected work — screenshot 7' },
      { src: '/gallery/row2-04.jpg', width: 1600, height: 900, alt: 'Selected work — screenshot 8' },
    ],
  },
  {
    direction: 'right',
    images: [
      { src: '/gallery/row3-01.jpg', width: 1500, height: 900, alt: 'Selected work — screenshot 9' },
      { src: '/gallery/row3-02.jpg', width: 1700, height: 900, alt: 'Selected work — screenshot 10' },
      { src: '/gallery/row3-03.jpg', width: 1366, height: 900, alt: 'Selected work — screenshot 11' },
      { src: '/gallery/row3-04.jpg', width: 1800, height: 900, alt: 'Selected work — screenshot 12' },
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
      <div className={cx('marquee-track')}>
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
  return (
    <section className={cx('gallery-banner')} aria-labelledby="gallery-title">
      <h2 id="gallery-title" className="sr-only">
        Selected work
      </h2>
      {ROWS.map((row, i) => (
        <MarqueeRow key={i} direction={row.direction} images={row.images} />
      ))}
    </section>
  );
}

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

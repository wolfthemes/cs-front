# Gallery images

Drop the marquee screenshots in this folder.

- These are served from the URL root, so a file here named `row1-01.jpg`
  is referenced in code as `/gallery/row1-01.jpg` (no `public/` in the path).
- Filenames are wired up in `components/GalleryBanner/GalleryBanner.js`
  (the `ROWS` array) — rename there or rename the files to match.
- Use landscape screenshots of varying aspect ratios; keep the intrinsic
  `width`/`height` in the `ROWS` data accurate so rows reserve space and don't
  shift as images load.

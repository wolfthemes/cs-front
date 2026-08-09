# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Headless frontend for the personal resume site **constantin.saguin.com**, built with **Faust.js** (Next.js Pages Router + headless WordPress over WPGraphQL/Apollo). Content comes from a remote WordPress install; this repo is only the React frontend. Bootstrapped from the FaustWP `next/faustwp-getting-started` example, then heavily customized into a bespoke single-page resume experience.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Next.js dev server on http://localhost:3000 |
| `npm run build` | `faust build` — production build |
| `npm run start` | `faust start` — serve the production build |
| `npm run generate` | Regenerate `possibleTypes.json` from the live WP GraphQL schema |
| `npm run lint` | ESLint (JS/JSX) |
| `npm run lint:styles` | Stylelint over all `**/*.scss` |
| `npm run format` / `format:check` | Prettier write / check |

There is no test suite. `npm run generate` (and `stylesheet`) hit the WordPress endpoint, so they need `.env.local` populated.

## Environment

Copy `.env.local.sample` → `.env.local` and set:
- `NEXT_PUBLIC_WORDPRESS_URL` — the WordPress origin (also whitelisted for `next/image` via `getWpHostname()`).
- `FAUST_SECRET_KEY` — Faust plugin secret from WP Settings → Faust (required for previews/auth).

The connected WordPress needs the **FaustWP** and **WPGraphQL** plugins.

## Architecture

**Routing is delegated to Faust, not Next pages.** `pages/[...wordpressNode].js` is the catch-all: it calls `getWordPressProps` and renders `<WordPressTemplate>`, which resolves the WP "seed node" for the URL and picks a template. `getStaticPaths` returns `fallback: 'blocking'` (no paths pre-listed). `pages/preview.js` renders the same template tree for authenticated previews; `pages/api/faust/[[...route]].js` mounts Faust's auth/preview API.

**Templates live in `wp-templates/` and are registered in `wp-templates/index.js`**, which is wired into Faust via `faust.config.js`. Keys (`front-page`, `page`, `single`, `category`, `tag`) map to WP template hierarchy. `front-page.js` is the actual resume homepage and composes the section components (`HomeHero`, `GalleryBanner`, `Statement`, `CaseStudies`, `Playground`, `Contact`).

**Each template is a component that owns its GraphQL query.** Pattern: `Component.query` is a `gql` document, `Component.variables()` returns its variables, and the component reads data with `useQuery(Component.query, ...)`. Queries compose fragments — reusable ones live in `fragments/` (e.g. `BlogInfoFragment`) and components expose their own via `Component.fragments.entry` (e.g. `NavigationMenu.fragments.entry`). Menu location enums are in `constants/menus.js`.

**`possibleTypes.json`** is generated from the WP schema and passed to the Apollo cache (via `faust.config.js`) so fragments on interfaces/unions match correctly. Regenerate with `npm run generate` after schema changes.

## Components

- Every component is a folder: `ComponentName/ComponentName.js` + `ComponentName.module.scss` + `index.js` (barrel re-export). `components/index.js` re-exports all of them, so import from `'../components'`, not deep paths.
- Styling uses **CSS Modules + `classnames/bind`**: `let cx = classNames.bind(styles)` then `cx('foo', { active })`. Class names in SCSS use kebab-case (Stylelint's `selector-class-pattern` is disabled to allow this and BEM-ish names).
- This is a headless site so there is no `current-menu-item` class from WordPress; `NavigationMenu` derives the active link from the current route (`normalizePath`) instead of `cssClasses`.
- Animation is hand-rolled with `requestAnimationFrame` + `IntersectionObserver` and always guards `prefers-reduced-motion` (see `HomeHero` count-up / staggered line reveals). `motion` and `lenis` (smooth scroll, used in `Statement`) are available deps.

## Styles

- Global entry is `styles/global.scss`, which `@import`s the partials in order: `breakpoints`, `css-variables`, `tokens`, `fonts`, `base`, `blocks`, `utilities`. Imported once in `pages/_app.js`.
- **`_css-variables.scss` is the only file that emits a real `:root {}` block** (the `--wpe--*` design tokens — colors, font sizes, weights). `_tokens.scss` and `_breakpoints.scss` are Sass-only aliases/functions (`$c-accent`, `$breakpoint-*`, `fs()`, `fw()`) that compile to nothing, so they are safe to `@import` from any `.module.scss` without duplicating CSS. Module SCSS files typically `@import 'tokens'` / `'breakpoints'` and reference `$c-*` / `fs()` rather than raw `var(--wpe--...)`.
- Indentation is **tabs** (WordPress coding standard, enforced by `.editorconfig`); JSON/YAML use 2-space.

## Fonts

Loaded in `pages/_app.js` via `next/font`: the full **Geist** family (Sans, Mono, and the Pixel variants) plus **EB Garamond** (Google, serif accent). Each is exposed as a CSS variable (`--font-geist-sans`, `--font-eb-garamond`, etc.) on the `.app-shell` wrapper `<div>`, and SCSS references those variables. Geist ships prebuilt `next/font/local` files, which is why `transpilePackages: ['geist']` is set in `next.config.js`.

## WSL2 note

`next.config.js` forces webpack polling (`config.watchOptions.poll`) in dev because inotify doesn't fire reliably on the `/mnt/c` Windows-mounted filesystem. Leave it in place when developing on WSL2; hot reload misses edits without it.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

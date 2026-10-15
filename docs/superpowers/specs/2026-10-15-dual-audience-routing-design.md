# Dual-audience routing: home hub, `/services`, `/engineering`

## Goal
Serve two audiences without diluting the premium tone:
- **End-clients** (SMEs, artisans, independent businesses): plain language, outcomes, clear prices, easy path to a quote.
- **Recruiters / agencies / tech leads**: stack, proof, architecture, availability, CV.

Nothing is removed from the site. Content is re-ordered, moved to the audience that needs it, and some is added.

## Decisions (agreed)
- New static page `/engineering` (nav label "Engineering" / "Ingénierie") for the technical audience.
- Hero primary CTA: "Get a free quote" -> `/services`. Secondary CTA: "For teams & recruiters" -> `/engineering` (CV download moves there).
- Existing `#about` anchor on the home page is kept.

## Homepage (`wp-templates/front-page.js`)
Order: HomeHero, GalleryBanner, Statement, CaseStudies, **Paths (new)**, Contact.
- **HomeHero:** CTA labels/targets as above. The "Hiring?" line keeps its contact link.
- **Statement:** unchanged (personal story builds client trust).
- **CaseStudies:** add a one-line client outcome per project (copy supplied in i18n).
- **Playground:** removed from home, rendered on `/engineering` instead (component reused as-is).
- **Paths (new component):** two cards. "I need a website" -> `/services`; "I'm hiring / need a senior dev" -> `/engineering`.
- **Contact:** lead text made neutral (projects and roles), no longer recruiter-first.

## `/services` (`components/Services`)
Commercial, solution-first, client wording.
- Offer cards: one-line business benefit on top; stack terms demoted to a small "Under the hood" line. E.g. "Gutenberg / FSE" -> "an editor your team can use without breaking anything"; "Headless" -> "a very fast site, same editor as today".
- Add: "Who this is for" line, reassurance block (fixed quote, no surprises, handover), "how you'll update it yourself" note.
- "Why work with me": keep client-worded items; move "Engineering, not page-building" and "Fast by default" to `/engineering`.
- Prices ($750 / $2,000 / $3,500 / $4,000), process, FAQ, proof, "Not sure?" card unchanged. CV line now links to `/engineering`.

## `/engineering` (new)
- `pages/engineering.js`, same shape as `pages/services.js` (static page, `SITE_CHROME_QUERY` for footer, `getNextStaticProps`).
- New `components/Engineering/` (`Engineering.js`, `.module.scss`, `index.js`), exported from `components/index.js`.
- Sections: intro + availability (remote, CEST, EU/US time zones), proof stats (WolfThemes, 36,000+ licenses, 4.5/5 over 1,600+ reviews), Playground stack grid, engineering principles (OOP/PSR-4, Composer, WP-CLI, CI/CD, Core Web Vitals), "Roles I'm open to" (contract / full-time, remote), architecture note (why this site is headless), CV downloads EN/FR, contact CTA with topic preset to Hiring.
- Open items needing the owner's input: exact "Roles I'm open to" wording and the architecture example.

## Shared
- `lib/i18n.js`: new `engineering`, `paths` blocks; updated `nav` (add `engineering`), `hero`, `contact`, `services`, case-study outcomes; EN and FR in parity.
- `components/Header/Header.js`: add Engineering nav entry (header menu is fixed, labels from i18n).
- `components/SEO`: title/description for `/engineering`.
- GA events follow the existing `track('cta_click', { location, target })` pattern.

## Constraints
- Follow repo conventions: component folder + barrel, CSS Modules with `classnames/bind`, tab indentation, `prefers-reduced-motion` guards.
- No test suite; verify with `npm run lint`, `npm run lint:styles`, `npm run build`, and a manual pass of `/`, `/services`, `/engineering` in EN and FR at desktop and mobile widths.
- Copy drafts (EN/FR) are reviewed by the owner before being merged.

## Out of scope
New WordPress content types, CMS-driven copy, redesign of existing sections, changes to the contact API.

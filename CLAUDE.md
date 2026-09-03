# Sweet / Salty

A static recipe website (cookies, pastry, desserts) migrated from Webflow to
plain HTML/CSS/JS. No build system, no framework, no package.json.

- **Live site:** https://sweetsalty.info
- **GitHub Pages:** https://razco7.github.io/sweetsalty (custom domain via IONOS DNS)
- **Local dev:** `python3 -m http.server 3456` from the project root (or use
  the Browser pane's `preview_start` with the `sweet-salty` launch config)

## Structure

```
index.html                 Homepage (hero, featured recipes, France banner, about teaser)
about.html, contact.html   Static pages
all-recipes.html           All recipes grid (rendered dynamically, see below)
404.html                   Custom 404 — no header/footer, full-bleed photo background
recipe-pages/*.html        One page per recipe
collection-pages/*.html    One page per tag (cookie, france, easy-level, etc.)
css/styles.css             Single stylesheet for the whole site
js/main.js                 Single script for the whole site
images/                    All photos + logo/icon SVGs
fonts/                     Self-hosted Poppins woff2 (300/400/500/600/700, latin subset)
```

## Critical convention: cache-busting version query strings

Every page links `css/styles.css?v=N` and `js/main.js?v=N`. **Bump the
number whenever you edit either file**, across *every* HTML file that
references it, or GitHub Pages / browsers will keep serving stale cached
versions. Use a one-liner like:

```bash
grep -rl 'styles.css?v=OLD' . --include="*.html" | xargs sed -i '' 's/styles\.css?v=OLD/styles.css?v=NEW/g'
```

## Recipe data: single source of truth

`ALL_RECIPES` in `js/main.js` drives **all-recipes.html** and every
**collection-pages/*.html** grid — they render dynamically by filtering
this array on a tag (`data-tag="Cookie"` etc. on the `.recipe-grid` div).
**Adding a recipe only requires one entry in `ALL_RECIPES`** — it then
automatically appears in All Recipes, every matching collection page, and
search. Do not hand-write recipe cards into collection pages.

Each entry: `{ title, img, desc, tags: [...], page, popular, date }`.
- `tags` must exactly match existing tag names (see `TAG_LINKS` for the
  full list and which collection page each tag routes to).
- `date: 'YYYY-MM-DD'` (optional) shows a green "New!" badge and sorts the
  recipe to the front of every grid for 30 days after that date.
- `popular: true` shows a purple "Popular Recipe" badge.

The homepage's "Selected cookie recipes" section is a hand-curated, static
4-card list — not driven by `ALL_RECIPES`. Leave it as editorial curation
unless asked to change it.

## Adding a new recipe page

Copy the structure of an existing simple recipe (e.g.
`recipe-pages/italian-s-cookies.html` or `vanillekipferl.html`) rather than
building from scratch — every recipe page shares: navbar, mobile nav,
search overlay, `.recipe-hero` (photo | colored info panel), meta row
(Yield/Prep/Baking/Total time), "What you'll need" + "Ingredients"
sections, numbered Instructions, and a "Tips & Notes" box.

- Recipe photos are square JPEGs, resized to **800×800**, JPEG quality
  ~78 (`sips -Z 800 -s formatOptions 78`). Don't use full-resolution
  exports — see Image optimization below.
- `--recipe-accent` (inline style on `.recipe-hero`): prefer a
  **complementary** pastel color, not necessarily the exact photo
  background — e.g. Sablé is green, Croissant is purple, Muhallebi is
  purple, despite none of those photos having that background color.
- Remember to also add the recipe to `ALL_RECIPES` in `main.js` — the page
  existing alone doesn't make it discoverable anywhere.

## Cookie consent / Google Analytics

GA4 (`G-61EPP7DCVE`) is **not** loaded unconditionally. `main.js` shows a
cookie-icon banner on first visit; GA only loads after the visitor clicks
Accept. Declining persists via `localStorage.cookieConsent`. A "Cookie
preferences" link is injected into every page's footer (inside
`.footer-copyright`, not as a separate flex child — `.footer-bottom`
depends on having exactly 2 children for its `space-between` layout) so
visitors can reopen the banner anytime. Don't reintroduce a bare
`<script src="...gtag/js...">` in any page's `<head>` — that would bypass
consent entirely.

## Image optimization

Keep images lean — this site has been through a deliberate performance
pass (Lighthouse mobile Performance went from 66 to ~88):
- Recipe/card photos: 800×800, quality ~78.
- Full-bleed backgrounds (404 page, homepage ingredients photo): resize to
  roughly what's actually displayed (1600–1920px wide), same quality.
- Add `loading="lazy" width="…" height="…"` to any below-the-fold `<img>`.
  Recipe hero photos (above the fold) should stay eager.
- `sips` (macOS built-in) is the simplest tool: `sips -Z <maxdim> -s
  formatOptions <quality> file.jpg --out file.jpg`.

## Fonts

Poppins is self-hosted from `fonts/*.woff2` via `@font-face` in
`styles.css` — **do not** re-add a Google Fonts `<link>`. If a new font
weight is ever needed, download the "latin" subset only (this site is
English-only) from a modern-UA `fonts.googleapis.com` CSS response.

## Known LCP-sensitive spot

The homepage's rotating hero word (`.word-box` / `.word-mover` /
`.rotating-word`, the "It's always time for **[word]**" white box) has
explicit CSS heights per breakpoint so it paints immediately without
waiting on JS. If you touch `.hero-title` font-size/line-height at any
breakpoint, you must recompute and update the matching `.word-box` height
(`line-height + 22px + 26px` padding) at that breakpoint, or the box will
be visibly wrong-sized for one frame before JS corrects it.

## Design conventions

- Brand colors: `--coral: #ff9975`, `--green: #1DB975`, `--bg-alt:
  #F8F4EE`, `--border: #E8E3DB`. **Do not use `--accent` (#C4952C, a
  golden-brown)** — it was deliberately removed from all button hover
  states; dark pill buttons hover to `#333` instead.
- Grid breakpoints: recipe-grid is 4 cols by default, 5 at ≥1440px, 6 at
  ≥1920px (3 at ≤1100px, 2 at ≤900px, 1 at ≤500px).
- Mobile nav (hamburger) kicks in at ≤900px — deliberately higher than the
  usual 768px, because the desktop nav items (All recipes / Top
  collections dropdown / About / Contact / Buy us a coffee) don't fit
  without wrapping below ~860px.
- All font sizes are in `px`, not `rem`/`em`, sitewide (converted
  deliberately — don't reintroduce rem/em).

## Contact form

Submits to Formspree (`https://formspree.io/f/xvzjogvk`) via `fetch()` in
`main.js`. Notification recipients are managed in the Formspree
dashboard (Overview → Linked Emails / Workflow → Actions → Email), not in
this codebase.

## Git / deploy workflow

Every change is committed and pushed directly to `main` — GitHub Pages
serves straight from it, no CI/build step. Always bump CSS/JS version
query strings (see above) in the same commit as the change, or the deploy
will appear not to have worked due to caching.

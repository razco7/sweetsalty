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
images/                    All photos + logo/icon SVGs + sweet-salty-logo.png (favicon source)
fonts/                     Self-hosted Poppins woff2 (300/400/500/600/700, latin subset)
sitemap.xml, robots.txt    Generated — see SEO & structured data below
scripts/*.py               SEO generators + the Search Console report (see scripts/README.md)
data/*.json                Hand-maintained inputs the generators can't derive on their own
                           (recipe-meta, pin-titles, meta-description-overrides, recipe-ideas)
reports/*.md               Weekly Search Console reports (auto-committed, see below)
pins/                      Generated Pinterest pin images + bulk-upload CSV (see scripts/README.md)
.github/workflows/         Weekly Search Console report + an on-demand sitemap check
.claude/commands/          Custom slash commands (see "Weekly recipe pipeline" below)
```

## Critical convention: cache-busting version query strings

Every page links `css/styles.css?v=N` and `js/main.js?v=N`. **Bump the
number whenever you edit either file**, across *every* HTML file that
references it, or GitHub Pages / browsers will keep serving stale cached
versions. Use a one-liner like:

```bash
grep -rl 'styles.css?v=OLD' . --include="*.html" | xargs sed -i '' 's/styles\.css?v=OLD/styles.css?v=NEW/g'
```

`favicon.png` and `apple-touch-icon.png` carry `?v=N` too (browsers cache
favicons especially hard). Bump those the same way if either image
changes — currently `?v=2`.

## Favicon

`favicon.png` (96×96, circular, transparent corners) and
`apple-touch-icon.png` (180×180, solid square) are both generated from
`images/sweet-salty-logo.png` (512×512, the green-square face logo). The
favicon is the logo scaled to ~86% on its own green, then masked to the
inscribed circle; the Apple icon is the plain square (iOS masks it to a
rounded rect itself and renders any transparency as black, so it must
stay opaque). Regenerate both with a short Pillow script — circle-crop
for the favicon, straight resize for the Apple icon — and bump the
`?v=N` on every page (see cache-busting above).

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
  recipe to the front of every grid for 7 days after that date (`NEW_BADGE_DAYS`
  in `main.js`).
- `popular: true` shows a purple "Popular Recipe" badge.

The homepage's "Selected cookie recipes" section is a hand-curated, static
4-card list — not driven by `ALL_RECIPES`. Leave it as editorial curation
unless asked to change it.

`ALL_RECIPES` currently lives inside `main.js`, which every page loads.
That's fine at this size but becomes a payload problem past roughly 100
recipes — the future fix is moving it to `data/recipes.json` and fetching
it only on the pages that render lists (all-recipes + collection pages),
not on every recipe/static page.

## Weekly recipe pipeline

`/new-recipe` (`.claude/commands/new-recipe.md`) is a two-phase workflow
for adding one recipe a week. **Phase 1** (no args) reads `ALL_RECIPES`,
`data/recipe-ideas.json`, and the newest `reports/` file, computes
coverage by country/type/difficulty/Sweet-Salty, and proposes 5
candidates against a fixed set of selection rules (fill each represented
country to 4 before opening new ones; new countries enter in blocks of 4;
favour uncommon-but-searched dishes; weight for seasonality 6–8 weeks
out). It writes nothing except logging the 5 as `proposed` in
`data/recipe-ideas.json`, then stops. **Phase 2** (`build <slug>`) builds
one approved idea end to end — recipe page, `ALL_RECIPES` entry, the three
`data/*.json` entries, a country collection page if one doesn't exist
yet, all four SEO generators, the pin, cache-buster bump — pausing once
for Raz to supply the photo, and ending with a PR (never a merge).

`data/recipe-ideas.json` is an append-only log (`proposed` / `rejected` /
`published`) — **never pruned**; it's the long-term memory of what's been
considered and why.

## Adding a new recipe page

For the normal weekly cadence, use `/new-recipe build <slug>` (see "Weekly
recipe pipeline" above) — it automates everything below. This section is
the manual reference it's built from.

Copy the structure of an existing simple recipe (e.g.
`recipe-pages/italian-s-cookies.html` or `vanillekipferl.html`) rather than
building from scratch — every recipe page shares: navbar, mobile nav,
search overlay, `.recipe-hero` (photo | colored info panel), meta row
(Yield/Prep/Baking/Total time), "What you'll need" + "Ingredients"
sections, numbered Instructions, and a "Tips & Notes" box.

- Recipe photos need **two files** from one square source of at least
  1600×1600: `images/X.jpg` at 800×800, quality ~78
  (`sips -Z 800 -s formatOptions 78`) for the card-grid thumbnail, and
  `images/X@2x.jpg` at 1600×1600 (the source as-is — re-encoding it
  rarely shrinks a real photo meaningfully, so don't bother) for the
  Retina/HiDPI hero. The `.recipe-hero-photo img` tag needs both, via
  `srcset="images/X.jpg 800w, images/X@2x.jpg 1600w" sizes="(max-width:
  768px) 100vw, 50vw"` (that breakpoint/ratio matches `.recipe-hero`'s
  actual grid columns in `styles.css` — confirm it hasn't changed rather
  than assuming). Card-grid `<img>` tags (rendered by `main.js`) only
  ever need the 800px file — don't add srcset there. See Image
  optimization below for why 800px alone looked soft on Retina screens.
- `--recipe-accent` (inline style on `.recipe-hero`): prefer a
  **complementary** pastel color, not necessarily the exact photo
  background — e.g. Sablé is green, Croissant is purple, Muhallebi is
  purple, despite none of those photos having that background color.
- Remember to also add the recipe to `ALL_RECIPES` in `main.js` — the page
  existing alone doesn't make it discoverable anywhere.
- Add a matching entry to `data/recipe-meta.json` (`prepTime`, `cookTime`,
  `totalTime`, `recipeYield`, `author`, `datePublished` — see SEO &
  structured data below) and re-run the four generator scripts. A new
  recipe with no `recipe-meta.json` entry makes `generate_schema.py` fail
  loudly rather than ship broken schema — that's intentional.
- If generating a Pinterest pin for it: add a search-friendly title to
  `data/pin-titles.json` and re-run `scripts/generate_pins.py` (falls
  back to the site title, flagged, if skipped — see scripts/README.md).

## SEO & structured data

Four scripts (in `scripts/`, full docs in `scripts/README.md`) generate
everything SEO-related from data that already exists elsewhere in the
repo — none of them invent content, and all are safe to re-run any time.
**After adding, removing, re-tagging, or editing a recipe, re-run all
four** (order doesn't matter) before committing:

```bash
python3 scripts/generate_schema.py        # Recipe JSON-LD on every recipe page
python3 scripts/generate_sitemap.py       # sitemap.xml from the real page inventory
python3 scripts/generate_static_links.py  # <noscript> fallback links on listing pages
python3 scripts/add_seo_tags.py           # canonical URL + meta description on every page
```

- `generate_schema.py` parses each recipe page's own DOM for description,
  ingredients, and instructions, and pulls `prepTime`/`cookTime`/
  `totalTime`/`recipeYield`/`author`/`datePublished` from
  `data/recipe-meta.json` (fails loudly per-field if an entry is missing
  — never guesses). `dateModified` comes from the page's last git commit.
- `add_seo_tags.py` derives `<meta name="description">` from each page's
  `og:description`, trimmed to whole sentences that fit Google's
  ~155–160 character snippet. If a recipe's first sentence alone runs
  over that, add a hand-written replacement to
  `data/meta-description-overrides.json` rather than editing the
  on-page copy.
- Never hand-write JSON-LD, canonical tags, sitemap entries, or the
  static fallback links directly into a page — they'll just get
  overwritten (or drift) on the next generator run.

## Search Console reporting

`scripts/search_console_report.py` pulls 28 days of Search Console data
and writes a ranked report to `reports/`; `.github/workflows/search-console-report.yml`
runs it every Monday and commits the result automatically — this runs on
GitHub's servers, not in any chat session, so nothing surfaces on its own.
Needs `GSC_SERVICE_ACCOUNT_FILE`/`GSC_SERVICE_ACCOUNT_JSON` and
`GSC_SITE_URL` (repo secrets for the workflow, env vars locally) — full
setup in `scripts/README.md`. **`GSC_SITE_URL` must be
`sc-domain:sweetsalty.info`**, not the browser URL — `sweetsalty.info`
is a Domain property, and the URL form authenticates fine but then fails
every query with a 403 that reads like a permissions bug.

To check whether Google has actually fetched the sitemap yet, without
opening Search Console's UI: `gh workflow run check-sitemap-status.yml`
(same credentials, `scripts/check_sitemap_status.py`, manual dispatch
only — no schedule) — read the result with `gh run view <id> --log`.

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
- Recipe/card photos: 800×800, quality ~78 — **plus** a 1600×1600
  `@2x` sibling for the hero photo's `srcset`, see "Adding a new recipe
  page" above. **Sizing for a display's CSS pixel width alone isn't
  enough** — a Sept 2026 pass shrank these to 800px reasoning they'd
  "still be crisp at ~700px in the hero," which is only true at 1
  physical pixel per CSS pixel. Any Retina/HiDPI screen (most modern
  Macs and phones) renders at 2-3x that, so the hero photos looked
  visibly soft until the `@2x` variant was added. When sizing any
  above-the-fold image in the future, size for `display width × 2`,
  not just display width.
- Full-bleed backgrounds (404 page, homepage ingredients photo): resize to
  roughly what's actually displayed (1600–1920px wide), same quality.
- Add `loading="lazy" width="…" height="…"` to any below-the-fold `<img>`.
  Recipe hero photos (above the fold) should stay eager.
- `sips` (macOS built-in) is the simplest tool: `sips -Z <maxdim> -s
  formatOptions <quality> file.jpg --out file.jpg`.

## Site verification tags

Two files/tags exist purely to prove domain ownership to third parties —
don't remove either, and don't be confused by what looks like dead
weight:
- `googlebc8928ca4194ad24.html` (project root) — Google Search Console
  verification. Its entire content is one line identifying itself; it's
  never linked from anywhere on the site.
- `<meta name="p:domain_verify" ...>` in `index.html`'s `<head>` —
  Pinterest's domain claim, checked only on the homepage.

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
- **Every country tag has its own `collection-pages/<country>-recipes.html`**,
  however few recipes it holds — no country routes to a broader page like
  `sweet-recipes.html`. A one-recipe collection is fine; the point is that
  clicking a country tag always lands somewhere that page is *about* that
  country.
- On a card, a tag pointing at the page you're already viewing renders as
  `<span class="tag tag--static">` (muted, no link) instead of a self-link
  that reloads the same page — handled in `recipeCardHTML` in `main.js`.

## Contact form

Submits to Formspree (`https://formspree.io/f/xvzjogvk`) via `fetch()` in
`main.js`. Notification recipients are managed in the Formspree
dashboard (Overview → Linked Emails / Workflow → Actions → Email), not in
this codebase.

## Git / deploy workflow

Every change is committed and pushed directly to `main` — GitHub Pages
serves straight from it, no CI/build step. Always bump CSS/JS version
query strings (see above) in the same commit as the change, or the deploy
will appear not to have worked due to caching. Same rule for recipe
content: re-run the four SEO generator scripts (see above) in the same
commit as any recipe edit, or the live page's schema/description will
silently go stale.

**Any commit that changes a convention, adds/renames a script or
workflow, or changes how something is set up must update the relevant
doc — `CLAUDE.md`, `scripts/README.md`, or the root `README.md` — in
that same commit, not as a follow-up.** Docs that lag the code are worse
than no docs, because they're trusted by default.

---
description: Weekly recipe pipeline — propose ideas (Phase 1), then build an approved one (Phase 2)
argument-hint: "(nothing) for Phase 1  |  build <slug> for Phase 2"
---

# New recipe pipeline

A two-phase weekly workflow. **Stop between phases** — Raz approves ideas before
anything is written, and reviews the PR before it merges.

- **No arguments** → run **Phase 1** (propose ideas only).
- **`build <slug>`** → run **Phase 2** for an idea already logged as `proposed`
  and picked by Raz. If `recipe-pages/<slug>.html` already exists, you are
  **resuming** Phase 2 after Raz saved the image — jump to "Phase 2, part B".

Arguments given: `$ARGUMENTS`

Today's date is available in the environment — use it verbatim wherever a date is
needed. Never invent a date.

---

## Phase 1 — propose ideas only

### Read first (no writes yet)

1. `ALL_RECIPES` in `js/main.js` — the full published list and its tags.
2. `data/recipe-ideas.json` — the idea log. **If it doesn't exist, create it** as
   `[]` and proceed.
3. The newest file in `reports/` if any exist (`reports/YYYY-MM-DD-search-console.md`)
   — factor any content-gap / striking-distance queries into what you propose.

### Compute and show coverage

Parse `ALL_RECIPES` and tally counts across four dimensions. Tags fall into fixed
buckets — everything not in one of these is a **country**:

- **Type**: `Cookie`, `Pastry`, `Cake`, `Dessert`, `Breakfast`
- **Difficulty**: `Easy`, `Moderate`, `Hard`
- **Sweet/Salty**: `Sweet`, `Salty`
- **Country**: whatever tag is left (`France`, `Italy`, `USA`, `Middle East`,
  `Austria`, `Denmark`, `Germany`, `Netherlands`, …)

Show Raz four small markdown tables (country / type / difficulty / sweet-salty)
with current counts, then the proposals.

**Baseline on 2026-09-09** (recompute every run — treat this only as a sanity
check that your parse is right): France 6, Italy 3, USA 3, Middle East 2,
Austria 2, Denmark 1, Germany 1, Netherlands 1 · Cookie 9, Pastry 6, Breakfast 2,
Cake 1, Dessert 1 · Easy 9, Moderate 9, Hard 1 · Sweet 17, Salty 2.

### Selection rules — in priority order

1. **Fill represented countries to 4 before opening any new country.** Backlog as
   of 2026-09-09: Italy +1, USA +1, Middle East +2, Austria +2, Denmark +3,
   Germany +3, Netherlands +3. Propose only from these countries until every one
   is at 4. France is done at 6. (Recompute the gaps each run from `ALL_RECIPES`
   + the log's `published`/`proposed` entries, so approved-but-not-yet-built
   ideas still count against a country's remaining slots.)
2. **Use the backlog to close type & difficulty gaps.** Cake, Dessert, Salty and
   Hard are the thin buckets against Cookie/Pastry and Easy/Moderate. When a
   country has several plausible candidates (e.g. which German or Dutch recipe),
   favour the one that also fills a type or difficulty hole. Push `Hard` and
   `Cake`/`Dessert`/`Salty` when you reasonably can; aim for an even
   Easy/Moderate/Hard spread over time.
3. **New countries come in committed blocks of four.** Only once the entire
   backlog is at 4: never propose a lone recipe from an unrepresented country.
   Propose all four at once — varied across type and difficulty — as a set Raz
   approves whole. They then publish over consecutive weeks.
4. **Scope: sweet and savory baking.** Breads, pies, tarts, savory pastries — in.
   Non-baked desserts and general stovetop cooking — out. (Muhallebi predates
   this rule; don't use it as precedent.)
5. **Prefer uncommon dishes with real demand.** Not another chocolate chip
   cookie — but "uncommon" ≠ "unsearched". Aim for the pastel-de-nata /
   Basque-cheesecake zone: unfamiliar to most people, yet genuinely searched.
   If a candidate probably has near-zero search volume, **say so next to it** and
   let Raz decide.
6. **Weight for seasonality.** Recipe search is strongly seasonal and Pinterest
   runs 30–45 days ahead. Bias toward what people will search **6–8 weeks from
   today** — compute that window from today's date and name it. State which
   season each suggestion targets. No Christmas bakes proposed in June.
7. **No ingredient constraints.** Worldwide audience — don't limit to what's in
   an Israeli supermarket.
8. **No repeats or near-duplicates.** Never propose anything already in
   `ALL_RECIPES` or already in `data/recipe-ideas.json` at *any* status. Reject
   regional variations of what exists — there are already three plain butter
   cookies (Sablé, Danish butter, Italian S), so no shortbread, no fourth butter
   cookie. If a candidate is close to something on the site, either skip it or
   state explicitly why it's meaningfully different.

### Output

Propose **5 candidates**. For each: name, country, type, difficulty, target
season, and **two sentences** — what the dish is, and why it fits (coverage gap
it fills + demand/seasonality note). **No ingredients, no method.** Flag any
low-search-volume guess.

Then **stop.** Write nothing to disk except the idea log.

### Idea log

Append all 5 proposals to `data/recipe-ideas.json` as `proposed`. Entry shape:

```json
{
  "slug": "pastel-de-nata",
  "name": "Pastel de Nata",
  "country": "Portugal",
  "type": "Pastry",
  "status": "proposed",
  "proposed": "2026-09-15",
  "note": "Fills Portugal block; targets autumn; strong search demand"
}
```

- `slug`: lowercase ASCII, hyphens only, no accents (`Pastéis de Nata` →
  `pasteis-de-nata`). Check it collides with nothing in `recipe-pages/` or the
  log.
- `status`: `proposed` | `rejected` | `published`.
- When Raz picks one: flip that entry to `published`, the other four to
  `rejected`, and add a one-line `note` on each rejection saying why (usually
  "not selected this week").
- **Never prune this file.** Long-term recall is the entire point. If Raz asks to
  revisit a past idea, pull it back out of the log rather than reinventing it.

---

## Phase 2 — build the approved recipe

Runs as `build <slug>`. The `<slug>` must already be `proposed` in
`data/recipe-ideas.json`.

### Correctness bar (read before writing a single quantity)

Recipes must be **plausible and correctly proportioned** — Raz tests every one
before it goes live. If you're unsure of a ratio, hydration, pan size, bake
temp/time, or yield, **flag it in your summary** rather than guessing. Better to
ask than to ship a broken recipe.

### Part A — build everything except the photo

Do all of this, then output the image prompt and **stop**.

**1. Match the house style.** Read 2–3 existing recipe pages first
(`recipe-pages/gevulde-koek.html`, `italian-s-cookies.html`, `vanillekipferl.html`
are good references) and match their voice, section order, and DOM structure
exactly. Every recipe page shares: navbar, mobile nav, search overlay,
`.recipe-hero` (photo | `--recipe-accent` info panel with title, desc, divider,
one "fact" title + paragraph), `.recipe-meta-row` (Yield / Prep Time / Baking
Time / Total Time), "What you'll need" + "Ingredients" (optionally grouped with
`.ingredients-group-title`), numbered `.instructions-list` with
`.step-title` + text, and a "Tips & Notes" box. Copy the nav/search/footer
markup verbatim from a reference page.

**2. Slug rules.** Lowercase ASCII, hyphens only, no accents. Confirm
`recipe-pages/<slug>.html` doesn't already exist.

**3. Create `recipe-pages/<slug>.html`.** Hand-write everything *except* two
blocks that the generators inject:
- Do **not** hand-write the `<!-- BEGIN SEO TAGS -->` block (canonical + meta
  description) — `add_seo_tags.py` inserts it after `</title>`.
- Do **not** hand-write the `<!-- BEGIN RECIPE SCHEMA -->` JSON-LD block —
  `generate_schema.py` inserts it before `</head>`.
- **Do** hand-write: `<title>`, the full `og:*` set (`og:type` = `article`,
  `og:site_name`, `og:title`, `og:description`, `og:image`, `og:url`) and the
  matching `twitter:card`/`twitter:title`/`twitter:description`/`twitter:image`.
  `add_seo_tags.py` derives `<meta name="description">` by trimming
  `og:description` to whole sentences under ~157 chars — so write `og:description`
  so its **first sentence or two** stand alone as a good ~160-char snippet. If
  the first sentence alone runs long, add a hand-written entry to
  `data/meta-description-overrides.json` keyed by `recipe-pages/<slug>.html`.
- Stylesheet link stays `css/styles.css?v=31` (current — confirm it hasn't moved).
- Script tag: `js/main.js?v=<NEW>` (see step 8).
- `.recipe-hero` inline `--recipe-accent`: a **complementary** pastel, not
  necessarily the photo's background (Sablé green, Croissant/Muhallebi purple).
- Hero tag links (`.recipe-hero-tags a`) are hand-written `href`s — point each at
  the same target `TAG_LINKS` uses for that tag (see step 6 for a new country).

**4. `ALL_RECIPES` entry in `js/main.js`.** Append one line in the established
shape: `{ title, img: 'images/<slug>.jpg', desc, tags: [...], page:
'recipe-pages/<slug>.html', popular: false, date: '<today>' }`. `tags` must
exactly match existing tag names (type + country + Sweet/Salty + difficulty).
`date: '<today>'` gives it the green "New!" badge and floats it to the top of
every grid for 30 days. Card-grid `<img>` needs only the 800px file — **no
srcset there.**

**5. `data/recipe-meta.json`.** Add a `<slug>` entry with all six required
fields: `prepTime`, `cookTime`, `totalTime`, `recipeYield`, `author`
(`"Sweet / Salty"`), `datePublished` (= today). Times are ISO-8601 durations
(`PT45M`, `PT2H`, `PT1H10M`). A missing entry makes `generate_schema.py` fail
loudly — that's intended.

**6. Tags & collection pages.**
- Every tag needs a `TAG_LINKS` entry in `js/main.js`. A country still below 4
  points at a **broader** collection — use `collection-pages/sweet-recipes.html`,
  the way `Austria` and `Netherlands` currently do. (`Denmark` and `Germany`
  already have own pages from an earlier pass — leave those as-is.)
- Add the render-time fallback at `js/main.js` ~line 126 so a missing entry can
  never emit a broken href:
  `` `<a href="${p(TAG_LINKS[t] || 'all-recipes.html')}" class="tag">${t}</a>` ``
- **When this recipe brings a country to 4**, create
  `collection-pages/<country>-recipes.html` following the existing pattern
  (`germany-recipes.html` is the compact template): `<title>`, `og:*` +
  `twitter:*` (image `https://sweetsalty.info/images/ingredients-banner.jpg`),
  `<h1><Country> recipe collection</h1>`, a **one-sentence intro in the site's
  voice** (unique — don't reuse another country's), `<div class="recipe-grid"
  data-tag="<Country>"></div>`. Leave the SEO-tags and static-links blocks for
  the generators. Then repoint `TAG_LINKS['<Country>']` to the new page, and fix
  the hand-written hero tag href on **every** existing recipe page for that
  country.
- **When introducing a brand-new country** (block of 4), also add it to
  `CUISINE_ADJECTIVE` in `scripts/generate_schema.py` (e.g.
  `"Portugal": "Portuguese"`) or `recipeCuisine` comes out wrong.

**7. `data/pin-titles.json`.** Add a search-friendly `<slug>` title, **≤100
chars** — match the style of the existing entries (e.g.
`"Gevulde Koek Recipe (Dutch Almond Cookies)"`).

**8. Bump the `main.js` cache-buster.** Every page loads `js/main.js?v=N` and
this edits `ALL_RECIPES` inside it, so bump `N` everywhere:

```bash
OLD=15; NEW=16   # set to current+1
grep -rl "main.js?v=$OLD" . --include="*.html" | xargs sed -i '' "s/main\.js?v=$OLD/main.js?v=$NEW/g"
grep -rn "main.js?v=$OLD" . --include="*.html"   # must print nothing
```

Include the new recipe page and any new collection page in the sweep (create
them already pointing at `?v=$NEW` and this is just verification).

**9. Run the four SEO generators** (order doesn't matter):

```bash
python3 scripts/generate_schema.py
python3 scripts/generate_sitemap.py
python3 scripts/generate_static_links.py
python3 scripts/add_seo_tags.py
```

`generate_sitemap.py` and `add_seo_tags.py` auto-discover the new page(s) — no
hand-written canonical or sitemap entry. If any script exits non-zero, fix the
cause and re-run; don't proceed with a broken generator.

**10. Output the image prompt and stop.** Look at several existing
`images/*.jpg` recipe photos first to match tone. The prompt must specify: square
1600×1600, single item or small group, solid pastel background, top-down or
slight angle, soft natural shadow, no props, no text. Tell Raz to generate it and
save it as `images/<slug>.jpg`, then re-run `/new-recipe build <slug>` to
resume.

### Part B — resume after the photo

Triggered when `recipe-pages/<slug>.html` exists and `images/<slug>.jpg` is
present but `images/<slug>@2x.jpg` is not.

**1. Create the `@2x` hero variant** the way the others were done — Raz's saved
`images/<slug>.jpg` is the 1600×1600 source:

```bash
cp images/<slug>.jpg images/<slug>@2x.jpg
sips -Z 1600 -s formatOptions 80 images/<slug>@2x.jpg --out images/<slug>@2x.jpg
sips -Z 800  -s formatOptions 78 images/<slug>.jpg    --out images/<slug>.jpg
```

Confirm the hero `<img>` in the recipe page has
`srcset="../images/<slug>.jpg 800w, ../images/<slug>@2x.jpg 1600w"
sizes="(max-width: 768px) 100vw, 50vw"` (that breakpoint matches `.recipe-hero`'s
grid columns — verify in `styles.css` it hasn't changed).

**2. Re-run `generate_schema.py`** (the image path is now final) and
**`generate_pins.py`** for this recipe:

```bash
python3 scripts/generate_schema.py
python3 scripts/generate_pins.py --only <slug>
```

`generate_pins.py` regenerates `pins/<slug>.jpg` and rewrites
`pins/pinterest-bulk-upload.csv`. Note its CSV publish dates shift every run
relative to "tomorrow" — that's expected; the CSV is regenerated right before an
actual upload anyway.

**3. Update docs if this run changed a convention** — a new country, a new
collection page, a new `TAG_LINKS` shape all warrant a line in `CLAUDE.md` (and
`scripts/README.md` if a generator's inputs changed), in the same commit. Docs
that lag the code are worse than none.

**4. Verify, then open a PR — do not merge.**
- Start the dev server (`preview_start`, `sweet-salty` config) and check the new
  recipe page renders, the hero photo loads, tags link correctly, and the recipe
  appears in All Recipes + its collection page(s) + search. Check the console for
  errors.
- `git checkout -b recipe/<slug>`
- Commit everything (recipe page, `main.js`, all three `data/*.json`, any new
  collection page, regenerated `sitemap.xml` / schema / static links / SEO tags /
  `pins/`, doc updates). One commit.
- `gh pr create` with a body summarising: the dish, coverage gaps it fills, any
  ratio/technique assumptions you want Raz to check before merge, and the fact
  that the image was Raz-supplied.
- Post the PR URL. **Stop. Do not merge** — Raz reviews first.

---

## Quick reference

| Thing | Where |
|---|---|
| Recipe list (single source of truth) | `ALL_RECIPES` in `js/main.js` |
| Tag → collection routing | `TAG_LINKS` in `js/main.js` |
| Card render + tag-href fallback | `js/main.js` ~line 122–141 |
| Hand-maintained schema inputs | `data/recipe-meta.json` |
| Meta-description overrides | `data/meta-description-overrides.json` |
| Pin titles | `data/pin-titles.json` |
| Idea log | `data/recipe-ideas.json` |
| SEO generators | `scripts/{generate_schema,generate_sitemap,generate_static_links,add_seo_tags}.py` |
| Pin generator | `scripts/generate_pins.py --only <slug>` |
| Cuisine adjective map (new countries) | `CUISINE_ADJECTIVE` in `scripts/generate_schema.py` |
| Recipe page template | `recipe-pages/gevulde-koek.html` |
| Collection page template | `collection-pages/germany-recipes.html` |
| Full conventions | `CLAUDE.md` |

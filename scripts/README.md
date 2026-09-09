# Scripts

One-off maintenance tools for the site's SEO foundation. Nothing here runs
as part of a build — the site itself has none (see the root `CLAUDE.md`).
Run these by hand after editing recipes, or let the GitHub Actions
workflow run the Search Console one on a schedule.

```bash
pip install -r scripts/requirements.txt
```

## generate_schema.py

Regenerates the `Recipe` JSON-LD block on every `recipe-pages/*.html`
page. Re-run it whenever a recipe's ingredients, instructions, tags, or
`data/recipe-meta.json` entry changes.

```bash
python3 scripts/generate_schema.py              # all 19 pages
python3 scripts/generate_schema.py --only pizza # a single page
python3 scripts/generate_schema.py --check       # report only
```

## generate_sitemap.py

Rewrites `sitemap.xml` from the site's actual page inventory. Re-run it
whenever a page is added or removed.

```bash
python3 scripts/generate_sitemap.py
```

## generate_static_links.py

Refreshes the `<noscript>` fallback link list on `all-recipes.html` and
every `collection-pages/*.html` page, from `ALL_RECIPES` in `js/main.js`.
Re-run it whenever a recipe is added, removed, or re-tagged.

```bash
python3 scripts/generate_static_links.py
```

## add_seo_tags.py

Adds/refreshes `<link rel="canonical">` and `<meta name="description">`
on every real page, from each page's own `og:description`. Re-run it if a
page's OG description changes.

```bash
python3 scripts/add_seo_tags.py
```

## search_console_report.py

Pulls the last 28 days of Search Console data and writes a ranked report
(content gaps, striking-distance queries, top pages) to `reports/`.

### One-time setup: a Search Console service account

Search Console's API needs a Google Cloud service account — a "robot"
Google identity your own account grants read access to, so the script can
authenticate without your personal login or a browser OAuth flow.

1. **Create a Google Cloud project** (or use an existing one) at
   [console.cloud.google.com](https://console.cloud.google.com/).
2. **Enable the Search Console API**: APIs & Services > Library, search
   for "Google Search Console API", click Enable.
3. **Create a service account**: APIs & Services > Credentials > Create
   Credentials > Service account. Give it any name (e.g.
   `sweetsalty-search-console-reader`). No project role needed — it only
   needs access granted directly in Search Console (next step).
4. **Create a JSON key** for that service account: open it under
   Credentials, go to the Keys tab, Add Key > Create new key > JSON. This
   downloads a `.json` file — **treat it like a password**. Don't commit
   it; the conventional spot is `scripts/credentials/` in this repo,
   which is already in `.gitignore`.
5. **Grant the service account access in Search Console**: in
   [Search Console](https://search.google.com/search-console), select
   the `sweetsalty.info` **Domain property** (not the old `www`
   URL-prefix one) > Settings > Users and permissions > Add user. Enter
   the service account's email address (looks like
   `sweetsalty-search-console-reader@your-project.iam.gserviceaccount.com`
   — find it on the service account's details page, or inside the JSON
   key file's `client_email` field). "Restricted" permission is enough —
   this script only reads data.

`GSC_SITE_URL` must match the property's identifier as the Search
Console **API** expects it, which is not the same as its URL in the
browser. Since `sweetsalty.info` is a **Domain property**, that's
`sc-domain:sweetsalty.info` — no `https://`, no trailing slash. (A
URL-prefix property would instead use its exact URL, e.g.
`https://sweetsalty.info/`.) Using the wrong form doesn't error at
auth time — it authenticates fine and then fails with a 403
"insufficient permission" on the actual query, which looks like a
permissions problem rather than a formatting one.

### Running it locally

```bash
export GSC_SERVICE_ACCOUNT_FILE=scripts/credentials/service-account.json
export GSC_SITE_URL=sc-domain:sweetsalty.info
python3 scripts/search_console_report.py
```

Writes `reports/YYYY-MM-DD-search-console.md`.

### Running it on a schedule (GitHub Actions)

`.github/workflows/search-console-report.yml` runs this weekly and
commits the resulting report. It needs two repository secrets (Settings
> Secrets and variables > Actions > New repository secret):

- `GSC_SERVICE_ACCOUNT_JSON` — the **entire contents** of the service
  account's JSON key file, pasted as the secret value.
- `GSC_SITE_URL` — `sc-domain:sweetsalty.info`

The workflow writes that secret to a temporary file at runtime (never to
the repo) and points `GSC_SERVICE_ACCOUNT_FILE` at it.

## check_sitemap_status.py

A quick diagnostic: is Google actually fetching `sitemap.xml`, and are
there any warnings/errors? Uses the same credentials as
`search_console_report.py` above — no separate setup needed.

```bash
export GSC_SERVICE_ACCOUNT_FILE=scripts/credentials/service-account.json
export GSC_SITE_URL=sc-domain:sweetsalty.info
python3 scripts/check_sitemap_status.py
```

Or on demand via GitHub Actions, without opening Search Console's UI at
all: `.github/workflows/check-sitemap-status.yml` (`workflow_dispatch`
only, no schedule) — trigger with `gh workflow run
check-sitemap-status.yml` and read the result with `gh run view <run-id>
--log`.

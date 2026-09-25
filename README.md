# Dr. Yue Teng — personal website

Static site (plain HTML/CSS/JS, no build step) for Dr. Yue TENG, Department of
Building and Real Estate, The Hong Kong Polytechnic University.

## How content is maintained

| Content | Where it lives | Who edits |
|---|---|---|
| News, awards, events | Google Sheet → **News** tab | Dr. Teng (add a row) |
| Team members & alumni | Google Sheet → **Team** tab | Dr. Teng (add / edit a row) |
| Publications | [ORCID](https://orcid.org/0000-0002-0333-639X), fetched live | nobody — automatic |
| Bio, research themes, courses, contact | `index.html`, `research.html`, `teaching.html`, `team.html` | you (rarely) |
| Photos | `assets/img/team/`, `assets/img/news/` | you (upload, then put the path in the sheet) |

The non-technical guide for Dr. Teng is in `MAINTENANCE.md`.

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Opening `index.html` directly from the file system will not work, because the
browser blocks `fetch()` on `file://` URLs.

## One-time setup: connect the Google Sheets

Two Google Sheets are used, one for News and one for Team (already created):

- News: https://docs.google.com/spreadsheets/d/1_nqWBsD7XeLpJ_eqm1PBBtPH2Y-am0o41axTltJBQiE/edit
- Team: https://docs.google.com/spreadsheets/d/1fkD6DYenQXB1iWBPmMnFbkzwvTQkwlECpPXvULxx5Kg/edit

Requirements for each sheet:

1. Share → General access → **Anyone with the link → Viewer**. This is what
   lets the website read it; no "Publish to web" is needed.
2. Share the sheet with Dr. Teng as **Editor**.
3. The header row must be exactly as in
   `data/news.csv` / `data/team.csv`. The `gid` in the URL selects the tab; it
   is the number shown in the browser address bar after `#gid=` when that tab
   is open.

The URLs live in `js/config.js`:

```js
NEWS_CSV_URL: "https://docs.google.com/spreadsheets/d/<SHEET_ID>/export?format=csv&gid=<TAB_ID>",
TEAM_CSV_URL: "https://docs.google.com/spreadsheets/d/<SHEET_ID>/export?format=csv&gid=<TAB_ID>",
```

Edits appear on the site within about a minute. While the URLs are empty the
site reads the sample files in `data/` instead.

### Column reference

**News**: `date` (YYYY-MM-DD), `title`, `description`, `category`
(Award / Publication / Event / Recruitment — free text, used for the filter
buttons), `link` (optional URL), `image` (optional path such as
`assets/img/news/photo.jpg` or a full URL).

**Team**: `name`, `role` (Postdoc / PhD Student / MPhil Student /
Research Assistant / Visiting Scholar), `status` (`Current` or `Alumni`),
`year` (e.g. `2023–`), `email`, `photo` (optional path such as
`assets/img/team/name.jpg`), `bio` (one sentence), `link` (optional URL).

## Publications

`publications.html` fetches ORCID in the browser. If ORCID is unreachable the
page falls back to `data/publications.json`. Refresh that snapshot now and then:

```bash
python3 scripts/fetch_orcid.py
```

ORCID work summaries do not include author lists, so entries show title,
journal and year only.

## Deploy

Upload the whole directory (everything except `.git`, `scripts/` and
`.playwright-mcp/`) to the web server. No build step, no server-side code.

## Customising

Colours and fonts are CSS variables at the top of `css/style.css`.
Navigation and footer are repeated in each HTML file; edit all six if you
change them.

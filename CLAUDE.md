# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal/lab website for Dr. Yue TENG (Assistant Professor, Dept. of Construction Management and Intelligence, PolyU). Plain HTML/CSS/JS, English only, no build step, no dependencies. Deployed with GitHub Pages from the `main` branch root of two repositories: `polyucmi/teng-web` (primary, https://polyucmi.github.io/teng-web/) and the legacy `EricXue92/teng-web` (https://ericxue92.github.io/teng-web/, kept alive at the owner's request). `origin` fetches from the primary and has both as push URLs, so one `git push` updates both sites; every push to `main` goes live within about a minute. Relative asset paths must stay relative because both sites live under a sub-path.

**Hard constraint:** the site owner is non-technical. Anything that changes often (news, team, projects, awards) must stay editable through Google Sheets. Never move that content into files or ask the owner to edit code.

## Commands

```bash
python3 -m http.server 8000        # local preview at http://localhost:8000
python3 scripts/fetch_orcid.py     # refresh data/publications.json (ORCID fallback snapshot)
python3 scripts/fetch_citations.py # refresh data/citations.json (authors/volume/pages from Crossref)
```

Opening `index.html` via `file://` does not work: the pages use `fetch()`. Always preview through an HTTP server.

There is no test suite or linter. Verify changes by loading the pages in a browser at desktop and ~375px width and checking the console is clean.

## Architecture

Three content tiers, each with a different owner and source:

| Tier                                                  | Source                                                                                           | Loader                                 |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------- |
| News, Team, Projects, Awards                          | One Google Sheet each, shared "anyone with link", read as `.../export?format=csv&gid=…`          | `js/data.js` → `loadNews` / `loadTeam` / `loadProjects` / `loadAwards` |
| Publications                                          | ORCID public API, fetched live in the browser (CORS `*`); falls back to `data/publications.json` | `js/data.js` → `loadPublications`      |
| Bio, CV highlights, research themes, courses, contact | Hard-coded in the HTML pages                                                                     | none                                   |

- `js/config.js` is the only configuration file: the Sheet CSV URLs and the ORCID id. Empty Sheet URLs make the loaders read `data/news.csv` / `data/team.csv` / `data/projects.csv` / `data/awards.csv` instead, which double as the Sheet column templates. Keep the CSV headers and the Sheet headers identical.
- `js/csv.js` is a hand-written RFC-4180 parser; `js/data.js` returns plain objects; `js/main.js` does all rendering and only touches containers that exist on the current page (`#news-list`, `#team-current`, `#projects-list`, `#awards-list`, `#pub-list`, …). Adding a data-driven block means adding a container id and an `init*` function in `main.js`.
- `simplifyORCID` in `js/data.js` and `simplify` in `scripts/fetch_orcid.py` must stay in sync: they produce the same publication object shape.
- `data/publications-extra.json` holds works from the owner's CV that ORCID does not list (same object shape). `loadPublications` appends them and drops any entry whose DOI or title ORCID already has, so entries can stay after ORCID catches up.
- `data/citations.json` holds what ORCID lacks for a journal-style reference (authors, volume, issue, pages), keyed by lower-case DOI, or by normalised title for works without one. `loadPublications` merges it in; a DOI missing from the cache is looked up on Crossref in the browser, so new ORCID works still get full references. `simplifyCrossref` in `js/data.js` and `simplify` in `scripts/fetch_citations.py` must stay in sync. The no-DOI entries and the `"corresponding": true` author marks (rendered as `*`) were entered by hand from the owner's CV; the script preserves both.
- The header and footer are duplicated verbatim in all nine HTML pages. A nav or footer change must be applied to every page.
- Colours, fonts and dark-mode values are CSS variables at the top of `css/style.css`.

## Docs for humans

`MAINTENANCE.md` is the Chinese, non-technical guide for the site owner (how to add a news row or a team member in the Sheets). Keep it in step when the Sheet columns or accepted `role` / `status` / `category` values change. Projects and awards follow the same pattern (`data/projects.csv` / `PROJECTS_CSV_URL`, `data/awards.csv` / `AWARDS_CSV_URL`).

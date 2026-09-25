# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal/lab website for Dr. Yue TENG (Assistant Professor, Dept. of Building and Real Estate, PolyU). Plain HTML/CSS/JS, English only, no build step, no dependencies. Deployed with GitHub Pages from the `main` branch root (https://ericxue92.github.io/teng-web/); every push to `main` goes live within about a minute. Relative asset paths must stay relative because the site lives under a sub-path.

**Hard constraint:** the site owner is non-technical. Anything that changes often (news, team) must stay editable through Google Sheets. Never move that content into files or ask the owner to edit code.

## Commands

```bash
python3 -m http.server 8000        # local preview at http://localhost:8000
python3 scripts/fetch_orcid.py     # refresh data/publications.json (ORCID fallback snapshot)
```

Opening `index.html` via `file://` does not work: the pages use `fetch()`. Always preview through an HTTP server.

There is no test suite or linter. Verify changes by loading the pages in a browser at desktop and ~375px width and checking the console is clean.

## Architecture

Three content tiers, each with a different owner and source:

| Tier                                   | Source                                                                                           | Loader                                 |
| -------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------- |
| News, Team                             | Two Google Sheets, shared "anyone with link", read as `.../export?format=csv&gid=…`              | `js/data.js` → `loadNews` / `loadTeam` |
| Publications                           | ORCID public API, fetched live in the browser (CORS `*`); falls back to `data/publications.json` | `js/data.js` → `loadPublications`      |
| Bio, research themes, courses, contact | Hard-coded in the HTML pages                                                                     | none                                   |

- `js/config.js` is the only configuration file: the two Sheet CSV URLs and the ORCID id. Empty Sheet URLs make the loaders read `data/news.csv` / `data/team.csv` instead, which double as the Sheet column templates. Keep the CSV headers and the Sheet headers identical.
- `js/csv.js` is a hand-written RFC-4180 parser; `js/data.js` returns plain objects; `js/main.js` does all rendering and only touches containers that exist on the current page (`#news-list`, `#team-current`, `#pub-list`, `#home-news`, `#home-pubs`, …). Adding a data-driven block means adding a container id and an `init*` function in `main.js`.
- `simplifyORCID` in `js/data.js` and `simplify` in `scripts/fetch_orcid.py` must stay in sync: they produce the same publication object shape.
- The header and footer are duplicated verbatim in all six HTML pages. A nav or footer change must be applied to every page.
- Colours, fonts and dark-mode values are CSS variables at the top of `css/style.css`.

## Docs for humans

`MAINTENANCE.md` is the Chinese, non-technical guide for the site owner (how to add a news row or a team member in the Sheets). Keep it in step when the Sheet columns or accepted `role` / `status` / `category` values change.

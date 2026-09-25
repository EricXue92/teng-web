#!/usr/bin/env python3
"""Refresh data/publications.json from the ORCID public API.

The website fetches ORCID live in the browser; this snapshot is only the
fallback used when that request fails. Run occasionally:

    python3 scripts/fetch_orcid.py
"""
import html
import json
import re
import sys
import urllib.request
from pathlib import Path

ORCID_ID = "0000-0002-0333-639X"
OUT = Path(__file__).resolve().parent.parent / "data" / "publications.json"


def fetch_works(orcid_id: str) -> dict:
    req = urllib.request.Request(
        f"https://pub.orcid.org/v3.0/{orcid_id}/works",
        headers={"Accept": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)


def simplify(group: dict) -> dict:
    s = group["work-summary"][0]
    ids = {
        e["external-id-type"]: e["external-id-value"]
        for e in (s.get("external-ids") or {}).get("external-id", [])
    }
    date = s.get("publication-date") or {}
    year = (date.get("year") or {}).get("value")
    journal = (s.get("journal-title") or {}).get("value")
    url = (s.get("url") or {}).get("value")
    doi = ids.get("doi")
    return {
        "title": html.unescape(s["title"]["title"]["value"]).strip(),
        "year": int(year) if year and year.isdigit() else None,
        "journal": html.unescape(journal) if journal else None,
        "type": s.get("type"),
        "doi": doi,
        "url": f"https://doi.org/{doi}" if doi else url,
    }


def main() -> int:
    data = fetch_works(ORCID_ID)
    pubs = [simplify(g) for g in data["group"]]
    # Drop duplicates by DOI / normalised title, keep first (ORCID lists newest first).
    seen, unique = set(), []
    for p in pubs:
        key = p["doi"] or re.sub(r"\W+", "", p["title"].lower())
        if key in seen:
            continue
        seen.add(key)
        unique.append(p)
    unique.sort(key=lambda p: (p["year"] or 0, p["title"]), reverse=True)
    OUT.write_text(json.dumps(unique, indent=2, ensure_ascii=False) + "\n")
    print(f"Wrote {len(unique)} publications to {OUT.relative_to(Path.cwd())}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
"""Refresh data/citations.json: authors, volume, issue and pages for each DOI.

ORCID only gives title, journal and year. The publications page shows full
journal-style references, so the remaining fields are cached here from
Crossref. The browser looks up any DOI missing from this cache live, so the
page stays correct without this script; running it just makes it faster:

    python3 scripts/fetch_citations.py

Entries whose key is not a DOI (works without one, keyed by normalised title)
are maintained by hand and left untouched. So are the hand-added
"corresponding": true marks on authors (shown as an asterisk), which Crossref
does not record.
"""
import json
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"
OUT = DATA / "citations.json"
SOURCES = [DATA / "publications.json", DATA / "publications-extra.json"]


def fetch_crossref(doi: str):
    req = urllib.request.Request(
        f"https://api.crossref.org/works/{urllib.parse.quote(doi)}",
        headers={"User-Agent": "teng-web (https://polyucmi.github.io/teng-web/)"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.load(resp)["message"]
    except urllib.error.HTTPError as err:
        if err.code == 404:
            return None
        raise


def simplify(work: dict) -> dict:
    """Keep in sync with simplifyCrossref in js/data.js."""
    authors = [
        {"family": a.get("family") or a.get("name") or "", "given": a.get("given") or ""}
        for a in work.get("author", [])
    ]
    for a in authors:
        # Crossref has Dr. Teng's name reversed on one record.
        if (a["family"], a["given"]) == ("Yue", "Teng"):
            a["family"], a["given"] = "Teng", "Yue"
    return {
        "authors": [a for a in authors if a["family"]],
        "volume": work.get("volume") or None,
        "issue": work.get("issue") or None,
        "pages": work.get("page") or None,
        "article": work.get("article-number") or None,
    }


def main() -> int:
    cache = json.loads(OUT.read_text()) if OUT.exists() else {}
    dois = []
    for src in SOURCES:
        for p in json.loads(src.read_text()):
            if p.get("doi") and p["doi"].lower() not in dois:
                dois.append(p["doi"].lower())
    missing = []
    for doi in dois:
        work = fetch_crossref(doi)
        if work is None:
            missing.append(doi)
            continue
        entry = simplify(work)
        starred = {
            (a["family"], a["given"])
            for a in cache.get(doi, {}).get("authors", [])
            if a.get("corresponding")
        }
        for a in entry["authors"]:
            if (a["family"], a["given"]) in starred:
                a["corresponding"] = True
        cache[doi] = entry
    OUT.write_text(json.dumps(cache, indent=1, ensure_ascii=False) + "\n")
    print(f"Wrote {len(cache)} citations to {OUT.relative_to(Path.cwd())}")
    if missing:
        print("Not in Crossref (add by hand if needed):", *missing, sep="\n  ")
    return 0


if __name__ == "__main__":
    sys.exit(main())

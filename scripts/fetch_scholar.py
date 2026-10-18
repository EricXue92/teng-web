#!/usr/bin/env python3
"""Refresh data/scholar.json with the total citation count from Google Scholar.

The homepage biography reads this file to show the live citation count.
A daily GitHub Actions job (.github/workflows/scholar.yml) runs it; it can
also be run by hand:

    python3 scripts/fetch_scholar.py
"""
import datetime
import json
import re
import sys
import urllib.request
from pathlib import Path

SCHOLAR_USER = "ohpjk2kAAAAJ"
OUT = Path(__file__).resolve().parent.parent / "data" / "scholar.json"
UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/129.0 Safari/537.36"
)


def fetch_citations(user: str) -> int:
    req = urllib.request.Request(
        f"https://scholar.google.com/citations?user={user}&hl=en",
        headers={"User-Agent": UA, "Accept-Language": "en"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        page = resp.read().decode("utf-8", "replace")
    # The stats table lists citations, h-index and i10-index (all / recent);
    # the first cell is all-time citations.
    cells = re.findall(r'class="gsc_rsb_std">(\d+)<', page)
    if not cells:
        raise RuntimeError("citation table not found (blocked or page changed)")
    return int(cells[0])


def main() -> None:
    try:
        citations = fetch_citations(SCHOLAR_USER)
    except Exception as err:  # keep the previous file on any failure
        sys.exit(f"Google Scholar fetch failed: {err}")
    old = json.loads(OUT.read_text()) if OUT.exists() else {}
    if old.get("citations") == citations:
        print(f"Unchanged: {citations} citations")
        return
    data = {"citations": citations, "updated": datetime.date.today().isoformat()}
    OUT.write_text(json.dumps(data, indent=2) + "\n")
    print(f"Wrote {OUT.relative_to(OUT.parent.parent)}: {citations} citations")


if __name__ == "__main__":
    main()

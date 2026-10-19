#!/usr/bin/env python3
"""Refresh data/scholar.json with the total citation count from Google Scholar.

The homepage biography reads this file to show the live citation count.
A GitHub Actions job (.github/workflows/scholar.yml) runs it four times a
day; it can also be run by hand:

    python3 scripts/fetch_scholar.py
"""
import datetime
import json
import re
import sys
import time
import urllib.request
from pathlib import Path

SCHOLAR_USER = "ohpjk2kAAAAJ"
# Scholar sometimes answers 403 to cloud IPs such as GitHub's runners; the
# regional hosts serve the same profile and are tried in turn.
HOSTS = ["scholar.google.com", "scholar.google.com.hk", "scholar.google.co.uk"]
# A blocked run only warns, since a later run usually gets through. The job
# fails once the count has not changed for this long, so a lasting block
# (or a page change) gets noticed.
STALE_DAYS = 7
OUT = Path(__file__).resolve().parent.parent / "data" / "scholar.json"
UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/129.0 Safari/537.36"
)


def fetch_citations(host: str, user: str) -> int:
    req = urllib.request.Request(
        f"https://{host}/citations?user={user}&hl=en",
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


def fetch_any(user: str) -> int:
    errors = []
    for attempt in range(2):
        if attempt:
            time.sleep(20)
        for host in HOSTS:
            try:
                return fetch_citations(host, user)
            except Exception as err:
                errors.append(f"{host}: {err}")
    raise RuntimeError("; ".join(errors))


def main() -> None:
    old = json.loads(OUT.read_text()) if OUT.exists() else {}
    try:
        citations = fetch_any(SCHOLAR_USER)
    except Exception as err:  # keep the previous file on any failure
        updated = datetime.date.fromisoformat(old.get("updated", "2000-01-01"))
        age = (datetime.date.today() - updated).days
        if age > STALE_DAYS:
            sys.exit(f"Google Scholar fetch failed, count {age} days old: {err}")
        print(f"::warning::Google Scholar fetch failed, keeping {old.get('citations')}: {err}")
        return
    if old.get("citations") == citations:
        print(f"Unchanged: {citations} citations")
        return
    data = {"citations": citations, "updated": datetime.date.today().isoformat()}
    OUT.write_text(json.dumps(data, indent=2) + "\n")
    print(f"Wrote {OUT.relative_to(OUT.parent.parent)}: {citations} citations")


if __name__ == "__main__":
    main()

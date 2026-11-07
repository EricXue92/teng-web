#!/bin/bash
# Daily Google Scholar refresh from the maintainer's Mac, run by launchd
# (~/Library/LaunchAgents/com.xue.teng-web-scholar.plist). Scholar blocks
# GitHub's runners most of the time; a home IP gets through.
#
# Works in its own clone so it never touches the working copy: reset to
# origin/main, run fetch_scholar.py, commit and push data/scholar.json to
# both repositories if the count changed.
set -euo pipefail
export PATH=/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin

WORK="$HOME/Library/Application Support/teng-web-scholar"
REPO="$WORK/repo"
PRIMARY=https://github.com/polyucmi/teng-web.git
LEGACY=https://github.com/EricXue92/teng-web.git
PROXY_PORT=7897 # Clash Verge; used only when it is listening

echo "== $(date '+%F %T')"

# launchd does not inherit the shell's proxy variables; git needs them.
if nc -z 127.0.0.1 "$PROXY_PORT" 2>/dev/null; then
  export http_proxy="http://127.0.0.1:$PROXY_PORT" https_proxy="http://127.0.0.1:$PROXY_PORT"
  export HTTP_PROXY="$http_proxy" HTTPS_PROXY="$https_proxy"
fi

if [ ! -d "$REPO/.git" ]; then
  mkdir -p "$WORK"
  git clone -q "$PRIMARY" "$REPO"
  git -C "$REPO" remote set-url --add --push origin "$PRIMARY"
  git -C "$REPO" remote set-url --add --push origin "$LEGACY"
fi

cd "$REPO"
git fetch -q origin main
git reset -q --hard origin/main

python3 scripts/fetch_scholar.py

if git diff --quiet data/scholar.json; then
  exit 0
fi
git commit -q -m "Data: refresh Google Scholar citation count" data/scholar.json
git push -q origin HEAD:main
echo "Pushed $(git rev-parse --short HEAD)"

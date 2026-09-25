/* Data loaders. Each returns a Promise of plain objects; rendering lives in main.js. */
(function () {
  const cfg = window.SITE_CONFIG || {};

  async function fetchText(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
    return res.text();
  }

  async function loadCSV(remoteUrl, localPath) {
    return window.parseCSV(await fetchText(remoteUrl || localPath));
  }

  async function loadNews() {
    const rows = await loadCSV(cfg.NEWS_CSV_URL, "data/news.csv");
    return rows
      .filter((r) => r.title)
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }

  async function loadTeam() {
    const rows = await loadCSV(cfg.TEAM_CSV_URL, "data/team.csv");
    return rows.filter((r) => r.name);
  }

  function unescapeHTML(s) {
    const t = document.createElement("textarea");
    t.innerHTML = s || "";
    return t.value;
  }

  function simplifyORCID(group) {
    const s = group["work-summary"][0];
    const ids = {};
    ((s["external-ids"] || {})["external-id"] || []).forEach((e) => {
      ids[e["external-id-type"]] = e["external-id-value"];
    });
    const year = (((s["publication-date"] || {}).year) || {}).value;
    const doi = ids.doi || null;
    return {
      title: unescapeHTML(s.title.title.value).trim(),
      year: year ? parseInt(year, 10) : null,
      journal: unescapeHTML((s["journal-title"] || {}).value || "") || null,
      type: s.type,
      doi,
      url: doi ? `https://doi.org/${doi}` : ((s.url || {}).value || null),
    };
  }

  async function loadPublications() {
    let pubs;
    try {
      const res = await fetch(`https://pub.orcid.org/v3.0/${cfg.ORCID_ID}/works`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`ORCID HTTP ${res.status}`);
      const json = await res.json();
      pubs = json.group.map(simplifyORCID);
    } catch (err) {
      console.warn("ORCID unavailable, using local snapshot:", err.message);
      pubs = JSON.parse(await fetchText("data/publications.json"));
    }
    const seen = new Set();
    return pubs
      .filter((p) => {
        const key = p.doi || p.title.toLowerCase().replace(/\W+/g, "");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => (b.year || 0) - (a.year || 0) || a.title.localeCompare(b.title));
  }

  window.SiteData = { loadNews, loadTeam, loadPublications };
})();

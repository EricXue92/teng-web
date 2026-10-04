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
    // Newest start first. year is like "2025.09–", "2023–" or "2024.06–2025.02";
    // only the start (year, optional month) counts.
    const start = (r) => {
      const m = /(\d{4})(?:[./](\d{1,2}))?/.exec(r.year || "");
      return m ? Number(m[1]) * 12 + Number(m[2] || 0) : 0;
    };
    return rows.filter((r) => r.name).sort((a, b) => start(b) - start(a));
  }

  async function loadProjects() {
    const rows = await loadCSV(cfg.PROJECTS_CSV_URL, "data/projects.csv");
    const rank = (r) => (/^ongoing$/i.test(r.status || "") ? 0 : 1);
    const role = (r) => (r.role || "").trim();
    const roleRank = (r) => (/^pi$/i.test(role(r)) ? 0 : 1);
    // Only PI / Co-PI projects are shown; other roles may stay in the Sheet.
    // Ongoing first, PI before Co-PI, then newest period first (period like "2024–2026").
    return rows
      .filter((r) => r.title && /^(co-?)?pi$/i.test(role(r)))
      .map((r) => ({
        ...r,
        // Grant numbers ("Project No. 15220923.") are kept in the Sheet but not shown.
        description: (r.description || "")
          .replace(/\bProject No\.\s*.*?\.(?=\s|$)\s*/gi, "")
          .trim(),
      }))
      .sort(
        (a, b) =>
          rank(a) - rank(b) ||
          roleRank(a) - roleRank(b) ||
          (b.period || "").localeCompare(a.period || ""),
      );
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
    const year = ((s["publication-date"] || {}).year || {}).value;
    const doi = ids.doi || null;
    return {
      title: unescapeHTML(s.title.title.value).trim(),
      year: year ? parseInt(year, 10) : null,
      journal: unescapeHTML((s["journal-title"] || {}).value || "") || null,
      type: s.type,
      doi,
      url: doi ? `https://doi.org/${doi}` : (s.url || {}).value || null,
    };
  }

  async function loadPublications() {
    let pubs;
    try {
      const res = await fetch(
        `https://pub.orcid.org/v3.0/${cfg.ORCID_ID}/works`,
        {
          headers: { Accept: "application/json" },
        },
      );
      if (!res.ok) throw new Error(`ORCID HTTP ${res.status}`);
      const json = await res.json();
      pubs = json.group.map(simplifyORCID);
    } catch (err) {
      console.warn("ORCID unavailable, using local snapshot:", err.message);
      pubs = JSON.parse(await fetchText("data/publications.json"));
    }
    // Works from the CV that ORCID does not list. An entry here is dropped
    // automatically once ORCID has the same work (matched by DOI or title).
    try {
      pubs = pubs.concat(
        JSON.parse(await fetchText("data/publications-extra.json")),
      );
    } catch (err) {
      console.warn("No supplementary publication list:", err.message);
    }
    const seen = new Set();
    return pubs
      .filter((p) => {
        const keys = [
          (p.doi || "").toLowerCase(),
          p.title.toLowerCase().replace(/\W+/g, ""),
        ].filter(Boolean);
        if (keys.some((k) => seen.has(k))) return false;
        keys.forEach((k) => seen.add(k));
        return true;
      })
      .sort(
        (a, b) =>
          (b.year || 0) - (a.year || 0) || a.title.localeCompare(b.title),
      );
  }

  window.SiteData = { loadNews, loadTeam, loadProjects, loadPublications };
})();

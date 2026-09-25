/* Page behaviour: navigation + rendering of data-driven sections.
   Each render function only runs when its container exists on the page. */
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const fmtDate = (iso) => {
    const d = new Date(iso);
    if (isNaN(d)) return esc(iso);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  const isExternal = (url) => /^https?:\/\//i.test(url);
  const linkAttrs = (url) => (isExternal(url) ? ' target="_blank" rel="noopener"' : "");

  const PUB_TYPES = {
    "journal-article": "Journal",
    "conference-paper": "Conference",
    "conference-abstract": "Conference",
    "conference-poster": "Conference",
    "book-chapter": "Book chapter",
    patent: "Patent",
    other: "Other",
  };
  const pubKind = (p) => PUB_TYPES[p.type] || "Other";

  const ROLE_ORDER = ["Postdoc", "PhD Student", "MPhil Student", "Research Assistant", "Visiting Scholar"];

  /* ---------------- navigation ---------------- */
  function initNav() {
    const here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    document.querySelectorAll(".site-nav a").forEach((a) => {
      const target = (a.getAttribute("href") || "").toLowerCase();
      if (target === here) a.classList.add("active");
    });
    const toggle = $(".nav-toggle");
    const nav = $(".site-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", () => {
        const open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
      });
    }
  }

  function fail(container, what) {
    container.innerHTML = `<p class="notice">Could not load ${what} right now. Please try again later.</p>`;
  }

  /* ---------------- publications ---------------- */
  function pubHTML(p) {
    const title = p.url
      ? `<a class="title" href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.title)}</a>`
      : `<span class="title">${esc(p.title)}</span>`;
    const journal = p.journal ? `<em>${esc(p.journal)}</em>` : "";
    const year = p.year ? `${journal ? ", " : ""}${p.year}` : "";
    return `<li class="pub">${title}<span class="meta">${journal}${year}<span class="kind">${pubKind(p)}</span></span></li>`;
  }

  function renderPubGroups(container, pubs) {
    if (!pubs.length) {
      container.innerHTML = `<p class="notice">No publications in this category.</p>`;
      return;
    }
    const byYear = new Map();
    pubs.forEach((p) => {
      const y = p.year || "Undated";
      if (!byYear.has(y)) byYear.set(y, []);
      byYear.get(y).push(p);
    });
    container.innerHTML = [...byYear.entries()]
      .map(([y, list]) => `<section class="year-group"><h3>${esc(y)}</h3><ul class="pub-list">${list.map(pubHTML).join("")}</ul></section>`)
      .join("");
  }

  async function initPublications() {
    const list = $("#pub-list");
    if (!list) return;
    const filters = $("#pub-filters");
    try {
      const pubs = await window.SiteData.loadPublications();
      const kinds = ["All", ...new Set(pubs.map(pubKind))];
      if (filters) {
        filters.innerHTML = kinds
          .map((k) => {
            const n = k === "All" ? pubs.length : pubs.filter((p) => pubKind(p) === k).length;
            return `<button type="button" data-kind="${esc(k)}" class="${k === "All" ? "active" : ""}">${esc(k)} <span class="muted">${n}</span></button>`;
          })
          .join("");
        filters.addEventListener("click", (e) => {
          const btn = e.target.closest("button[data-kind]");
          if (!btn) return;
          filters.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b === btn));
          const k = btn.dataset.kind;
          renderPubGroups(list, k === "All" ? pubs : pubs.filter((p) => pubKind(p) === k));
        });
      }
      renderPubGroups(list, pubs);
    } catch (err) {
      console.error(err);
      fail(list, "publications");
    }
  }

  async function initHomePubs() {
    const box = $("#home-pubs");
    if (!box) return;
    try {
      const pubs = (await window.SiteData.loadPublications()).slice(0, 4);
      box.innerHTML = `<ul class="pub-list">${pubs.map(pubHTML).join("")}</ul>`;
    } catch (err) {
      console.error(err);
      fail(box, "publications");
    }
  }

  /* ---------------- news ---------------- */
  function newsTitle(n) {
    return n.link
      ? `<a class="title" href="${esc(n.link)}"${linkAttrs(n.link)}>${esc(n.title)}</a>`
      : `<span class="title">${esc(n.title)}</span>`;
  }

  function newsHTML(n) {
    const tag = n.category ? `<span class="tag">${esc(n.category)}</span>` : "";
    const desc = n.description ? `<p class="desc">${esc(n.description)}</p>` : "";
    const img = n.image ? `<img src="${esc(n.image)}" alt="" loading="lazy">` : "";
    return `<li class="news-item"><div class="date">${fmtDate(n.date)}</div><div>${tag}${newsTitle(n)}${desc}${img}</div></li>`;
  }

  async function initNews() {
    const list = $("#news-list");
    if (!list) return;
    const filters = $("#news-filters");
    try {
      const news = await window.SiteData.loadNews();
      const render = (items) => {
        list.innerHTML = items.length
          ? `<ul class="timeline">${items.map(newsHTML).join("")}</ul>`
          : `<p class="notice">No news yet.</p>`;
      };
      const cats = ["All", ...new Set(news.map((n) => n.category).filter(Boolean))];
      if (filters && cats.length > 2) {
        filters.innerHTML = cats
          .map((c) => `<button type="button" data-cat="${esc(c)}" class="${c === "All" ? "active" : ""}">${esc(c)}</button>`)
          .join("");
        filters.addEventListener("click", (e) => {
          const btn = e.target.closest("button[data-cat]");
          if (!btn) return;
          filters.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b === btn));
          const c = btn.dataset.cat;
          render(c === "All" ? news : news.filter((n) => n.category === c));
        });
      }
      render(news);
    } catch (err) {
      console.error(err);
      fail(list, "news");
    }
  }

  async function initHomeNews() {
    const box = $("#home-news");
    if (!box) return;
    try {
      const news = (await window.SiteData.loadNews()).slice(0, 4);
      box.innerHTML = news.length
        ? `<ul class="news-compact">${news
            .map((n) => `<li><span class="date">${fmtDate(n.date)}</span><span>${newsTitle(n)}</span></li>`)
            .join("")}</ul>`
        : `<p class="notice">No news yet.</p>`;
    } catch (err) {
      console.error(err);
      fail(box, "news");
    }
  }

  /* ---------------- team ---------------- */
  function initials(name) {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  }

  function avatarHTML(m) {
    return m.photo
      ? `<img class="avatar" src="${esc(m.photo)}" alt="${esc(m.name)}" loading="lazy">`
      : `<div class="avatar" aria-hidden="true">${esc(initials(m.name))}</div>`;
  }

  function memberHTML(m) {
    const name = m.link ? `<a href="${esc(m.link)}"${linkAttrs(m.link)}>${esc(m.name)}</a>` : esc(m.name);
    const year = m.year ? ` · ${esc(m.year)}` : "";
    const email = m.email ? `<div class="email"><a href="mailto:${esc(m.email)}">${esc(m.email)}</a></div>` : "";
    const bio = m.bio ? `<p class="bio">${esc(m.bio)}</p>` : "";
    return `<div class="member">${avatarHTML(m)}<div><div class="name">${name}</div><div class="role">${esc(m.role)}${year}</div>${bio}${email}</div></div>`;
  }

  async function initTeam() {
    const current = $("#team-current");
    const alumni = $("#team-alumni");
    if (!current && !alumni) return;
    try {
      const team = await window.SiteData.loadTeam();
      const isAlumni = (m) => /^alumni$/i.test(m.status || "");
      const cur = team.filter((m) => !isAlumni(m));
      const old = team.filter(isAlumni);

      if (current) {
        const roles = [...new Set(cur.map((m) => m.role || "Member"))].sort(
          (a, b) => (ROLE_ORDER.indexOf(a) + 1 || 99) - (ROLE_ORDER.indexOf(b) + 1 || 99)
        );
        current.innerHTML = cur.length
          ? roles
              .map((r) => {
                const list = cur.filter((m) => (m.role || "Member") === r);
                return `<section class="member-group"><h3>${esc(r)}${list.length > 1 ? "s" : ""}</h3><div class="members">${list.map(memberHTML).join("")}</div></section>`;
              })
              .join("")
          : `<p class="notice">No current members listed.</p>`;
      }
      if (alumni) {
        alumni.innerHTML = old.length
          ? `<ul class="alumni-list">${old
              .map((m) => {
                const name = m.link ? `<a href="${esc(m.link)}"${linkAttrs(m.link)}>${esc(m.name)}</a>` : esc(m.name);
                const meta = [m.role, m.year].filter(Boolean).join(", ");
                return `<li><span class="name">${name}</span><span class="muted">${esc(meta)}</span>${m.bio ? `<div class="muted">${esc(m.bio)}</div>` : ""}</li>`;
              })
              .join("")}</ul>`
          : `<p class="notice">No alumni listed yet.</p>`;
      }
    } catch (err) {
      console.error(err);
      if (current) fail(current, "team members");
      if (alumni) alumni.innerHTML = "";
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initPublications();
    initHomePubs();
    initNews();
    initHomeNews();
    initTeam();
  });
})();

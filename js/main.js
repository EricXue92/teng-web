/* Page behaviour: navigation + rendering of data-driven sections.
   Each render function only runs when its container exists on the page. */
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);

  const esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );

  const fmtDate = (iso) => {
    const d = new Date(iso);
    if (isNaN(d)) return esc(iso);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isExternal = (url) => /^https?:\/\//i.test(url);
  const linkAttrs = (url) =>
    isExternal(url) ? ' target="_blank" rel="noopener"' : "";

  /* Sheet text may contain Markdown-style links: "see [Prof. X](https://…)".
     Everything else is escaped as plain text. */
  const richText = (s) => {
    const re = /\[([^\]]+)\]\(([^)\s]+)\)/g;
    const str = String(s ?? "");
    let out = "";
    let last = 0;
    let m;
    while ((m = re.exec(str))) {
      out += esc(str.slice(last, m.index));
      const u = safeUrl(m[2]);
      out += u
        ? `<a href="${esc(u)}"${linkAttrs(u)}>${esc(m[1])}</a>`
        : esc(m[1]);
      last = m.index + m[0].length;
    }
    return out + esc(str.slice(last));
  };

  /* Only allow http(s), mailto and relative paths from user-editable data;
     anything else (javascript:, data:, …) is dropped. */
  const safeUrl = (url) => {
    const u = String(url ?? "").trim();
    if (!u) return "";
    if (/^(https?:\/\/|mailto:)/i.test(u)) return u;
    if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return ""; // any other scheme
    if (u.startsWith("//")) return "";
    return u; // relative path such as team.html or assets/img/x.jpg
  };

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

  const ROLE_ORDER = [
    "Postdoc",
    "PhD Student",
    "MPhil Student",
    "Research Assistant",
    "Visiting Scholar",
  ];

  /* ---------------- navigation ---------------- */
  function initNav() {
    const here = (
      location.pathname.split("/").pop() || "index.html"
    ).toLowerCase();
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
  /* Journal-style reference, as in Dr. Teng's CV:
     Li, X., Teng, Y.*, & Pan, W. (2024). Title. Journal, 165(2), 105556. */
  const givenInitials = (given) =>
    given
      .split(/[\s.]+/)
      .filter(Boolean)
      .map((w) =>
        w
          .split("-")
          .filter(Boolean)
          .map((x) => `${x[0].toUpperCase()}.`)
          .join("-"),
      )
      .join(" ");

  function authorsHTML(authors) {
    const names = (authors || []).map((a) => {
      const name = esc(
        `${a.family}, ${givenInitials(a.given)}`.replace(/, $/, ""),
      );
      const star = a.corresponding ? "*" : "";
      const owner = a.family === "Teng" && /^y/i.test(a.given);
      return owner ? `<strong>${name}${star}</strong>` : name + star;
    });
    if (names.length < 2) return names.join("");
    return `${names.slice(0, -1).join(", ")}, &amp; ${names[names.length - 1]}`;
  }

  function pubHTML(p) {
    const authors = authorsHTML(p.authors);
    const year = p.year ? `(${esc(p.year)}).` : "";
    const url = safeUrl(p.url);
    const stop = /[.?!]$/.test(p.title) ? "" : ".";
    const title = url
      ? `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(p.title)}</a>${stop}`
      : esc(p.title) + stop;
    const dash = (s) => esc(String(s).replace(/\s*-+\s*/g, "–"));
    const patent = p.type === "patent";
    let source = p.journal
      ? patent
        ? esc(p.journal)
        : `<em>${esc(p.journal)}</em>`
      : "";
    if (source) {
      if (p.volume) {
        source += `, <em>${esc(p.volume)}</em>${p.issue ? `(${dash(p.issue)})` : ""}`;
      }
      const pages = p.pages || p.article;
      if (pages)
        source += `, ${p.volume || !/\d-+\d/.test(pages) ? "" : "pp. "}${dash(pages)}`;
      source += ".";
    }
    // Without authors the title leads: "Title. (2024). Journal."
    const head = authors ? [authors, year, title] : [title, year];
    return `<li class="pub">${[...head, source].filter(Boolean).join(" ")}</li>`;
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
      .map(
        ([y, list]) =>
          `<section class="year-group"><h3>${esc(y)}</h3><ul class="pub-list">${list.map(pubHTML).join("")}</ul></section>`,
      )
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
            const n =
              k === "All"
                ? pubs.length
                : pubs.filter((p) => pubKind(p) === k).length;
            return `<button type="button" data-kind="${esc(k)}" class="${k === "All" ? "active" : ""}">${esc(k)} <span class="muted">${n}</span></button>`;
          })
          .join("");
        filters.addEventListener("click", (e) => {
          const btn = e.target.closest("button[data-kind]");
          if (!btn) return;
          filters
            .querySelectorAll("button")
            .forEach((b) => b.classList.toggle("active", b === btn));
          const k = btn.dataset.kind;
          renderPubGroups(
            list,
            k === "All" ? pubs : pubs.filter((p) => pubKind(p) === k),
          );
        });
      }
      renderPubGroups(list, pubs);
    } catch (err) {
      console.error(err);
      fail(list, "publications");
    }
  }

  /* ---------------- news ---------------- */
  function newsTitle(n) {
    const link = safeUrl(n.link);
    return link
      ? `<a class="title" href="${esc(link)}"${linkAttrs(link)}>${esc(n.title)}</a>`
      : `<span class="title">${esc(n.title)}</span>`;
  }

  function newsHTML(n) {
    const tag = n.category ? `<span class="tag">${esc(n.category)}</span>` : "";
    const desc = n.description
      ? `<p class="desc">${esc(n.description)}</p>`
      : "";
    const image = safeUrl(n.image);
    const img = image ? `<img src="${esc(image)}" alt="" loading="lazy">` : "";
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
      const cats = [
        "All",
        ...new Set(news.map((n) => n.category).filter(Boolean)),
      ];
      if (filters && cats.length > 2) {
        filters.innerHTML = cats
          .map(
            (c) =>
              `<button type="button" data-cat="${esc(c)}" class="${c === "All" ? "active" : ""}">${esc(c)}</button>`,
          )
          .join("");
        filters.addEventListener("click", (e) => {
          const btn = e.target.closest("button[data-cat]");
          if (!btn) return;
          filters
            .querySelectorAll("button")
            .forEach((b) => b.classList.toggle("active", b === btn));
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

  /* ---------------- team ---------------- */
  function initials(name) {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("");
  }

  function avatarHTML(m) {
    const photo = safeUrl(m.photo);
    return photo
      ? `<img class="avatar" src="${esc(photo)}" alt="${esc(m.name)}" loading="lazy">`
      : `<div class="avatar" aria-hidden="true">${esc(initials(m.name))}</div>`;
  }

  function memberHTML(m) {
    const link = safeUrl(m.link);
    const name = link
      ? `<a href="${esc(link)}"${linkAttrs(link)}>${esc(m.name)}</a>`
      : esc(m.name);
    // current members: an open-ended year such as "2026–" is shown as "2026–Present"
    const span = (m.year || "").trim().replace(/\s*[-–—]$/, "–Present");
    const year = span ? ` · ${esc(span)}` : "";
    const email = /^[^\s@]+@[^\s@]+$/.test(m.email || "")
      ? `<div class="email"><a href="mailto:${esc(m.email)}">${esc(m.email)}</a></div>`
      : "";
    const bio = m.bio ? `<p class="bio">${richText(m.bio)}</p>` : "";
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
          (a, b) =>
            (ROLE_ORDER.indexOf(a) + 1 || 99) -
            (ROLE_ORDER.indexOf(b) + 1 || 99),
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
          ? `<div class="members">${old.map(memberHTML).join("")}</div>`
          : `<p class="notice">No alumni listed yet.</p>`;
      }
    } catch (err) {
      console.error(err);
      if (current) fail(current, "team members");
      if (alumni) alumni.innerHTML = "";
    }
  }

  /* ---------------- projects ---------------- */
  function projectHTML(pr) {
    const link = safeUrl(pr.link);
    const title = link
      ? `<a href="${esc(link)}"${linkAttrs(link)}>${esc(pr.title)}</a>`
      : esc(pr.title);
    const meta = [pr.funder, pr.period, pr.amount]
      .filter(Boolean)
      .map(esc)
      .join(" · ");
    const role = pr.role ? `<span class="tag">${esc(pr.role)}</span>` : "";
    const desc = pr.description
      ? `<p class="desc">${esc(pr.description)}</p>`
      : "";
    const head = `${role}<h3>${title}</h3><div class="meta">${meta}</div>${desc}`;

    // Optional long text (details) and figures (images): the title becomes a
    // toggle that opens them in place.
    const paras = (pr.details || "")
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
    const figs = (pr.images || "")
      .split(/[;\n]+/)
      .map((u) => safeUrl(u))
      .filter(Boolean);
    if (!paras.length && !figs.length) {
      return `<li class="card project">${head}</li>`;
    }
    const more = link
      ? `<p><a href="${esc(link)}"${linkAttrs(link)}>Project website</a></p>`
      : "";
    const body =
      paras.map((p) => `<p>${esc(p)}</p>`).join("") +
      more +
      figs
        .map(
          (u, i) =>
            `<a href="${esc(u)}" target="_blank" rel="noopener"><img src="${esc(u)}" alt="Figure ${i + 1}: ${esc(pr.title)}" loading="lazy"></a>`,
        )
        .join("");
    const toggle = `<button type="button" class="project-toggle" aria-expanded="false">${esc(pr.title)}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>`;
    return `<li class="card project">${role}<h3>${toggle}</h3><div class="meta">${meta}</div>${desc}<div class="project-details" hidden>${body}</div></li>`;
  }

  async function initProjects() {
    const box = $("#projects-list");
    if (!box) return;
    try {
      const projects = await window.SiteData.loadProjects();
      const isOngoing = (p) => /^ongoing$/i.test(p.status || "");
      const groups = [
        ["Ongoing", projects.filter(isOngoing)],
        ["Completed", projects.filter((p) => !isOngoing(p))],
      ].filter(([, list]) => list.length);
      box.innerHTML = groups.length
        ? groups
            .map(
              ([name, list]) =>
                `<section class="year-group"><h3>${name}</h3><ul class="project-list">${list.map(projectHTML).join("")}</ul></section>`,
            )
            .join("")
        : `<p class="notice">No projects listed yet.</p>`;
      box.addEventListener("click", (e) => {
        const btn = e.target.closest(".project-toggle");
        if (!btn) return;
        const open = btn.getAttribute("aria-expanded") !== "true";
        btn.setAttribute("aria-expanded", String(open));
        btn.closest(".project").querySelector(".project-details").hidden =
          !open;
      });
    } catch (err) {
      console.error(err);
      fail(box, "projects");
    }
  }

  /* ---------------- awards ---------------- */
  const AWARD_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="9" r="5.5"/><path d="m8.5 13.5-1.5 8 5-2.8 5 2.8-1.5-8"/></svg>`;

  function awardHTML(a) {
    const link = safeUrl(a.link);
    const title = link
      ? `<a href="${esc(link)}"${linkAttrs(link)}>${esc(a.title)}</a>`
      : esc(a.title);
    const facts = [
      ["Year", a.year],
      ["Awarded by", a.issuer],
    ]
      .filter(([, v]) => v)
      .map(([k, v]) => `<div><dt>${k}:</dt><dd>${esc(v)}</dd></div>`)
      .join("");
    const note = a.note ? `<p class="note">${esc(a.note)}</p>` : "";
    // Certificate picture (image column); without one a placeholder keeps the
    // card shape.
    const img = safeUrl(a.image);
    const thumb = img
      ? `<a class="award-thumb" href="${esc(img)}" target="_blank" rel="noopener"><img src="${esc(img)}" alt="Certificate: ${esc(a.title)}" loading="lazy"></a>`
      : `<span class="award-thumb placeholder">${AWARD_ICON}</span>`;
    return `<li class="award"><div class="award-body"><h2>${title}</h2><dl>${facts}</dl>${note}</div>${thumb}</li>`;
  }

  async function initAwards() {
    const box = $("#awards-list");
    if (!box) return;
    try {
      const awards = await window.SiteData.loadAwards();
      box.innerHTML = awards.length
        ? `<ul class="award-list">${awards.map(awardHTML).join("")}</ul>`
        : `<p class="notice">No awards listed yet.</p>`;
    } catch (err) {
      console.error(err);
      fail(box, "awards");
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initPublications();
    initNews();
    initTeam();
    initProjects();
    initAwards();
  });
})();

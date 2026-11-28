/* Core apps: README, Projects, Task Manager, Terminal, Mail, Notepad, Recycle Bin, Achievements, Settings. */
(function () {
  const { P, $, $$, h, esc, paintAvatar, Sound, toast, confetti, Ach, store, fmtTime, fmtDate } = OS;
  const { registerApp, open } = OS.WM;

  /* ================= README (About) ================= */
  registerApp("readme", {
    title: "README.md", icon: "file-text", color: "#3b82f6", w: 620, h: 560,
    render({ body }) {
      Ach.unlock("readme");
      body.innerHTML = `
        <div class="app-pad md reveal">
          <div class="readme-head">
            <div class="avatar avatar-md"></div>
            <div>
              <h1>${esc(P.name)}</h1>
              <p class="muted">${esc(P.role)} · ${esc(P.location)}</p>
              ${P.status ? `<span class="status-pill">${esc(P.status)}</span>` : ""}
            </div>
          </div>
          <p style="font-size:16px;color:var(--text)">${esc(P.tagline)}</p>
          <h2>About me</h2>
          <div>${P.about.map((p) => `<p>${esc(p)}</p>`).join("")}</div>
          <h2>Quick facts</h2>
          <div class="facts">${P.facts.map(([k, v]) => `<div class="fact"><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join("")}</div>
          ${P.experience.length ? `<h2>Experience</h2>
          <div class="timeline">${P.experience.map((x) => `
            <div class="tl-item"><b>${esc(x.role)}</b> <span class="muted">@ ${esc(x.company)}</span><div class="tiny">${esc(x.period)}</div>
            <ul>${x.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div>`).join("")}
          </div>` : ""}
          <h2>Education</h2>
          <div class="timeline">${P.education.map((x) => `<div class="tl-item"><b>${esc(x.degree)}</b><div class="muted" style="font-size:13px">${esc(x.school)}</div><div class="tiny">${esc(x.period)}</div></div>`).join("")}</div>
          <div class="chips" style="margin-top:22px;gap:8px">
            <button class="btn accent" data-go="projects"><i class="ti ti-folder"></i> See my projects</button>
            <button class="btn" data-go="mail"><i class="ti ti-mail"></i> Contact me</button>
            ${P.resumeUrl ? `<a class="btn" href="${esc(P.resumeUrl)}" target="_blank" rel="noopener"><i class="ti ti-download"></i> Resume</a>` : ""}
          </div>
        </div>`;
      paintAvatar($(".avatar", body));
      $$("[data-go]", body).forEach((b) => b.addEventListener("click", () => open(b.dataset.go)));
    }
  });

  /* ================= Projects (file explorer) ================= */
  registerApp("projects", {
    title: "Projects", icon: "folder", color: "#f59e0b", w: 780, h: 520,
    render(ctx) {
      const { body } = ctx;
      body.classList.add("no-scroll");
      body.innerHTML = `
        <div class="explorer">
          <aside class="ex-side">
            <div class="tiny">Quick access</div>
            <button data-nav="home" class="on"><i class="ti ti-folder"></i> Projects</button>
            <button data-nav="readme"><i class="ti ti-file-text"></i> README.md</button>
            <button data-nav="skills"><i class="ti ti-activity"></i> Skills</button>
            <button data-nav="mail"><i class="ti ti-mail"></i> Contact</button>
            <div class="tiny" style="margin-top:14px">Projects</div>
            ${P.projects.map((p) => `<button data-proj="${esc(p.id)}"><i class="ti ti-${esc(p.icon)}" style="color:${esc(p.color)}"></i> ${esc(p.title)}</button>`).join("")}
          </aside>
          <section class="ex-main">
            <div class="ex-bar">
              <button class="back" aria-label="Back"><i class="ti ti-arrow-left"></i></button>
              <button class="up" aria-label="Up"><i class="ti ti-arrow-up"></i></button>
              <div class="ex-path"></div>
            </div>
            <div class="ex-content"></div>
          </section>
        </div>`;
      const content = $(".ex-content", body), path = $(".ex-path", body);
      const hist = [];
      function show(projId, push = true) {
        if (push) hist.push(projId || null);
        $(".back", body).disabled = hist.length < 2;
        $(".up", body).disabled = !projId;
        $$(".ex-side button", body).forEach((b) => b.classList.toggle("on", projId ? b.dataset.proj === projId : b.dataset.nav === "home"));
        content.scrollTop = 0;
        if (!projId) {
          path.innerHTML = `<i class="ti ti-device-desktop"></i> ~ / projects`;
          ctx.setTitle("Projects");
          content.innerHTML = `<div class="tiny" style="margin-bottom:10px">${P.projects.length} items · ${OS.tapToOpen() ? "tap" : "double-click"} to open</div>
            <div class="ex-grid">${P.projects.map((p, i) => `
              <button class="ex-card" data-id="${esc(p.id)}" style="--c:${esc(p.color)};animation-delay:${i * 60}ms">
                <div class="ex-thumb"><i class="ti ti-${esc(p.icon)}"></i></div>
                <div class="meta"><b>${esc(p.title)}</b><small>${esc(p.tagline)}</small></div>
              </button>`).join("")}</div>`;
          $$(".ex-card", content).forEach((c) => {
            c.addEventListener("dblclick", () => show(c.dataset.id));
            c.addEventListener("click", (e) => { if (OS.tapToOpen() || e.detail === 0) show(c.dataset.id); });
            c.addEventListener("keydown", (e) => { if (e.key === "Enter") show(c.dataset.id); });
          });
          return;
        }
        const p = P.projects.find((x) => x.id === projId); if (!p) return;
        Ach.unlock("projects");
        Sound.click();
        path.innerHTML = `<i class="ti ti-device-desktop"></i> ~ / projects / ${esc(p.id)}`;
        ctx.setTitle(p.title);
        content.innerHTML = `
          <div class="reveal" style="--c:${esc(p.color)}">
            <div class="proj-hero"><i class="ti ti-${esc(p.icon)} big"></i><div><h2>${esc(p.title)}</h2><p>${esc(p.tagline)} · ${esc(p.year)}</p></div></div>
            <p style="line-height:1.7;margin:0 0 16px" class="muted">${esc(p.description)}</p>
            <ul class="proj-list">${(p.highlights || []).map((x) => `<li><i class="ti ti-sparkles"></i>${esc(x)}</li>`).join("")}</ul>
            <div class="chips" style="margin-bottom:18px">${p.tech.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>
            <div class="chips" style="gap:8px">
              ${p.links?.demo ? `<button class="btn accent" data-demo><i class="ti ti-player-play"></i> Live demo</button>` : ""}
              ${p.links?.live ? `<a class="btn${p.links?.demo ? "" : " accent"}" href="${esc(p.links.live)}" target="_blank" rel="noopener"><i class="ti ti-external-link"></i> Visit the website</a>` : ""}
              ${p.links?.code ? `<a class="btn" href="${esc(p.links.code)}" target="_blank" rel="noopener"><i class="ti ti-brand-github"></i> Source code</a>` : ""}
              ${!p.links?.demo && !p.links?.live && !p.links?.code ? `<button class="btn" data-ask><i class="ti ti-mail"></i> Ask me about this project</button>` : ""}
            </div>
            <div class="proj-demo hidden"></div>
          </div>`;
        $("[data-ask]", content)?.addEventListener("click", () => open("mail"));
        $("[data-demo]", content)?.addEventListener("click", () => {
          const box = $(".proj-demo", content);
          const isVideo = /\.(mp4|webm|mov)$/i.test(p.links.demo);
          if (!box.firstChild) box.innerHTML = isVideo
            ? `<video src="${esc(p.links.demo)}" controls autoplay muted playsinline preload="metadata" aria-label="${esc(p.title)} demo"></video>`
            : `<img src="${esc(p.links.demo)}" alt="${esc(p.title)} demo">`;
          box.classList.toggle("hidden");
          const vid = $("video", box);
          if (vid) box.classList.contains("hidden") ? vid.pause() : vid.play().catch(() => {});
          if (!box.classList.contains("hidden")) box.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
      }
      $(".back", body).addEventListener("click", () => { hist.pop(); show(hist[hist.length - 1], false); });
      $(".up", body).addEventListener("click", () => show(null));
      $$("[data-proj]", body).forEach((b) => b.addEventListener("click", () => show(b.dataset.proj)));
      $$("[data-nav]", body).forEach((b) => b.addEventListener("click", () => b.dataset.nav === "home" ? show(null) : open(b.dataset.nav)));
      ctx.show = show;
      show(ctx.args.project || null);
    },
    onArgs(ctx, args) { if (args.project && ctx.show) ctx.show(args.project); }
  });

  /* ================= Security blog (Medium posts) ================= */
  const BLOG = P.blog && P.blog.posts && P.blog.posts.length ? P.blog : null;
  const fmtNum = (n) => n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "") + "k" : String(n);
  const fmtDay = (d) => new Date(d + "T00:00:00").toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  if (BLOG) registerApp("blog", {
    title: "Security Blog", icon: "shield-lock", color: "#10b981", w: 760, h: 580,
    render(ctx) {
      const { body } = ctx;
      const posts = BLOG.posts;
      const kinds = [...new Set(posts.map((p) => p.kind).filter(Boolean))];
      const total = (k) => posts.reduce((s, p) => s + (Number(p[k]) || 0), 0);
      const stats = [["views", "Views"], ["reads", "Reads"], ["claps", "Claps"]].filter(([k]) => total(k) > 0);
      body.innerHTML = `
        <div class="blog app-pad reveal">
          <div class="blog-head">
            <div>
              <h2><i class="ti ti-brand-medium"></i> Security write-ups</h2>
              <p class="muted">Android malware analysis, CTF write-ups and app hacking, published on Medium.</p>
            </div>
            <a class="btn accent" href="${esc(BLOG.url)}" target="_blank" rel="noopener"><i class="ti ti-external-link"></i> ${esc(BLOG.handle || "Medium")}</a>
          </div>
          <div class="blog-stats">
            <div><b>${posts.length}</b><small>Posts</small></div>
            ${stats.map(([k, l]) => `<div><b>${fmtNum(total(k))}</b><small>${l}</small></div>`).join("")}
            <div><b>${kinds.length}</b><small>Topics</small></div>
          </div>
          ${kinds.length > 1 ? `<div class="blog-filter chips"><button class="chip on" data-kind="">All</button>${kinds.map((k) => `<button class="chip" data-kind="${esc(k)}">${esc(k)}</button>`).join("")}</div>` : ""}
          <div class="blog-list">${posts.map((p, i) => `
            <a class="blog-card" href="${esc(p.url)}" target="_blank" rel="noopener" data-kind="${esc(p.kind || "")}" style="animation-delay:${i * 50}ms">
              ${p.image ? `<div class="blog-img"><img src="${esc(p.image)}" alt="" loading="lazy" referrerpolicy="no-referrer"></div>` : ""}
              <div class="blog-body">
                <div class="tiny">${p.kind ? `<span class="blog-kind">${esc(p.kind)}</span> · ` : ""}${esc(fmtDay(p.date))}${p.minutes ? ` · ${p.minutes} min read` : ""}</div>
                <h3>${esc(p.title)}</h3>
                <p class="muted">${esc(p.summary || "")}</p>
                <div class="blog-foot">
                  <div class="chips">${(p.tags || []).map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>
                  ${[["views", "eye"], ["reads", "book"], ["claps", "hand-click"]].filter(([k]) => p[k]).map(([k, ic]) => `<span class="blog-stat"><i class="ti ti-${ic}"></i>${fmtNum(p[k])}</span>`).join("")}
                </div>
              </div>
            </a>`).join("")}</div>
          <a class="blog-more" href="${esc(BLOG.url)}" target="_blank" rel="noopener">
            <span class="app-ico md" style="--ico:#10b981"><i class="ti ti-brand-medium"></i></span>
            <span><b>Want to read more from 5h3nr0n?</b><small>New write-ups on malware analysis, CTFs and Android hacking go up on Medium first. Follow along there.</small></span>
            <span class="btn accent">Visit Medium <i class="ti ti-arrow-up-right"></i></span>
          </a>
        </div>`;
      $$(".blog-img img", body).forEach((img) => img.addEventListener("error", () => img.parentElement.remove()));
      $$(".blog-filter [data-kind]", body).forEach((b) => b.addEventListener("click", () => {
        Sound.click();
        $$(".blog-filter .chip", body).forEach((c) => c.classList.toggle("on", c === b));
        $$(".blog-card", body).forEach((c) => c.classList.toggle("hidden", !!b.dataset.kind && c.dataset.kind !== b.dataset.kind));
      }));
    }
  });

  /* ================= Task Manager (skills) ================= */
  registerApp("skills", {
    title: "Task Manager — Skills", icon: "activity", color: "#ef4444", w: 600, h: 540,
    render(ctx) {
      const { body } = ctx;
      body.classList.add("no-scroll");
      const groups = [...new Set(P.skills.map((s) => s.group))];
      body.innerHTML = `
        <div class="tm">
          <div class="tm-tabs"><button class="on" data-tab="proc">Processes</button><button data-tab="perf">Performance</button></div>
          <div class="tm-body">
            <div class="tm-graph"><div class="row"><b>Brain usage</b><span class="muted"><span class="cpu">0</span>% · learning in progress</span></div><canvas></canvas></div>
            <div class="tab proc">
              ${groups.map((g) => `<div class="tm-group">${esc(g)}</div>` + P.skills.filter((s) => s.group === g).map((s) => `
                <div class="tm-row" data-lvl="${s.level}"><span>${esc(s.name)}</span><div class="bar"><i style="width:0"></i></div><span class="pct">0%</span></div>`).join("")).join("")}
            </div>
            <div class="tab perf hidden">
              <div class="tm-stats">
                <div class="fact"><small>Uptime</small><b class="uptime">0s</b></div>
                <div class="fact"><small>Projects shipped</small><b>${P.projects.length}</b></div>
                <div class="fact"><small>Skills loaded</small><b>${P.skills.length}</b></div>
                <div class="fact"><small>Bugs fixed</small><b class="bugs">1,024</b></div>
                <div class="fact"><small>Coffee level</small><b class="coffee">87%</b></div>
                <div class="fact"><small>Status</small><b style="color:#4ade80">Ready to build</b></div>
              </div>
              <p class="tiny" style="margin-top:14px">Numbers may be slightly exaggerated. The skills are not.</p>
            </div>
          </div>
        </div>`;
      $$(".tm-tabs button", body).forEach((b) => b.addEventListener("click", () => {
        $$(".tm-tabs button", body).forEach((x) => x.classList.toggle("on", x === b));
        $(".proc", body).classList.toggle("hidden", b.dataset.tab !== "proc");
        $(".perf", body).classList.toggle("hidden", b.dataset.tab !== "perf");
      }));
      const rows = $$(".tm-row", body);
      setTimeout(() => rows.forEach((r, i) => setTimeout(() => {
        $(".bar i", r).style.width = r.dataset.lvl + "%"; $(".pct", r).textContent = r.dataset.lvl + "%";
      }, i * 50)), 200);

      const cv = $("canvas", body), g = cv.getContext("2d");
      const pts = Array.from({ length: 60 }, () => 50 + Math.random() * 20);
      const t0 = Date.now();
      let bugs = 1024;
      const tick = () => {
        pts.shift(); pts.push(Math.max(20, Math.min(98, pts[pts.length - 1] + (Math.random() * 18 - 9))));
        $(".cpu", body).textContent = Math.round(pts[pts.length - 1]);
        rows.forEach((r) => {
          if (Math.random() < 0.3) {
            const v = Math.max(5, Math.min(100, +r.dataset.lvl + Math.round(Math.random() * 8 - 4)));
            $(".bar i", r).style.width = v + "%"; $(".pct", r).textContent = v + "%";
          }
        });
        const s = Math.round((Date.now() - t0) / 1000);
        $(".uptime", body).textContent = s < 60 ? s + "s" : Math.floor(s / 60) + "m " + (s % 60) + "s";
        if (Math.random() < 0.3) $(".bugs", body).textContent = (++bugs).toLocaleString();
        $(".coffee", body).textContent = Math.max(5, 87 - Math.floor(s / 10)) + "%";
      };
      const draw = () => {
        const dpr = devicePixelRatio || 1, w = cv.clientWidth, hh = cv.clientHeight;
        if (cv.width !== w * dpr) { cv.width = w * dpr; cv.height = hh * dpr; }
        g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, hh);
        const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#7c6cff";
        g.strokeStyle = "rgba(128,128,160,.15)"; g.lineWidth = 1;
        for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(0, (hh / 4) * i); g.lineTo(w, (hh / 4) * i); g.stroke(); }
        g.beginPath();
        pts.forEach((p, i) => { const x = (i / (pts.length - 1)) * w, y = hh - (p / 100) * hh; i ? g.lineTo(x, y) : g.moveTo(x, y); });
        g.strokeStyle = accent; g.lineWidth = 2; g.stroke();
        g.lineTo(w, hh); g.lineTo(0, hh); g.closePath();
        const grad = g.createLinearGradient(0, 0, 0, hh); grad.addColorStop(0, accent + "66"); grad.addColorStop(1, accent + "00");
        g.fillStyle = grad; g.fill();
      };
      const iv = setInterval(() => { tick(); draw(); }, 700);
      draw();
      ctx.onClose(() => clearInterval(iv));
    }
  });

  /* ================= Terminal ================= */
  const FILES = {
    "readme.md": () => `${P.name} — ${P.role}\n${P.tagline}\n\n${P.about.join("\n\n")}`,
    "contact.txt": () => `email: ${P.email}\n` + P.socials.map((s) => `${s.label.toLowerCase()}: ${s.url}`).join("\n"),
    "secret.txt": () => "You found the secret file. The secret is: I really like building things. Also try 'matrix'."
  };
  const OPENABLE = ["readme", "projects", ...(BLOG ? ["blog"] : []), "skills", "mail", "music", "paint", "snake", "settings", "bin", "achievements", "terminal"];

  registerApp("terminal", {
    title: "Terminal", icon: "terminal-2", color: "#10b981", w: 680, h: 440, single: false,
    render(ctx) {
      const { body } = ctx;
      body.classList.add("no-scroll");
      const user = P.firstName.toLowerCase().replace(/\W/g, "") || "guest";
      const promptHtml = `<span class="prompt">${esc(user)}@portfolio</span>:<span class="path">~</span>$ `;
      body.innerHTML = `<div class="term"><div class="out"></div><div class="term-input-row"><span>${promptHtml}</span><input class="term-input" aria-label="Terminal input" autocomplete="off" spellcheck="false" autocapitalize="off" /></div></div>`;
      const term = $(".term", body), out = $(".out", body), input = $(".term-input", body);
      const history = store.get("termHistory", []);
      let hi = history.length, count = 0;
      const print = (html, cls = "") => { out.appendChild(h(`<div class="line ${cls}">${html}</div>`)); term.scrollTop = term.scrollHeight; };
      const ascii = `<span class="hl">   __  ___
  /  |/  /
 / /|_/ /
/_/  /_/ </span>`;

      const cmds = {
        help: () => print(`<span class="accent">Available commands</span>
  <span class="ok">whoami</span>       who is this person?
  <span class="ok">about</span>        open README
  <span class="ok">projects</span>     list my projects (try <span class="ok">projects nova</span>)
  <span class="ok">blog</span>         my security write-ups
  <span class="ok">skills</span>       my tech stack
  <span class="ok">experience</span>   where I've worked
  <span class="ok">contact</span>      ways to reach me
  <span class="ok">open</span> &lt;app&gt;   open an app (${OPENABLE.join(", ")})
  <span class="ok">ls</span>, <span class="ok">cat</span> &lt;file&gt;  look around
  <span class="ok">neofetch</span>     system info
  <span class="ok">theme</span> &lt;dark|light&gt;
  <span class="ok">wallpaper</span>    next wallpaper
  <span class="ok">matrix</span>       follow the white rabbit
  <span class="ok">date</span>, <span class="ok">echo</span>, <span class="ok">history</span>, <span class="ok">clear</span>, <span class="ok">exit</span>
<span class="dim">Psst… there are a few hidden commands too.</span>`),
        whoami: () => print(`<span class="hl">${esc(P.name)}</span> — ${esc(P.role)} based in ${esc(P.location)}.\n${esc(P.tagline)}`),
        about: () => { print("Opening README.md…", "dim"); open("readme"); },
        projects: (a) => {
          if (a[0]) {
            const p = P.projects.find((x) => x.id === a[0] || x.title.toLowerCase() === a.join(" ").toLowerCase());
            if (!p) return print(`projects: no project called '${esc(a.join(" "))}'`, "err");
            print(`<span class="hl">${esc(p.title)}</span> (${esc(p.year)}) — ${esc(p.tagline)}\n${esc(p.description)}\n<span class="dim">stack:</span> ${p.tech.map(esc).join(", ")}\n<span class="dim">opening in Projects…</span>`);
            return open("projects", { project: p.id });
          }
          print(P.projects.map((p) => `<span class="ok">${esc(p.id.padEnd(14))}</span>${esc(p.tagline)}`).join("\n") + `\n<span class="dim">Type 'projects &lt;name&gt;' for details.</span>`);
        },
        blog: () => {
          if (!BLOG) return print("blog: nothing published yet", "dim");
          print(BLOG.posts.map((p) => `<span class="dim">${esc(p.date)}</span>  <a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.title)}</a>`).join("\n") + `\n<span class="dim">opening the Security Blog…</span>`);
          open("blog");
        },
        skills: () => {
          const groups = [...new Set(P.skills.map((s) => s.group))];
          print(groups.map((g) => `<span class="accent">${esc(g)}</span>\n` + P.skills.filter((s) => s.group === g).map((s) => {
            const n = Math.round(s.level / 5);
            return `  ${esc(s.name.padEnd(25))}<span class="ok">${"█".repeat(n)}</span><span class="dim">${"░".repeat(20 - n)}</span> ${s.level}%`;
          }).join("\n")).join("\n"));
        },
        experience: () => P.experience.length ? print(P.experience.map((x) => `<span class="hl">${esc(x.role)}</span> @ ${esc(x.company)} <span class="dim">(${esc(x.period)})</span>\n` + x.points.map((p) => `  • ${esc(p)}`).join("\n")).join("\n\n")) : print(`Currently studying: ${P.education.map((e) => esc(e.degree + " @ " + e.school)).join(", ")}\n<span class="ok">${esc(P.status || "Open to opportunities")}</span>, internships and collaborations welcome. Type 'contact'.`),
        contact: () => print(`<span class="dim">email</span>     <a href="mailto:${esc(P.email)}">${esc(P.email)}</a>\n` + P.socials.map((s) => `<span class="dim">${esc(s.label.toLowerCase().padEnd(10))}</span><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url)}</a>`).join("\n") + `\n<span class="dim">or type 'open mail'</span>`),
        open: (a) => {
          const app = (a[0] || "").toLowerCase().replace("about", "readme").replace("contact", "mail").replace("recycle", "bin");
          if (!OPENABLE.includes(app)) return print(`open: unknown app '${esc(a[0] || "")}'. Try: ${OPENABLE.join(", ")}`, "err");
          print(`Opening ${esc(app)}…`, "dim"); open(app);
        },
        ls: () => print(`<span class="path">projects/</span>  ${Object.keys(FILES).join("  ")}`),
        cat: (a) => {
          const f = (a[0] || "").toLowerCase();
          if (!f) return print("cat: which file? try 'ls'", "err");
          if (FILES[f]) return print(esc(FILES[f]()));
          print(`cat: ${esc(f)}: No such file or directory`, "err");
        },
        cd: (a) => a[0] === "projects" || a[0] === "projects/" ? (print("Opening projects/…", "dim"), open("projects")) : print("cd: you're already where the magic happens", "dim"),
        neofetch: () => print(`<div style="display:flex;gap:24px;flex-wrap:wrap"><div>${ascii}</div><div><span class="hl">${esc(user)}@portfolio</span>
<span class="dim">-----------------</span>
<span class="accent">OS</span>: PortfolioOS 1.0 (browser edition)
<span class="accent">Host</span>: ${esc(P.name)}
<span class="accent">Role</span>: ${esc(P.role)}
<span class="accent">Uptime</span>: ${Math.round(performance.now() / 60000)} min
<span class="accent">Shell</span>: portfolio-sh
<span class="accent">Projects</span>: ${P.projects.length}
<span class="accent">Skills</span>: ${P.skills.length}
<span class="accent">Resolution</span>: ${innerWidth}x${innerHeight}
<span class="accent">Status</span>: ${esc(P.status || "Building")}</div></div>`),
        date: () => print(`${fmtDate(new Date(), true)}, ${fmtTime(new Date(), true)}`),
        echo: (a) => print(esc(a.join(" "))),
        history: () => print(history.map((c, i) => `<span class="dim">${String(i + 1).padStart(3)}</span>  ${esc(c)}`).join("\n") || "no history yet"),
        clear: () => { out.innerHTML = ""; },
        exit: () => ctx.close(),
        theme: (a) => { const t = a[0] === "light" ? "light" : a[0] === "dark" ? "dark" : null; if (!t) return print("usage: theme dark|light", "err"); OS.setTheme(t); print(`Theme set to ${t}`, "ok"); },
        wallpaper: () => { OS.nextWallpaper(); print("Wallpaper changed. Looking good.", "ok"); },
        matrix: () => matrix(),
        sudo: (a) => {
          const rest = a.join(" ");
          if (rest === "hire-me" || rest === "hire me") {
            print(`[sudo] password for recruiter: ********\n<span class="ok">Access granted.</span> Excellent choice. Initiating hiring sequence…\n<span class="hl">${esc(P.firstName)}</span> will be in touch. Or you could <a href="mailto:${esc(P.email)}">email right now</a>.`);
            Ach.unlock("hire"); confetti(); return;
          }
          if (rest.startsWith("rm")) return cmds.rm(a.slice(1));
          print(`Nice try. ${esc(user)} is not in the sudoers file. This incident will be reported.`, "err");
        },
        rm: (a) => {
          // any recursive + force delete crashes the OS: rm -rf, rm -rf /, rm -fr *, rm -r -f ~ ...
          const flags = a.filter((x) => x.startsWith("-")).join("").toLowerCase();
          if (flags.includes("r") && flags.includes("f")) {
            print("Deleting everything…", "err"); setTimeout(() => OS.bsod(), 900); return;
          }
          print("rm: permission denied (this portfolio is read-only, for your safety)", "err");
        },
        coffee: () => print(`    ( (\n     ) )\n  ........\n  |      |]\n  \\      /\n   \`----'\n<span class="dim">Here you go. Fuel for the next feature.</span>`),
        hello: () => print(`Hey there! 👋 Thanks for stopping by. Type 'help' to explore.`),
        hi: () => cmds.hello(),
        vim: () => print("You are now trapped in vim. Just kidding. Type ':q' if it makes you feel better.", "dim"),
        ":q": () => print("Freedom.", "ok"),
        ping: () => { let n = 0; const iv = setInterval(() => { print(`64 bytes from ${esc(P.firstName.toLowerCase())}: icmp_seq=${n} time=${(Math.random() * 20 + 5).toFixed(1)} ms`); if (++n > 3) { clearInterval(iv); print("Response is fast. So is my reply to emails.", "ok"); } }, 400); },
        git: (a) => print(a[0] === "blame" ? "It was me. It's always me." : a[0] === "push" ? "Everything up-to-date. Unlike my sleep schedule." : "git: try 'git blame' or 'git push'", "dim")
      };

      function matrix() {
        const cv = document.createElement("canvas"); cv.className = "matrix";
        out.appendChild(cv); term.scrollTop = term.scrollHeight;
        const g = cv.getContext("2d"); cv.width = cv.clientWidth; cv.height = 220;
        const cols = Math.floor(cv.width / 14), drops = Array(cols).fill(0).map(() => Math.random() * -20);
        let frames = 0;
        const iv = setInterval(() => {
          g.fillStyle = "rgba(11,10,22,.18)"; g.fillRect(0, 0, cv.width, cv.height);
          g.fillStyle = "#4ade80"; g.font = "13px JetBrains Mono, monospace";
          drops.forEach((y, i) => { g.fillText(String.fromCharCode(0x30a0 + Math.random() * 96), i * 14, y * 14); drops[i] = y * 14 > cv.height && Math.random() > 0.95 ? 0 : y + 1; });
          if (++frames > 140) { clearInterval(iv); print("Wake up, Neo… the portfolio has you.", "ok"); }
        }, 40);
        ctx.onClose(() => clearInterval(iv));
      }

      function run(raw) {
        const line = raw.trim();
        print(promptHtml + esc(raw));
        if (!line) return;
        history.push(line); if (history.length > 50) history.shift(); store.set("termHistory", history); hi = history.length;
        const [c, ...a] = line.split(/\s+/);
        const fn = cmds[c.toLowerCase()];
        if (fn) fn(a); else { Sound.error(); print(`command not found: ${esc(c)}. Type <span class="ok">help</span> for a list.`, "err"); }
        if (++count >= 5) Ach.unlock("hacker");
      }

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { run(input.value); input.value = ""; }
        else if (e.key === "ArrowUp") { e.preventDefault(); if (hi > 0) input.value = history[--hi]; }
        else if (e.key === "ArrowDown") { e.preventDefault(); hi = Math.min(history.length, hi + 1); input.value = history[hi] || ""; }
        else if (e.key === "Tab") {
          e.preventDefault();
          const v = input.value, parts = v.split(" ");
          const pool = parts.length > 1 ? (parts[0] === "open" ? OPENABLE : parts[0] === "cat" ? Object.keys(FILES) : parts[0] === "projects" ? P.projects.map((p) => p.id) : []) : Object.keys(cmds).filter((k) => k.length > 2);
          const m = pool.filter((k) => k.startsWith(parts[parts.length - 1]));
          if (m.length === 1) { parts[parts.length - 1] = m[0]; input.value = parts.join(" ") + " "; }
          else if (m.length > 1) print(m.join("  "), "dim");
        } else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); out.innerHTML = ""; }
      });
      term.addEventListener("mouseup", () => { if (!getSelection().toString()) input.focus(); });

      print(`<div style="display:flex;gap:18px;align-items:center">${ascii}<div><span class="hl">Welcome to PortfolioOS</span> <span class="dim">v1.0</span>\nLast login: ${fmtDate()} ${fmtTime()}\nType <span class="ok">help</span> to see what I can do.</div></div>`);
      setTimeout(() => input.focus(), 100);
    }
  });

  /* ================= Mail (contact) ================= */
  registerApp("mail", {
    title: "New message", icon: "mail", color: "#f43f5e", w: 560, h: 480,
    render({ body }) {
      body.classList.add("no-scroll");
      body.innerHTML = `
        <form class="mail" novalidate>
          <div class="mail-field"><label>To</label><span class="chip"><i class="ti ti-user"></i>${esc(P.name)} &lt;${esc(P.email)}&gt;</span></div>
          <div class="mail-field"><label for="m-from">From</label><input id="m-from" name="from" placeholder="Your name or email" /></div>
          <div class="mail-field"><label for="m-sub">Subject</label><input id="m-sub" name="subject" placeholder="Let's build something together" /></div>
          <textarea name="msg" aria-label="Message" placeholder="Hi ${esc(P.firstName)}, I loved your portfolio and…"></textarea>
          <div class="mail-foot">
            <button class="btn accent" type="submit"><i class="ti ti-send"></i> Send</button>
            <span class="mail-err"></span>
            <div class="socials">${P.socials.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener" title="${esc(s.label)}"><i class="ti ti-${esc(s.icon)}"></i></a>`).join("")}</div>
          </div>
        </form>`;
      const f = $("form", body), err = $(".mail-err", body);
      f.addEventListener("input", () => (err.textContent = ""));
      f.addEventListener("submit", (e) => {
        e.preventDefault();
        const from = f.from.value.trim(), sub = f.subject.value.trim(), msg = f.msg.value.trim();
        if (!from) { err.textContent = "Add your name or email first."; f.from.focus(); Sound.error(); return; }
        if (!msg) { err.textContent = "Write a message first."; f.msg.focus(); Sound.error(); return; }
        const url = `mailto:${P.email}?subject=${encodeURIComponent(sub || "Hello from your portfolio")}&body=${encodeURIComponent(msg + "\n\n— " + from)}`;
        window.location.href = url;
        Ach.unlock("mail");
        const done = h(`<div class="mail-sent"><i class="ti ti-send"></i><h3 style="margin:0">Ready to send</h3><p class="muted" style="margin:0">Your mail app should have opened with the message. Thanks for reaching out!</p><button class="btn" type="button">Write another</button></div>`);
        $("button", done).addEventListener("click", () => { done.remove(); f.reset(); });
        body.appendChild(done);
      });
    }
  });

  /* ================= Notepad ================= */
  registerApp("notepad", {
    title: "Notepad", icon: "notes", color: "#64748b", w: 520, h: 380, single: false,
    render({ body, args }) {
      body.classList.add("no-scroll");
      body.innerHTML = `<div class="notepad"><pre></pre></div>`;
      $("pre", body).textContent = args.content || "";
    }
  });

  /* ================= Recycle bin ================= */
  registerApp("bin", {
    title: "Recycle Bin", icon: "trash", color: "#64748b", w: 520, h: 400,
    render({ body }) {
      Ach.unlock("dumpster");
      const draw = () => {
        body.innerHTML = `<div class="app-pad">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px"><span class="tiny">${P.badCode.length} items of questionable quality</span><button class="btn empty"><i class="ti ti-trash-x"></i> Empty bin</button></div>
          <div class="bin-list">${P.badCode.map((f, i) => `<button class="bin-item" data-i="${i}" style="animation-delay:${i * 60}ms"><i class="ti ti-file-code"></i><div><div>${esc(f.name)}</div><div class="tiny">Double-click to view</div></div></button>`).join("")}</div></div>`;
        $$(".bin-item", body).forEach((b) => {
          const go = () => { const f = P.badCode[b.dataset.i]; open("notepad", { title: f.name, content: f.content }); };
          b.addEventListener("dblclick", go);
          b.addEventListener("click", () => { if (OS.tapToOpen()) go(); });
        });
        $(".empty", body).addEventListener("click", () => {
          Sound.error();
          toast("Couldn't empty the bin", "Some code can never be deleted. It lives in production forever.", { icon: "alert-triangle", color: "#f59e0b" });
          $$(".bin-item", body).forEach((b) => b.animate([{ transform: "translateX(0)" }, { transform: "translateX(-8px)" }, { transform: "translateX(8px)" }, { transform: "translateX(0)" }], { duration: 300 }));
        });
      };
      draw();
    }
  });

  /* ================= Achievements ================= */
  registerApp("achievements", {
    title: "Achievements", icon: "trophy", color: "#eab308", w: 640, h: 520,
    render(ctx) {
      const draw = () => {
        const n = Ach.unlocked.size, t = Ach.list.length;
        ctx.body.innerHTML = `<div class="app-pad">
          <div style="display:flex;justify-content:space-between;align-items:baseline"><h2 style="margin:0;font-size:20px">${n} of ${t} unlocked</h2><span class="tiny">${Math.round((n / t) * 100)}% explored</span></div>
          <div class="progress"><i style="width:0"></i></div>
          <div class="ach-grid">${Ach.list.map((a, i) => {
            const on = Ach.unlocked.has(a.id);
            return `<div class="ach ${on ? "" : "locked"}" style="animation-delay:${i * 40}ms"><div class="app-ico md" style="--ico:${a.color}"><i class="ti ti-${on ? a.icon : "lock"}"></i></div><div><b>${on ? esc(a.title) : "???"}</b><small>${esc(a.desc)}</small></div></div>`;
          }).join("")}</div></div>`;
        requestAnimationFrame(() => ($(".progress i", ctx.body).style.width = (n / t) * 100 + "%"));
      };
      draw();
      document.addEventListener("achievements", draw);
      ctx.onClose(() => document.removeEventListener("achievements", draw));
    }
  });

  /* ================= Settings ================= */
  const WALLPAPERS = OS.Wallpaper.list;
  const ACCENTS = [["#7c6cff", "#ff5fa2"], ["#3b82f6", "#22d3ee"], ["#10b981", "#a3e635"], ["#f97316", "#facc15"], ["#ef4444", "#f472b6"], ["#e879f9", "#818cf8"]];
  OS.WALLPAPERS = WALLPAPERS;

  registerApp("settings", {
    title: "Settings", icon: "settings", color: "#6366f1", w: 560, h: 560,
    render(ctx) {
      const draw = () => {
        const wp = document.body.dataset.wallpaper, theme = document.body.dataset.theme;
        const acc = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
        ctx.body.innerHTML = `<div class="app-pad reveal">
          <div class="settings-sec"><h3>Wallpaper</h3><div class="wp-grid">${WALLPAPERS.map(([id, name, bg]) => `<button class="wp-opt ${wp === id ? "on" : ""}" data-wp="${id}" style="background:${bg}"><span>${name}</span></button>`).join("")}</div></div>
          <div class="settings-sec"><h3>Accent colour</h3><div class="accent-row">${ACCENTS.map(([a, b]) => `<button class="accent-opt ${acc === a ? "on" : ""}" data-a="${a}" data-b="${b}" style="background:linear-gradient(135deg,${a},${b})" aria-label="Accent ${a}"></button>`).join("")}</div></div>
          <div class="settings-sec"><h3>System</h3>
            <div class="toggle-row"><span>Light mode</span><button class="switch ${theme === "light" ? "on" : ""}" data-t="theme" aria-label="Light mode"></button></div>
            <div class="toggle-row"><span>Sound effects</span><button class="switch ${Sound.enabled ? "on" : ""}" data-t="sound" aria-label="Sound effects"></button></div>
            <div class="toggle-row"><span>Reduce motion</span><button class="switch ${document.body.classList.contains("reduce-motion") ? "on" : ""}" data-t="motion" aria-label="Reduce motion"></button></div>
            <div class="toggle-row"><span>Skip boot animation next time</span><button class="switch ${store.get("skipBoot", false) ? "on" : ""}" data-t="boot" aria-label="Skip boot"></button></div>
          </div>
          <div class="settings-sec"><h3>About this OS</h3>
            <p class="muted" style="font-size:13px;line-height:1.6;margin:0 0 10px">PortfolioOS 1.0 · built by ${esc(P.name)} with plain HTML, CSS and JavaScript. No frameworks were harmed.</p>
            <div class="chips" style="gap:8px"><button class="btn" data-x="recruiter"><i class="ti ti-briefcase"></i> Recruiter mode</button><button class="btn" data-x="reset"><i class="ti ti-restore"></i> Reset everything</button></div>
          </div></div>`;
        $$("[data-wp]", ctx.body).forEach((b) => b.addEventListener("click", () => { OS.setWallpaper(b.dataset.wp); draw(); }));
        $$("[data-a]", ctx.body).forEach((b) => b.addEventListener("click", () => { OS.setAccent(b.dataset.a, b.dataset.b); draw(); }));
        $$("[data-t]", ctx.body).forEach((b) => b.addEventListener("click", () => {
          const t = b.dataset.t;
          if (t === "theme") OS.setTheme(document.body.dataset.theme === "light" ? "dark" : "light");
          if (t === "sound") OS.toggleSound();
          if (t === "motion") { document.body.classList.toggle("reduce-motion"); store.set("reduceMotion", document.body.classList.contains("reduce-motion")); }
          if (t === "boot") store.set("skipBoot", !store.get("skipBoot", false));
          Sound.click(); draw();
        }));
        $("[data-x=recruiter]", ctx.body).addEventListener("click", () => OS.recruiter(true));
        $("[data-x=reset]", ctx.body).addEventListener("click", () => {
          try { Object.keys(localStorage).filter((k) => k.startsWith("pos:")).forEach((k) => localStorage.removeItem(k)); } catch {}
          location.reload();
        });
      };
      draw();
    }
  });
})();

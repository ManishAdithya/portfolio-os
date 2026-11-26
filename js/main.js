/* Boot sequence, login, desktop, taskbar, start menu, easter eggs, recruiter mode. */
(function () {
  const { P, $, $$, h, esc, isMobile, paintAvatar, store, fmtTime, fmtDate, greeting, Sound, toast, confetti, Ach } = OS;
  const WM = OS.WM;

  /* ---------- Appearance ---------- */
  OS.setTheme = (t) => { document.body.dataset.theme = t; store.set("theme", t); };
  OS.setWallpaper = (w) => { document.body.dataset.wallpaper = w; store.set("wallpaper", w); OS.Wallpaper.set(w); Ach.unlock("decorator"); };
  OS.nextWallpaper = () => { const ids = OS.WALLPAPERS.map((w) => w[0]); OS.setWallpaper(ids[(ids.indexOf(document.body.dataset.wallpaper) + 1) % ids.length]); };
  OS.setAccent = (a, b) => { const r = document.documentElement.style; r.setProperty("--accent", a); r.setProperty("--accent-2", b); store.set("accent", [a, b]); };
  OS.toggleSound = () => { const on = Sound.toggle(); $("#tray-sound i").className = "ti ti-" + (on ? "volume" : "volume-off"); return on; };

  document.body.dataset.theme = store.get("theme", "dark");
  const savedWp = store.get("wallpaper", "galaxy");
  const startWp = OS.Wallpaper.list.some(([id]) => id === savedWp) ? savedWp : "galaxy"; // old gradient ids fall back
  document.body.dataset.wallpaper = startWp;
  OS.Wallpaper.set(startWp);
  const acc = store.get("accent", null); if (acc) { document.documentElement.style.setProperty("--accent", acc[0]); document.documentElement.style.setProperty("--accent-2", acc[1]); }
  if (store.get("reduceMotion", false)) document.body.classList.add("reduce-motion");
  if (!Sound.enabled) $("#tray-sound i").className = "ti ti-volume-off";
  document.title = `${P.name} · Portfolio OS`;

  /* ---------- Static bits ---------- */
  ["#login-avatar", "#sm-avatar"].forEach((s) => paintAvatar($(s)));
  $$(".logo-mark").forEach(OS.paintLogo);
  if (P.logo) $("link[rel=icon]").href = P.logo;
  $("#login-name").textContent = P.name;
  $("#login-role").textContent = P.role;
  $("#sm-name").textContent = P.name;
  Ach.render();

  const clock = () => {
    const now = new Date();
    $("#login-time").textContent = $("#dw-time").textContent = fmtTime(now);
    $("#login-date").textContent = $("#dw-date").textContent = fmtDate(now, true);
    $("#tc-time").textContent = fmtTime(now);
    $("#tc-date").textContent = fmtDate(now);
    $("#dw-greet").textContent = `${greeting()}, welcome to ${P.firstName}'s desktop`;
  };
  clock(); setInterval(clock, 1000);

  /* ---------- Screens ---------- */
  const show = (id) => ["#boot", "#login", "#desktop", "#bsod", "#shutdown"].forEach((s) => $(s).classList.toggle("hidden", s !== id));
  let bootTimers = [], bootRaf = 0;
  const later = (fn, ms) => bootTimers.push(setTimeout(fn, ms));
  const clearBoot = () => { bootTimers.forEach(clearTimeout); bootTimers = []; cancelAnimationFrame(bootRaf); $("#boot").classList.remove("run", "done", "leaving"); };

  // Loader: ring draws, dragon inks in, progress ring fills with status lines, then zooms into the login.
  const BOOT_STEPS = [[0, "Waking the dragon"], [18, "Loading projects"], [40, "Mounting skills"], [62, "Training models"], [84, "Polishing pixels"], [100, "Ready"]];
  function boot() {
    clearBoot();
    show("#boot");
    $("#taskbar").classList.add("hidden");
    if (store.get("skipBoot", false)) { later(toLogin, 200); return; }
    const root = $("#boot"), bar = $(".ld-bar"), pct = $(".ld-pct"), status = $(".ld-status");
    const LEN = 465;
    $(".ld-name").textContent = P.firstName;
    bar.style.strokeDashoffset = LEN; pct.textContent = "0%"; status.textContent = BOOT_STEPS[0][1];
    void root.offsetWidth; root.classList.add("run");

    const startAt = performance.now() + 900, dur = 1900;
    let shown = -1;
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const frame = (now) => {
      const t = Math.max(0, Math.min(1, (now - startAt) / dur));
      // a small stall around 70% makes it feel like real work is happening
      const p = Math.round(ease(t < 0.62 ? t : t < 0.72 ? 0.62 + (t - 0.62) * 0.3 : 0.65 + (t - 0.72) * (0.35 / 0.28)) * 100);
      bar.style.strokeDashoffset = LEN - (LEN * p) / 100;
      pct.textContent = p + "%";
      const step = BOOT_STEPS.filter(([at]) => p >= at).pop();
      if (step[0] !== shown) { shown = step[0]; status.textContent = step[1]; }
      if (t < 1) { bootRaf = requestAnimationFrame(frame); return; }
      root.classList.add("done");
      later(() => root.classList.add("leaving"), 550);
      later(toLogin, 1200);
    };
    bootRaf = requestAnimationFrame(frame);
  }

  function toLogin() {
    clearBoot();
    show("#login");
    $("#login").classList.remove("leaving");
    $("#taskbar").classList.add("hidden");
    OS.Wallpaper.prepare();
    setTimeout(() => $("#login-btn").focus(), 50);
  }

  let firstLogin = true;
  function login() {
    if ($("#login").classList.contains("hidden") || $("#login").classList.contains("leaving")) return;
    Sound.startup();
    $("#login").classList.add("leaving");
    setTimeout(() => {
      $("#login").classList.add("hidden");
      $("#desktop").classList.remove("hidden");
      $("#desktop").classList.add("entering");
      setTimeout(() => $("#desktop").classList.remove("entering"), 1300);
      $("#taskbar").classList.remove("hidden");
      renderIcons();
      Ach.unlock("boot", { silent: true });
      if (firstLogin && !WM.wins.size) {
        firstLogin = false;
        setTimeout(() => WM.open("readme"), 700);
        setTimeout(() => toast("Welcome!", isMobile() ? "Tap the icons to explore. There are 14 achievements to find." : "Double-click icons to explore. There are 14 achievements hidden around.", { icon: "sparkles", ms: 5000 }), 1400);
      }
    }, 600);
  }

  $("#boot-skip").addEventListener("click", toLogin);
  $("#login-btn").addEventListener("click", login);
  $("#login").addEventListener("click", (e) => { if (!e.target.closest("button")) login(); });
  $("#recruiter-from-login").addEventListener("click", () => recruiter(true));
  $("#power-on").addEventListener("click", boot);

  /* ---------- Desktop icons ---------- */
  // Kept short on purpose. Everything else lives in the Start menu, the Fun stuff folder and the tray.
  const ICONS = [
    ["readme", "About me"], ["projects", "Projects"], ["skills", "Skills"], ["terminal", "Terminal"],
    ["mail", "Contact"], ["fun", "Fun stuff"], ["bin", "Recycle Bin"]
  ];
  function renderIcons() {
    const wrap = $("#icons"); wrap.innerHTML = "";
    ICONS.forEach(([id, label], i) => {
      const app = WM.apps[id] || { icon: "briefcase", color: "#0ea5e9" };
      const b = h(`<button class="d-icon" role="listitem" data-app="${id}" style="animation-delay:${200 + i * 45}ms"><span class="app-ico" style="--ico:${app.color}"><i class="ti ti-${app.icon}"></i></span><span class="d-lbl">${esc(label)}</span></button>`);
      const go = () => { b.classList.remove("wiggle"); id === "recruiter" ? recruiter(true) : WM.open(id); };
      b.addEventListener("click", (e) => { e.stopPropagation(); select([b]); if (isMobile()) go(); else Sound.click(); });
      b.addEventListener("dblclick", () => { if (!isMobile()) go(); });
      b.addEventListener("keydown", (e) => { if (e.key === "Enter") go(); });
      b.addEventListener("contextmenu", (e) => { e.preventDefault(); e.stopPropagation(); select([b]); WM.contextMenu(e.clientX, e.clientY, [{ icon: "external-link", label: "Open", action: go }]); });
      wrap.appendChild(b);
    });
  }
  const select = (list) => $$(".d-icon").forEach((i) => i.classList.toggle("selected", list.includes(i)));

  // drag-select rectangle
  $("#desktop").addEventListener("pointerdown", (e) => {
    WM.closeMenus();
    if (e.button !== 0 || e.target.closest(".win, .d-icon") || isMobile()) return;
    select([]);
    const box = $("#selection-box"), sx = e.clientX, sy = e.clientY;
    const move = (ev) => {
      const x = Math.min(sx, ev.clientX), y = Math.min(sy, ev.clientY), w = Math.abs(ev.clientX - sx), hh = Math.abs(ev.clientY - sy);
      if (w + hh < 6) return;
      box.classList.remove("hidden");
      Object.assign(box.style, { left: x + "px", top: y + "px", width: w + "px", height: hh + "px" });
      select($$(".d-icon").filter((i) => { const r = i.getBoundingClientRect(); return r.right > x && r.left < x + w && r.bottom > y && r.top < y + hh; }));
    };
    const up = () => { box.classList.add("hidden"); removeEventListener("pointermove", move); removeEventListener("pointerup", up); };
    addEventListener("pointermove", move); addEventListener("pointerup", up);
  });

  $("#desktop").addEventListener("contextmenu", (e) => {
    if (e.target.closest(".win")) return;
    e.preventDefault();
    WM.contextMenu(e.clientX, e.clientY, [
      { icon: "terminal-2", label: "Open Terminal here", action: () => WM.open("terminal") },
      { icon: "photo", label: "Next wallpaper", action: OS.nextWallpaper },
      { icon: "refresh", label: "Refresh", action: () => $$(".d-icon").forEach((i, n) => setTimeout(() => { i.classList.remove("wiggle"); void i.offsetWidth; i.classList.add("wiggle"); }, n * 30)) },
      "-",
      { icon: "folder", label: "Projects", action: () => WM.open("projects") },
      { icon: "settings", label: "Personalize", action: () => WM.open("settings") },
      { icon: "briefcase", label: "Recruiter mode", action: () => recruiter(true) }
    ]);
  });

  /* ---------- Start menu ---------- */
  const START_APPS = ["readme", "projects", "skills", "terminal", "mail", "music", "paint", "snake", "achievements", "settings", "bin"];
  function renderStart(q = "") {
    q = q.trim().toLowerCase();
    const apps = START_APPS.map((id) => WM.apps[id]).filter((a) => !q || a.title.toLowerCase().includes(q) || a.id.includes(q));
    const projs = P.projects.filter((p) => !q || (p.title + p.tagline + p.tech.join(" ")).toLowerCase().includes(q));
    $("#sm-apps").innerHTML = apps.map((a) => `<button class="sm-app" data-app="${a.id}"><span class="app-ico md" style="--ico:${a.color}"><i class="ti ti-${a.icon}"></i></span>${esc(a.title.replace(" — Skills", ""))}</button>`).join("") || `<div class="sm-empty">No apps match "${esc(q)}"</div>`;
    $("#sm-projects").innerHTML = projs.map((p) => `<button class="sm-proj" data-proj="${esc(p.id)}"><span class="app-ico md" style="--ico:${esc(p.color)}"><i class="ti ti-${esc(p.icon)}"></i></span><span><b>${esc(p.title)}</b><small>${esc(p.tagline)}</small></span></button>`).join("") || `<div class="sm-empty">No projects match</div>`;
    $$("#sm-apps [data-app]").forEach((b) => b.addEventListener("click", () => WM.open(b.dataset.app)));
    $$("#sm-projects [data-proj]").forEach((b) => b.addEventListener("click", () => WM.open("projects", { project: b.dataset.proj })));
  }
  function toggleStart(force) {
    const m = $("#start-menu"), open = force ?? m.classList.contains("hidden");
    $("#context-menu").classList.add("hidden");
    m.classList.toggle("hidden", !open);
    $("#start-btn").classList.toggle("open", open);
    if (open) { Sound.click(); $("#sm-search").value = ""; renderStart(); if (!isMobile()) setTimeout(() => $("#sm-search").focus(), 30); }
  }
  $("#start-btn").addEventListener("click", (e) => { e.stopPropagation(); toggleStart(); });
  $("#start-menu").addEventListener("pointerdown", (e) => e.stopPropagation());
  $("#sm-search").addEventListener("input", (e) => renderStart(e.target.value));
  $("#sm-search").addEventListener("keydown", (e) => { if (e.key === "Enter") $("#start-menu .sm-app, #start-menu .sm-proj")?.click(); });
  $$("[data-power]").forEach((b) => b.addEventListener("click", () => {
    WM.closeMenus();
    const p = b.dataset.power;
    if (p === "lock") { toLogin(); $("#desktop").classList.add("hidden"); }
    if (p === "restart") { WM.closeAll(); firstLogin = true; boot(); }
    if (p === "shutdown") { WM.closeAll(); firstLogin = true; Sound.close(); show("#shutdown"); $("#taskbar").classList.add("hidden"); }
  }));
  document.addEventListener("pointerdown", (e) => { if (!e.target.closest("#start-menu, #start-btn, #context-menu")) WM.closeMenus(); });

  /* ---------- Tray ---------- */
  $("#tray-trophy").addEventListener("click", () => WM.open("achievements"));
  $("#tray-sound").addEventListener("click", () => { const on = OS.toggleSound(); toast(on ? "Sound on" : "Sound off", "", { icon: on ? "volume" : "volume-off", ms: 1600 }); });
  $("#tray-recruiter").addEventListener("click", () => recruiter(true));
  $("#tray-clock").addEventListener("click", () => toast(fmtDate(new Date(), true), `${fmtTime(new Date(), true)} in ${P.location}`, { icon: "calendar", ms: 2500 }));

  /* ---------- Blue screen ---------- */
  OS.bsod = () => {
    Ach.unlock("crash");
    WM.closeAll();
    show("#bsod"); $("#taskbar").classList.add("hidden");
    let pct = 0; $("#bsod-pct").textContent = 0;
    const iv = setInterval(() => {
      pct = Math.min(100, pct + Math.ceil(Math.random() * 12)); $("#bsod-pct").textContent = pct;
      if (pct >= 100) { clearInterval(iv); setTimeout(() => { firstLogin = true; boot(); }, 700); }
    }, 300);
  };

  /* ---------- Recruiter mode ---------- */
  function recruiter(on) {
    WM.closeMenus();
    const r = $("#recruiter");
    if (!on) { r.classList.add("hidden"); history.replaceState(null, "", location.pathname); return; }
    r.innerHTML = `<div class="rc">
      <div class="rc-top"><span class="chip"><i class="ti ti-briefcase"></i> Recruiter mode · the quick version</span>
        <div class="chips" style="gap:8px"><button class="btn" id="rc-print"><i class="ti ti-printer"></i> Print</button><button class="btn accent" id="rc-back"><i class="ti ti-device-desktop"></i> Back to the fun version</button></div></div>
      <div class="rc-head"><div class="avatar avatar-lg"></div><div><h1>${esc(P.name)}</h1><p>${esc(P.role)} · ${esc(P.location)}</p>${P.status ? `<span class="status-pill">${esc(P.status)}</span>` : ""}
        <div class="rc-links"><a class="btn" href="mailto:${esc(P.email)}"><i class="ti ti-mail"></i> ${esc(P.email)}</a>${P.socials.map((s) => `<a class="btn" href="${esc(s.url)}" target="_blank" rel="noopener"><i class="ti ti-${esc(s.icon)}"></i> ${esc(s.label)}</a>`).join("")}${P.resumeUrl ? `<a class="btn" href="${esc(P.resumeUrl)}" target="_blank" rel="noopener"><i class="ti ti-download"></i> Resume</a>` : ""}</div></div></div>
      <p style="font-size:18px;line-height:1.6">${esc(P.tagline)}</p>
      ${P.about.map((p) => `<p class="muted" style="line-height:1.7">${esc(p)}</p>`).join("")}
      <h2>Projects</h2>
      <div class="rc-proj">${P.projects.map((p) => `<div class="rc-card"><span class="app-ico md" style="--ico:${esc(p.color)}"><i class="ti ti-${esc(p.icon)}"></i></span><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><div class="chips">${p.tech.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>
        <div class="chips" style="margin-top:10px;gap:10px">${p.links?.live ? `<a href="${esc(p.links.live)}" target="_blank" rel="noopener">Live demo</a>` : ""}${p.links?.code ? `<a href="${esc(p.links.code)}" target="_blank" rel="noopener">Source</a>` : ""}</div></div>`).join("")}</div>
      ${P.experience.length ? `<h2>Experience</h2>
      <div class="timeline">${P.experience.map((x) => `<div class="tl-item"><b>${esc(x.role)}</b> <span class="muted">@ ${esc(x.company)}</span><div class="tiny">${esc(x.period)}</div><ul>${x.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div>`).join("")}</div>` : ""}
      <h2>Education</h2>
      <div class="timeline">${P.education.map((x) => `<div class="tl-item"><b>${esc(x.degree)}</b><div class="muted" style="font-size:13px">${esc(x.school)}${x.period ? " · " + esc(x.period) : ""}</div></div>`).join("")}</div>
      <h2>Skills</h2>
      ${[...new Set(P.skills.map((s) => s.group))].map((g) => `<div class="tiny" style="margin:12px 0 6px">${esc(g)}</div><div class="rc-skills">${P.skills.filter((s) => s.group === g).map((s) => `<span class="chip">${esc(s.name)}</span>`).join("")}</div>`).join("")}
    </div>`;
    paintAvatar($(".avatar", r));
    $("#rc-back").addEventListener("click", () => recruiter(false));
    $("#rc-print").addEventListener("click", () => print());
    r.classList.remove("hidden"); r.scrollTop = 0;
    history.replaceState(null, "", "?recruiter");
  }
  OS.recruiter = recruiter;

  /* ---------- Keyboard ---------- */
  const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
  let kIdx = 0;
  document.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    kIdx = k === KONAMI[kIdx] ? kIdx + 1 : k === KONAMI[0] ? 1 : 0;
    if (kIdx === KONAMI.length) { kIdx = 0; Ach.unlock("konami"); confetti(); toast("+30 lives", "The Konami code still works in 2026.", { icon: "device-gamepad-2", color: "#eab308" }); }

    if (!$("#boot").classList.contains("hidden") && (k === "escape" || k === " " || k === "enter")) { e.preventDefault(); toLogin(); return; }
    if (!$("#login").classList.contains("hidden") && (k === "enter" || k === " ") && !e.target.closest("#recruiter-from-login")) { e.preventDefault(); login(); return; }
    if (k === "escape") {
      if (!$("#recruiter").classList.contains("hidden")) return recruiter(false);
      WM.closeMenus();
    }
    if (e.ctrlKey && k === " " &&!$("#desktop").classList.contains("hidden")) { e.preventDefault(); toggleStart(); }
    if (e.target.matches("input, textarea")) return;
    if (k === "enter") { const sel = $(".d-icon.selected"); if (sel && document.activeElement === document.body) sel.dispatchEvent(new MouseEvent("dblclick")); }
  });

  /* ---------- Go ---------- */
  if (new URLSearchParams(location.search).has("recruiter")) { recruiter(true); toLogin(); }
  else boot();
})();

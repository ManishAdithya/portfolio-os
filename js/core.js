/* Core helpers shared by every part of the OS. */
(function () {
  const P = window.PORTFOLIO;

  /* ---------- DOM helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  function h(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // Phone layout: narrow screens, plus touch devices up to tablet width (some phones report a wide viewport).
  // Keep in sync with the mobile @media query in style.css.
  const MOBILE_Q = "(max-width: 760px), (hover: none) and (pointer: coarse) and (max-width: 1024px)";
  const isMobile = () => window.matchMedia(MOBILE_Q).matches;
  // On any touchscreen one tap opens things: double-tap is the browser's zoom gesture there.
  const isTouch = () => window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const tapToOpen = () => isMobile() || isTouch();

  // Long-press = right-click on touchscreens. cb(target, x, y). The click that follows the press is swallowed.
  function onLongPress(el, cb, ms = 520) {
    let timer = null, sx = 0, sy = 0, fired = false;
    const cancel = () => { clearTimeout(timer); timer = null; };
    el.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse") return;
      fired = false; sx = e.clientX; sy = e.clientY; cancel();
      const target = e.target;
      timer = setTimeout(() => {
        timer = null; fired = true;
        try { navigator.vibrate && navigator.vibrate(12); } catch {}
        cb(target, sx, sy);
      }, ms);
    });
    el.addEventListener("pointermove", (e) => { if (timer && Math.hypot(e.clientX - sx, e.clientY - sy) > 10) cancel(); });
    ["pointerup", "pointercancel"].forEach((t) => el.addEventListener(t, cancel));
    el.addEventListener("click", (e) => { if (fired) { fired = false; e.stopPropagation(); e.preventDefault(); } }, true);
    // Android also fires a native contextmenu on long-press; our timer already handled it.
    el.addEventListener("contextmenu", (e) => { if (fired || timer) { e.preventDefault(); e.stopPropagation(); } }, true);
  }
  const initials = (name) => name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  function paintImg(el, src, fallback) {
    // absolute URL: a relative url() inside a CSS variable resolves against the stylesheet folder
    if (src) { el.style.setProperty("--logo", `url("${new URL(src, location.href).href}")`); el.classList.add("has-img"); el.textContent = ""; }
    else el.textContent = fallback;
  }
  const paintAvatar = (el) => paintImg(el, P.avatar, initials(P.name));
  const paintLogo = (el) => paintImg(el, P.logo, P.firstName[0].toUpperCase());

  /* ---------- Storage (never throws) ---------- */
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem("pos:" + key); return v === null ? fallback : JSON.parse(v); }
      catch { return fallback; }
    },
    set(key, value) { try { localStorage.setItem("pos:" + key, JSON.stringify(value)); } catch {} }
  };

  /* ---------- Time ---------- */
  const tz = P.timezone || undefined;
  function fmtTime(d = new Date(), seconds = false) {
    try { return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: seconds ? "2-digit" : undefined, timeZone: tz }); }
    catch { return d.toLocaleTimeString(); }
  }
  function fmtDate(d = new Date(), long = false) {
    const o = long ? { weekday: "long", month: "long", day: "numeric" } : { day: "numeric", month: "short", year: "numeric" };
    try { return d.toLocaleDateString([], { ...o, timeZone: tz }); } catch { return d.toDateString(); }
  }
  function greeting() {
    let hr;
    try { hr = +new Date().toLocaleString("en-GB", { hour: "2-digit", hour12: false, timeZone: tz }); } catch { hr = new Date().getHours(); }
    return hr < 5 ? "Burning the midnight oil" : hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : hr < 21 ? "Good evening" : "Good night";
  }

  /* ---------- Sound: subtle, modern UI sounds synthesized with WebAudio (no files) ---------- */
  const Sound = {
    enabled: store.get("sound", true),
    ctx: null, bus: null, noiseBuf: null,
    ensure() {
      if (!this.ctx) {
        try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; }
        const ctx = this.ctx;
        // bus: gentle lowpass -> compressor -> out, with a short, quiet echo for a sense of space
        const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 6000;
        const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -24; comp.ratio.value = 4;
        const master = ctx.createGain(); master.gain.value = 0.9;
        const delay = ctx.createDelay(); delay.delayTime.value = 0.16;
        const fb = ctx.createGain(); fb.gain.value = 0.28;
        const wet = ctx.createGain(); wet.gain.value = 0.18;
        const dlp = ctx.createBiquadFilter(); dlp.type = "lowpass"; dlp.frequency.value = 2500;
        lp.connect(comp).connect(master).connect(ctx.destination);
        lp.connect(delay); delay.connect(dlp).connect(fb).connect(delay); dlp.connect(wet).connect(comp);
        this.bus = lp;
        const len = ctx.sampleRate * 0.5, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        this.noiseBuf = buf;
      }
      if (this.ctx.state === "suspended") this.ctx.resume();
      return this.ctx;
    },
    ready() { return this.enabled && this.ensure(); },
    // soft tone with optional pitch glide
    tone(freq, dur = 0.12, type = "sine", vol = 0.03, delay = 0, glideTo = null, attack = 0.006) {
      const ctx = this.ready(); if (!ctx) return;
      const t = ctx.currentTime + delay, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t);
      if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t + dur * 0.6);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(this.bus); o.start(t); o.stop(t + dur + 0.05);
    },
    // filtered noise: crisp ticks and airy whooshes
    noise(dur, from, to, vol, q = 1.2, delay = 0) {
      const ctx = this.ready(); if (!ctx) return;
      const t = ctx.currentTime + delay, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = this.noiseBuf; f.type = "bandpass"; f.Q.value = q;
      f.frequency.setValueAtTime(from, t); f.frequency.exponentialRampToValueAtTime(to, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.02, dur / 3)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f).connect(g).connect(this.bus); s.start(t); s.stop(t + dur + 0.05);
    },
    // Interaction sounds are intentionally silent (clicks, windows, errors).
    click() {},
    open() {},
    close() {},
    error() {},
    achievement() {
      [[659.25, 0], [987.77, 0.07], [1318.5, 0.14]].forEach(([f, d], i) => {
        this.tone(f, 1.1, "sine", 0.03 - i * 0.006, d, null, 0.004);
        this.tone(f * 2, 0.5, "sine", 0.005, d, null, 0.004);
      });
    },
    startup() {
      const ctx = this.ready(); if (!ctx) return;
      const t = ctx.currentTime, f = ctx.createBiquadFilter(), g = ctx.createGain();
      f.type = "lowpass"; f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(2400, t + 1.6);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 0.9); g.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
      f.connect(g).connect(this.bus);
      [110, 164.81, 220, 277.18, 329.63, 440].forEach((fr, i) => [-5, 5].forEach((det) => {
        const o = ctx.createOscillator(); o.type = i < 2 ? "sine" : "triangle"; o.frequency.value = fr; o.detune.value = det;
        o.connect(f); o.start(t); o.stop(t + 3.3);
      }));
      this.noise(1.4, 300, 4000, 0.012, 0.6, 0.1);
    },
    toggle() { this.enabled = !this.enabled; store.set("sound", this.enabled); return this.enabled; }
  };

  /* ---------- Toasts ---------- */
  // One toast at a time: the rest wait in a queue so the screen never piles up.
  const toastQueue = [];
  let toastShowing = false;
  function toast(title, text = "", opts = {}) {
    toastQueue.push([title, text, opts]);
    if (!toastShowing) nextToast();
  }
  function nextToast() {
    const item = toastQueue.shift();
    if (!item) { toastShowing = false; return; }
    toastShowing = true;
    const [title, text, { icon = "bell", color = "var(--accent)", cls = "", ms = 3800, onShow } = {}] = item;
    const el = h(`<div class="toast ${cls}"><div class="app-ico md" style="--ico:${color}"><i class="ti ti-${icon}"></i></div><div><b>${esc(title)}</b>${text ? `<small>${esc(text)}</small>` : ""}</div></div>`);
    $("#toasts").appendChild(el);
    if (onShow) onShow();
    let done = false;
    const kill = () => { if (done) return; done = true; el.classList.add("out"); setTimeout(() => { el.remove(); nextToast(); }, 350); };
    el.addEventListener("click", kill);
    setTimeout(kill, toastQueue.length ? Math.min(ms, 2600) : ms);
  }

  /* ---------- Confetti ---------- */
  function confetti(x = innerWidth / 2, y = innerHeight / 2, n = 80) {
    const colors = ["#8ec5ff", "#b9a8ff", "#f4f6fb", "#ffc46b", "#7ee0d2"];
    for (let i = 0; i < n; i++) {
      const c = document.createElement("div");
      c.className = "confetti";
      c.style.background = colors[i % colors.length];
      c.style.left = x + "px"; c.style.top = y + "px";
      document.body.appendChild(c);
      const a = Math.random() * Math.PI * 2, v = 200 + Math.random() * 400;
      const dx = Math.cos(a) * v, dy = Math.sin(a) * v - 300;
      c.animate([
        { transform: "translate(0,0) rotate(0)", opacity: 1 },
        { transform: `translate(${dx}px, ${dy + 700}px) rotate(${Math.random() * 1080}deg)`, opacity: 0 }
      ], { duration: 1400 + Math.random() * 900, easing: "cubic-bezier(.2,.6,.4,1)" }).onfinish = () => c.remove();
    }
  }

  /* ---------- Achievements ---------- */
  const ACHIEVEMENTS = [
    { id: "boot",      title: "Hello, world",      desc: "Booted up the portfolio",            icon: "power",         color: "#7c6cff" },
    { id: "readme",    title: "Reader",            desc: "Opened the README",                  icon: "file-text",     color: "#60a5fa" },
    { id: "projects",  title: "Curious mind",      desc: "Opened a project",                   icon: "folder-open",   color: "#fbbf24" },
    { id: "explorer",  title: "Explorer",          desc: "Opened 6 different apps",            icon: "compass",       color: "#22c7a9" },
    { id: "hacker",    title: "Hacker voice",      desc: "Ran 5 terminal commands",            icon: "terminal-2",    color: "#4ade80" },
    { id: "hire",      title: "Great decision",    desc: "Ran sudo hire-me",                   icon: "briefcase",     color: "#ff5fa2" },
    { id: "artist",    title: "Picasso",           desc: "Painted something in Paint",         icon: "brush",         color: "#f97316" },
    { id: "gamer",     title: "Snake charmer",     desc: "Scored 10 in Snake",                 icon: "device-gamepad-2", color: "#a3e635" },
    { id: "dj",        title: "DJ",                desc: "Played a track in Music",            icon: "music",         color: "#e879f9" },
    { id: "decorator", title: "Interior designer", desc: "Changed the wallpaper",              icon: "palette",       color: "#38bdf8" },
    { id: "dumpster",  title: "Dumpster diver",    desc: "Looked inside the Recycle Bin",      icon: "trash",         color: "#94a3b8" },
    { id: "crash",     title: "Chaos agent",       desc: "Crashed the OS on purpose",          icon: "bug",           color: "#3b82f6" },
    { id: "mail",      title: "Say hi",            desc: "Wrote an email",                     icon: "mail",          color: "#f43f5e" },
    { id: "konami",    title: "Old school",        desc: "Entered the Konami code",            icon: "keyboard",      color: "#eab308" }
  ];
  const Ach = {
    list: ACHIEVEMENTS,
    unlocked: new Set(store.get("ach", [])),
    unlock(id, { silent = false } = {}) {
      if (this.unlocked.has(id)) return;
      const a = ACHIEVEMENTS.find((x) => x.id === id); if (!a) return;
      this.unlocked.add(id); store.set("ach", [...this.unlocked]);
      this.render();
      const bump = () => { const t = $("#tray-trophy"); t.classList.remove("bump"); void t.offsetWidth; t.classList.add("bump"); };
      if (silent) bump();
      else toast("Achievement unlocked: " + a.title, a.desc, { icon: a.icon, color: a.color, cls: "achievement", ms: 3200, onShow: () => { Sound.achievement(); bump(); } });
      document.dispatchEvent(new CustomEvent("achievements"));
      if (this.unlocked.size === ACHIEVEMENTS.length) setTimeout(() => { confetti(); toast("100% complete", "You found everything. You should probably hire this person.", { icon: "crown", color: "#fbbf24" }); }, 800);
    },
    render() { const c = $("#ach-count"); if (c) c.textContent = `${this.unlocked.size}/${ACHIEVEMENTS.length}`; }
  };

  window.OS = Object.assign(window.OS || {}, { P, $, $$, h, esc, isMobile, isTouch, tapToOpen, onLongPress, initials, paintAvatar, paintLogo, store, fmtTime, fmtDate, greeting, Sound, toast, confetti, Ach });
})();

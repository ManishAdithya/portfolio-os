/* Window manager: open, focus, drag, resize, snap, minimize, maximize, close. */
(function () {
  const { $, $$, h, esc, isMobile, Sound, Ach, store } = OS;

  const apps = {};
  const wins = new Map();
  let zTop = 10, seq = 0, cascade = 0;
  const opened = new Set(store.get("opened", []));

  function registerApp(id, def) { apps[id] = { single: true, w: 640, h: 460, ...def, id }; }

  const area = () => ({ w: window.innerWidth, h: window.innerHeight - ($("#taskbar").offsetHeight || 56) });

  function open(appId, args = {}) {
    const def = apps[appId];
    if (!def) return null;
    Sound.open();
    closeMenus();

    if (def.single) {
      const existing = [...wins.values()].find((w) => w.appId === appId);
      if (existing) {
        if (existing.min) restore(existing.id); else focus(existing.id);
        if (def.onArgs) def.onArgs(existing.ctx, args);
        return existing;
      }
    }

    const id = "w" + ++seq;
    const A = area();
    const mobile = isMobile();
    const w = Math.min(def.w, A.w - 40), hgt = Math.min(def.h, A.h - 40);
    const off = (cascade++ % 6) * 28;
    const x = Math.max(10, Math.round((A.w - w) / 2 - 80 + off + (Math.random() * 40 - 20)));
    const y = Math.max(10, Math.round((A.h - hgt) / 2 - 40 + off));

    const el = h(`
      <div class="win opening" role="dialog" aria-label="${esc(def.title)}" style="left:${x}px;top:${y}px;width:${w}px;height:${hgt}px">
        <div class="win-titlebar">
          <div class="win-title"><span class="app-ico sm" style="--ico:${def.color}"><i class="ti ti-${def.icon}"></i></span><span class="t">${esc(args.title || def.title)}</span></div>
          <div class="win-controls">
            <button class="min" aria-label="Minimize"><i class="ti ti-minus"></i></button>
            <button class="max" aria-label="Maximize"><i class="ti ti-square"></i></button>
            <button class="close" aria-label="Close"><i class="ti ti-x"></i></button>
          </div>
        </div>
        <div class="win-body"></div>
        <div class="resize n" data-dir="n"></div><div class="resize e" data-dir="e"></div><div class="resize s" data-dir="s"></div>
        <div class="resize w" data-dir="w"></div><div class="resize se" data-dir="se"></div><div class="resize sw" data-dir="sw"></div>
      </div>`);
    el.addEventListener("animationend", (e) => { if (e.animationName === "winOpen" || e.animationName === "mobileOpen") el.classList.remove("opening"); });
    $("#windows").appendChild(el);

    const state = { id, appId, el, max: false, min: false, prev: null, cleanup: [] };
    const body = $(".win-body", el);
    state.ctx = {
      body, win: el, args, id,
      setTitle: (t) => { $(".t", el).textContent = t; const tb = $(`.tb-app[data-win="${id}"] .lbl`); if (tb) tb.textContent = t; },
      close: () => close(id),
      onClose: (fn) => state.cleanup.push(fn),
      isFocused: () => el.style.zIndex == zTop
    };
    wins.set(id, state);

    // taskbar button
    const tb = h(`<button class="tb-btn tb-app" data-win="${id}" title="${esc(def.title)}"><span class="app-ico sm" style="--ico:${def.color}"><i class="ti ti-${def.icon}"></i></span><span class="lbl">${esc(args.title || def.title)}</span></button>`);
    tb.addEventListener("click", () => {
      Sound.click();
      if (state.min) restore(id);
      else if (el.style.zIndex == zTop && !el.classList.contains("inactive")) minimize(id);
      else focus(id);
    });
    $("#tb-apps").appendChild(tb);

    // controls
    $(".min", el).addEventListener("click", (e) => { e.stopPropagation(); minimize(id); });
    $(".max", el).addEventListener("click", (e) => { e.stopPropagation(); toggleMax(id); });
    $(".close", el).addEventListener("click", (e) => { e.stopPropagation(); close(id); });
    el.addEventListener("pointerdown", () => focus(id), true);
    const bar = $(".win-titlebar", el);
    bar.addEventListener("dblclick", (e) => { if (!e.target.closest(".win-controls")) toggleMax(id); });
    bar.addEventListener("pointerdown", (e) => startDrag(e, state));
    $$(".resize", el).forEach((r) => r.addEventListener("pointerdown", (e) => startResize(e, state, r.dataset.dir)));

    if (def.startMax && !mobile) toggleMax(id, true);
    focus(id);
    try { def.render(state.ctx); } catch (err) { console.error(err); body.innerHTML = `<div class="dialog"><p>This app crashed. Ironic.</p></div>`; }

    opened.add(appId); store.set("opened", [...opened]);
    if (opened.size >= 6) Ach.unlock("explorer");
    document.dispatchEvent(new CustomEvent("wm:change"));
    return state;
  }

  function focus(id) {
    const s = wins.get(id); if (!s) return;
    if (s.el.style.zIndex != zTop) s.el.style.zIndex = ++zTop;
    wins.forEach((w) => w.el.classList.toggle("inactive", w.id !== id));
    $$(".tb-app").forEach((b) => b.classList.toggle("active", b.dataset.win === id && !s.min));
  }

  function focusTopmost() {
    let best = null;
    wins.forEach((w) => { if (!w.min && (!best || +w.el.style.zIndex > +best.el.style.zIndex)) best = w; });
    if (best) focus(best.id); else $$(".tb-app").forEach((b) => b.classList.remove("active"));
  }

  function animate(el, fn, ms = 340) {
    el.classList.add("animating");
    requestAnimationFrame(() => { fn(); setTimeout(() => el.classList.remove("animating"), ms); });
  }

  function minimize(id) {
    const s = wins.get(id); if (!s || s.min) return;
    Sound.close();
    const tb = $(`.tb-app[data-win="${id}"]`);
    const r = s.el.getBoundingClientRect(), t = tb ? tb.getBoundingClientRect() : { left: r.left, top: innerHeight, width: 0, height: 0 };
    const dx = t.left + t.width / 2 - (r.left + r.width / 2), dy = t.top + t.height / 2 - (r.top + r.height / 2);
    animate(s.el, () => { s.el.style.transform = `translate(${dx}px, ${dy}px) scale(.15)`; s.el.style.opacity = "0"; });
    setTimeout(() => { s.el.classList.add("minimized"); }, 320);
    s.min = true;
    focusTopmost();
  }

  function restore(id) {
    const s = wins.get(id); if (!s) return;
    s.min = false;
    s.el.classList.remove("minimized");
    animate(s.el, () => { s.el.style.transform = ""; s.el.style.opacity = ""; });
    focus(id);
  }

  function setRect(el, r) { Object.assign(el.style, { left: r.x + "px", top: r.y + "px", width: r.w + "px", height: r.h + "px" }); }
  function getRect(el) { return { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight }; }

  function toggleMax(id, force) {
    const s = wins.get(id); if (!s || isMobile()) return;
    const A = area();
    const toMax = force ?? !s.max;
    if (toMax) {
      if (!s.snapped) s.prev = getRect(s.el);
      animate(s.el, () => setRect(s.el, { x: 0, y: 0, w: A.w, h: A.h }));
      s.el.classList.add("maximized"); s.max = true;
    } else {
      const p = s.prev || { x: 80, y: 60, w: 640, h: 440 };
      animate(s.el, () => setRect(s.el, p));
      s.el.classList.remove("maximized"); s.max = false;
    }
    s.snapped = false;
    $(".max i", s.el).className = s.max ? "ti ti-copy" : "ti ti-square";
  }

  function close(id) {
    const s = wins.get(id); if (!s) return;
    Sound.close();
    s.cleanup.forEach((fn) => { try { fn(); } catch {} });
    s.el.classList.add("closing");
    const tb = $(`.tb-app[data-win="${id}"]`);
    if (tb) { tb.style.transition = "opacity .2s, transform .2s"; tb.style.opacity = "0"; tb.style.transform = "scale(.6)"; setTimeout(() => tb.remove(), 200); }
    setTimeout(() => s.el.remove(), 230);
    wins.delete(id);
    focusTopmost();
    document.dispatchEvent(new CustomEvent("wm:change"));
  }

  /* ---------- Drag + snap ---------- */
  function startDrag(e, s) {
    if (e.button !== 0 || e.target.closest(".win-controls") || isMobile()) return;
    e.preventDefault();
    const el = s.el, A = area(), preview = $("#snap-preview");
    let start = { mx: e.clientX, my: e.clientY, ...getRect(el) };
    let moved = false, snap = null;

    const move = (ev) => {
      if (!moved && Math.hypot(ev.clientX - start.mx, ev.clientY - start.my) < 4) return;
      if (!moved) {
        moved = true;
        if (s.max || s.snapped) {
          // pull out of maximized/snapped state, keep cursor at same relative spot
          const p = s.prev || { w: 640, h: 440 };
          const ratio = (start.mx - start.x) / start.w;
          s.max = false; s.snapped = false; el.classList.remove("maximized");
          $(".max i", el).className = "ti ti-square";
          start = { mx: start.mx, my: start.my, x: start.mx - p.w * ratio, y: 0, w: p.w, h: p.h };
          setRect(el, start);
        }
      }
      let x = start.x + ev.clientX - start.mx, y = start.y + ev.clientY - start.my;
      y = Math.max(0, Math.min(A.h - 40, y));
      x = Math.max(-start.w + 80, Math.min(A.w - 80, x));
      el.style.left = x + "px"; el.style.top = y + "px";

      const edge = 10;
      snap = ev.clientY <= edge ? "max" : ev.clientX <= edge ? "left" : ev.clientX >= A.w - edge ? "right" : null;
      if (snap) {
        const r = snap === "max" ? { x: 8, y: 8, w: A.w - 16, h: A.h - 16 } : snap === "left" ? { x: 8, y: 8, w: A.w / 2 - 12, h: A.h - 16 } : { x: A.w / 2 + 4, y: 8, w: A.w / 2 - 12, h: A.h - 16 };
        preview.classList.remove("hidden");
        Object.assign(preview.style, { left: r.x + "px", top: r.y + "px", width: r.w + "px", height: r.h + "px" });
      } else preview.classList.add("hidden");
    };
    const up = () => {
      removeEventListener("pointermove", move); removeEventListener("pointerup", up);
      preview.classList.add("hidden");
      if (!moved || !snap) return;
      if (snap === "max") { s.prev = { ...start, x: el.offsetLeft, y: el.offsetTop }; toggleMax(s.id, true); s.prev = { x: start.x, y: Math.max(20, start.y), w: start.w, h: start.h }; return; }
      s.prev = { x: start.x, y: Math.max(20, start.y), w: start.w, h: start.h };
      const r = snap === "left" ? { x: 0, y: 0, w: Math.round(A.w / 2), h: A.h } : { x: Math.round(A.w / 2), y: 0, w: Math.round(A.w / 2), h: A.h };
      animate(el, () => setRect(el, r));
      s.snapped = true;
    };
    addEventListener("pointermove", move); addEventListener("pointerup", up);
  }

  /* ---------- Resize ---------- */
  function startResize(e, s, dir) {
    if (e.button !== 0 || s.max) return;
    e.preventDefault(); e.stopPropagation();
    const el = s.el, st = { mx: e.clientX, my: e.clientY, ...getRect(el) };
    const minW = 300, minH = 200;
    const move = (ev) => {
      const dx = ev.clientX - st.mx, dy = ev.clientY - st.my;
      const r = { ...st };
      if (dir.includes("e")) r.w = Math.max(minW, st.w + dx);
      if (dir.includes("s")) r.h = Math.max(minH, st.h + dy);
      if (dir.includes("w")) { r.w = Math.max(minW, st.w - dx); r.x = st.x + st.w - r.w; }
      if (dir.includes("n")) { r.h = Math.max(minH, st.h - dy); r.y = Math.max(0, st.y + st.h - r.h); }
      setRect(el, r);
      el.dispatchEvent(new CustomEvent("win:resize"));
    };
    const up = () => { removeEventListener("pointermove", move); removeEventListener("pointerup", up); s.snapped = false; };
    addEventListener("pointermove", move); addEventListener("pointerup", up);
  }

  /* ---------- Menus ---------- */
  function closeMenus() {
    $("#start-menu").classList.add("hidden");
    $("#start-btn").classList.remove("open");
    $("#context-menu").classList.add("hidden");
  }

  function contextMenu(x, y, items) {
    const m = $("#context-menu");
    m.innerHTML = "";
    items.forEach((it) => {
      if (it === "-") { m.appendChild(h(`<div class="cm-sep"></div>`)); return; }
      const b = h(`<button class="cm-item" role="menuitem"><i class="ti ti-${it.icon}"></i>${esc(it.label)}</button>`);
      b.addEventListener("click", () => { closeMenus(); Sound.click(); it.action(); });
      m.appendChild(b);
    });
    m.classList.remove("hidden");
    const r = m.getBoundingClientRect();
    m.style.left = Math.min(x, innerWidth - r.width - 8) + "px";
    m.style.top = Math.min(y, innerHeight - r.height - 8) + "px";
  }

  addEventListener("resize", () => {
    const A = area();
    wins.forEach((s) => {
      if (s.max) setRect(s.el, { x: 0, y: 0, w: A.w, h: A.h });
      else {
        const r = getRect(s.el);
        if (r.x > A.w - 80) s.el.style.left = Math.max(0, A.w - r.w) + "px";
        if (r.y > A.h - 40) s.el.style.top = Math.max(0, A.h - r.h) + "px";
      }
    });
  });

  function closeAll() { [...wins.keys()].forEach((id) => { const s = wins.get(id); s.cleanup.forEach((fn) => { try { fn(); } catch {} }); s.el.remove(); $(`.tb-app[data-win="${id}"]`)?.remove(); wins.delete(id); }); }

  OS.WM = { apps, wins, registerApp, open, focus, minimize, restore, toggleMax, close, closeAll, closeMenus, contextMenu };
})();

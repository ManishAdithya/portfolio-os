/*
 * Live video wallpapers. Each one has three files in assets/wallpapers/:
 *   <id>-1080.mp4  (computers)   <id>-720.mp4  (phones, data saver)   <id>.jpg  (poster / still)
 * The video loops muted behind the desktop with a slight parallax. With "Reduce motion" on,
 * data saver on, or autoplay blocked (iOS Low Power Mode), the still poster is shown instead.
 */
(function () {
  const { $ } = OS;
  const DIR = "assets/wallpapers/";

  // [id, name, thumbnail CSS for the Settings picker]
  const LIST = [
    ["nebula", "Nebula", `url(${DIR}nebula-thumb.jpg) center / cover`],
    ["cosmos", "Cosmos", `url(${DIR}cosmos-thumb.jpg) center / cover`],
    ["planets", "Gas giant", `url(${DIR}planets-thumb.jpg) center / cover`],
    ["cliff", "Edge of the sky", `url(${DIR}cliff-thumb.jpg) center / cover`]
  ];
  const IDS = LIST.map((w) => w[0]);

  const host = $("#wallpaper");
  const layer = document.createElement("div");
  layer.className = "wp-layer";
  host.prepend(layer);

  const small = () => matchMedia("(max-width: 900px), (pointer: coarse)").matches || (navigator.connection && navigator.connection.saveData);
  const still = () => document.body.classList.contains("reduce-motion") || matchMedia("(prefers-reduced-motion: reduce)").matches || (navigator.connection && navigator.connection.saveData);
  const desktopHidden = () => $("#desktop").classList.contains("hidden");

  let id = IDS[0], current = null;

  function makeVideo(wid) {
    const v = document.createElement("video");
    v.className = "wp-video";
    v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true;
    v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.setAttribute("aria-hidden", "true");
    v.preload = "auto";
    v.poster = DIR + wid + ".jpg";
    v.style.backgroundImage = `url(${DIR}${wid}.jpg)`;
    if (!still()) v.src = `${DIR}${wid}-${small() ? 720 : 1080}.mp4`;
    return v;
  }

  function play(v) {
    if (!v || still() || desktopHidden() || document.hidden) return;
    const p = v.play();
    if (p && p.catch) p.catch(() => {}); // autoplay blocked: the poster stays up
  }

  function show(next) {
    id = IDS.includes(next) ? next : IDS[0];
    // absolute URL: a relative one in a custom property would resolve against css/, not the page
    document.documentElement.style.setProperty("--wp-poster", `url("${new URL(DIR + id + ".jpg", location.href).href}")`);
    const v = makeVideo(id), old = current;
    current = v;
    layer.appendChild(v);
    const reveal = () => { v.classList.add("on"); if (old) setTimeout(() => { old.pause(); old.remove(); }, 900); };
    if (still() || !v.src) requestAnimationFrame(reveal);
    else { v.addEventListener("loadeddata", reveal, { once: true }); setTimeout(reveal, 2500); play(v); }
  }

  // pause while nobody can see it, to save battery
  const sync = () => { if (!current) return; if (document.hidden || desktopHidden() || still()) current.pause(); else play(current); };
  document.addEventListener("visibilitychange", sync);
  new MutationObserver(sync).observe($("#desktop"), { attributes: true, attributeFilter: ["class"] });
  new MutationObserver(() => {
    // reduce-motion toggled in Settings: rebuild so the video is dropped or loaded
    if (current && still() === !!current.src) show(id);
    else sync();
  }).observe(document.body, { attributes: true, attributeFilter: ["class"] });

  // gentle parallax on computers
  let mx = 0, my = 0, tx = 0, ty = 0;
  addEventListener("pointermove", (e) => { if (e.pointerType === "mouse") { tx = (e.clientX / innerWidth - 0.5) * -14; ty = (e.clientY / innerHeight - 0.5) * -10; } });
  (function drift() {
    requestAnimationFrame(drift);
    if (still() || desktopHidden()) return;
    mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
    layer.style.transform = `translate3d(${mx.toFixed(2)}px, ${my.toFixed(2)}px, 0) scale(1.07)`;
  })();

  OS.Wallpaper = {
    list: LIST,
    get id() { return id; },
    set(next) { if (next !== id || !current) show(next); },
    prepare() { sync(); },
    buildNow() { sync(); }
  };
})();

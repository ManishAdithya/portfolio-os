/*
 * Live video wallpapers. Files in assets/wallpapers/ for each id:
 *   <id>-1080.mp4       landscape 1920x1080, most computers
 *   <id>-1440.mp4       landscape 2560x1440, large or high-DPI screens (only where the source is big enough)
 *   <id>-portrait.mp4   tall crop at the source's full resolution, phones held upright
 *   <id>.jpg / <id>-portrait.jpg   stills (poster, lock screen, reduce motion)
 *   <id>-thumb.jpg      Settings picker
 * The recorder's watermark is cropped off in the files themselves (see the encode notes in the README).
 * With "Reduce motion" on, data saver on, or autoplay blocked (iOS Low Power Mode), the still is shown.
 */
(function () {
  const { $ } = OS;
  const DIR = "assets/wallpapers/";

  // [id, name, thumbnail CSS for the Settings picker, has a 1440p file]
  const LIST = [
    ["nebula", "Nebula", `url(${DIR}nebula-thumb.jpg) center / cover`, true],
    ["cosmos", "Cosmos", `url(${DIR}cosmos-thumb.jpg) center / cover`, true],
    ["planets", "Gas giant", `url(${DIR}planets-thumb.jpg) center / cover`, true],
    ["cliff", "Edge of the sky", `url(${DIR}cliff-thumb.jpg) center / cover`, false]
  ];
  const IDS = LIST.map((w) => w[0]);

  const host = $("#wallpaper");
  const layer = document.createElement("div");
  layer.className = "wp-layer";
  host.prepend(layer);

  const saveData = () => !!(navigator.connection && navigator.connection.saveData);
  const still = () => document.body.classList.contains("reduce-motion") || matchMedia("(prefers-reduced-motion: reduce)").matches || saveData();
  const desktopHidden = () => $("#desktop").classList.contains("hidden");

  // The sharpest file that is worth downloading for this screen.
  function pick(wid) {
    if (innerHeight > innerWidth * 1.1) return { video: `${wid}-portrait.mp4`, still: `${wid}-portrait.jpg` };
    // physical pixels the video is stretched across (object-fit: cover)
    const px = Math.max(innerWidth, innerHeight * 16 / 9) * (devicePixelRatio || 1);
    const has1440 = LIST.find((w) => w[0] === wid)[3];
    return { video: `${wid}-${px > 2100 && has1440 && !saveData() ? 1440 : 1080}.mp4`, still: `${wid}.jpg` };
  }

  let id = IDS[0], current = null, currentFile = "";

  function makeVideo(f) {
    const v = document.createElement("video");
    v.className = "wp-video";
    v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true;
    v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.setAttribute("aria-hidden", "true");
    v.preload = "auto";
    v.poster = DIR + f.still;
    v.style.backgroundImage = `url(${DIR}${f.still})`;
    if (!still()) v.src = DIR + f.video;
    return v;
  }

  function play(v) {
    if (!v || still() || desktopHidden() || document.hidden) return;
    const p = v.play();
    if (p && p.catch) p.catch(() => {}); // autoplay blocked: the still stays up
  }

  function show(next) {
    id = IDS.includes(next) ? next : IDS[0];
    const f = pick(id);
    currentFile = f.video;
    // absolute URL: a relative one in a custom property would resolve against css/, not the page
    document.documentElement.style.setProperty("--wp-poster", `url("${new URL(DIR + f.still, location.href).href}")`);
    const v = makeVideo(f), old = current;
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

  // phone rotated, window resized or moved to another monitor: switch file if a different one fits better
  let rt;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (current && pick(id).video !== currentFile) show(id); }, 400); });

  // gentle parallax on computers (the 1.03 zoom leaves room for it at the edges)
  let mx = 0, my = 0, tx = 0, ty = 0;
  addEventListener("pointermove", (e) => { if (e.pointerType === "mouse") { tx = (e.clientX / innerWidth - 0.5) * -10; ty = (e.clientY / innerHeight - 0.5) * -7; } });
  (function drift() {
    requestAnimationFrame(drift);
    if (still() || desktopHidden()) return;
    mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
    layer.style.transform = `translate3d(${mx.toFixed(2)}px, ${my.toFixed(2)}px, 0) scale(1.03)`;
  })();

  OS.Wallpaper = {
    list: LIST,
    get id() { return id; },
    set(next) { if (next !== id || !current) show(next); },
    prepare() { sync(); },
    buildNow() { sync(); }
  };
})();

/* Service worker: makes the portfolio installable and lets it open offline.
 * Bump VERSION whenever you want installed copies to drop their old cache. */
const VERSION = "v1";
const CACHE = "portfolio-" + VERSION;
const CORE = [
  "./",
  "index.html",
  "css/style.css",
  "js/config.js",
  "js/core.js",
  "js/wallpaper.js",
  "js/wm.js",
  "js/apps.js",
  "js/apps-fun.js",
  "js/main.js",
  "assets/logo.png",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "manifest.webmanifest"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network first, falling back to the cache, so a deployed update shows up on the next visit
// and the app still opens with no connection. Large media (the demo GIF) is never cached.
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.protocol !== "http:" && url.protocol !== "https:") return;
  if (/\.(gif|mp4|webm)$/i.test(url.pathname)) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok || res.type === "opaque") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || (req.mode === "navigate" ? caches.match("index.html") : Response.error())))
  );
});

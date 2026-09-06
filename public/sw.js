const CACHE = "ironlog-v7";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./splash-1290x2796.png",
  "./splash-1179x2556.png",
  "./splash-750x1334.png",
  "./bg/home.webp",
  "./bg/log.webp",
  "./bg/history.webp",
  "./bg/utility.webp",
  "./quotes/gym-1.webp",
  "./quotes/gym-2.webp",
  "./quotes/gym-3.webp",
  "./quotes/gym-4.webp",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  // Network-first: always serve the latest deployed version when online
  // (this app ships frequent updates, and Vite content-hashes the JS
  // bundle filename, so a stale cached index.html can otherwise keep
  // pointing at a bundle from several deploys ago indefinitely). The
  // cache is purely an offline fallback now, not a first-choice source.
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          e.waitUntil(caches.open(CACHE).then((c) => c.put(e.request, copy)));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

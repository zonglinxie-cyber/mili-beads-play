const CACHE = "mili-beads-v10";
const CORE = ["./", "privacy", "support", "manifest.webmanifest", "favicon.svg", "app-icon-192.png", "app-icon-512.png", "header-avatar-64.png", "header-avatar-128.png", "stages/starship-cabin.webp", "stages/cloud-post.webp", "stages/candy-park.webp"].map(path => new URL(path, self.registration.scope).href);
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting())));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response.ok && new URL(event.request.url).origin === self.location.origin) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
      }
      return response;
    })).catch(() => event.request.mode === "navigate" ? caches.match(new URL("./", self.registration.scope).href) : undefined)
  );
});

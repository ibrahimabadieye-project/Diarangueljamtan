// Service worker Diaranguel — consultation hors-ligne (guide de route, pages déjà visitées)
// ⚠️ Aucune donnée personnelle ou admin n'est mise en cache :
//    /api/admin/*, /api/contacts et /api/access ne passent jamais par le cache.
const CACHE = "diaranguel-v3";
const TILE_CACHE = "diaranguel-tuiles-v3";
const MAX_TILES = 200; // LRU — respect de la politique d'usage d'OSM (usage léger)

const PRECACHE = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/images/fleuve-seneegal.jpg",
  "/images/fleuve-seneegal-2.jpg",
];

// Réponses / routes jamais mises en cache (sessions, données personnelles)
const NEVER_CACHE = ["/api/admin/", "/api/contacts", "/api/access"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE).catch(() => undefined))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE && k !== TILE_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

function isNeverCached(url) {
  return NEVER_CACHE.some((p) => url.pathname === p || url.pathname.startsWith(p));
}

// Cache LRU pour les tuiles OpenStreetMap (usage villageois léger)
async function cacheTile(request) {
  const cache = await caches.open(TILE_CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  try {
    const res = await fetch(request);
    if (res.ok && (res.status === 200)) {
      await cache.put(request, res.clone());
      // Limite de taille : supprime les tuiles les plus anciennes
      const keys = await cache.keys();
      if (keys.length > MAX_TILES) {
        for (const key of keys.slice(0, keys.length - MAX_TILES)) {
          await cache.delete(key);
        }
      }
    }
    return res;
  } catch {
    return hit || new Response("", { status: 504 });
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // 1. Données sensibles : réseau uniquement, jamais de copie sur l'appareil
  if (url.origin === self.location.origin && isNeverCached(url)) {
    event.respondWith(fetch(request));
    return;
  }

  // 2. Tuiles OpenStreetMap (hors origine) : cache d'abord, limite LRU
  if (url.hostname.endsWith("tile.openstreetmap.org")) {
    event.respondWith(cacheTile(request));
    return;
  }

  // Hors origine (autres domaines) : réseau direct
  if (url.origin !== self.location.origin) return;

  // 3. Images & icônes : cache d'abord (hors-ligne fiable)
  if (request.destination === "image" || url.pathname.startsWith("/images/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
            return res;
          })
      )
    );
    return;
  }

  // 4. Pages & données publiques : réseau d'abord, repli cache (dernier bon contenu)
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(request).then(
          (hit) =>
            hit ||
            (request.mode === "navigate"
              ? caches.match("/").then((home) => home || new Response("Hors-ligne", { status: 503 }))
              : undefined)
        )
      )
  );
});

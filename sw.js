const CACHE_NAME = "rps-game-v1";

const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/main.js",
  "./js/camera.js",
  "./js/gestureClassifier.js",
  "./js/gameState.js",
  "./js/ui.js",
  "./assets/vision_bundle.mjs",
  "./assets/wasm/vision_wasm_internal.js",
  "./assets/wasm/vision_wasm_internal.wasm",
  "./assets/wasm/vision_wasm_internal.worker.js",
  "./assets/models/hand_landmarker.task"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetched = fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});

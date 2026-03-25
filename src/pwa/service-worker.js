/**
 * service-worker.js — App-shell cache-first service worker.
 *
 * Cache-first app-shell strategy for offline relaunch.
 */

const CACHE_NAME = 'sweet-match-v2';
const APP_SCOPE = self.registration.scope;
const toAppUrl = (path = '') => new URL(path, APP_SCOPE).toString();
const APP_SHELL = [
  toAppUrl(''),
  toAppUrl('index.html'),
  toAppUrl('public/manifest.webmanifest'),
  toAppUrl('public/icons/icon-192.png'),
  toAppUrl('public/icons/icon-512.png'),

  toAppUrl('src/styles/base.css'),
  toAppUrl('src/styles/layout.css'),
  toAppUrl('src/styles/board.css'),
  toAppUrl('src/styles/motion.css'),

  toAppUrl('src/app/bootstrap.js'),
  toAppUrl('src/app/game-controller.js'),
  toAppUrl('src/app/level-flow.js'),
  toAppUrl('src/app/screen-router.js'),

  toAppUrl('src/components/board-view.js'),
  toAppUrl('src/components/hud-view.js'),
  toAppUrl('src/components/level-select-view.js'),
  toAppUrl('src/components/modal-view.js'),
  toAppUrl('src/components/toast-view.js'),

  toAppUrl('src/engine/board-generator.js'),
  toAppUrl('src/engine/gravity-engine.js'),
  toAppUrl('src/engine/levels.js'),
  toAppUrl('src/engine/match-resolver.js'),
  toAppUrl('src/engine/scoring.js'),
  toAppUrl('src/engine/special-sweets.js'),
  toAppUrl('src/engine/types.js'),

  toAppUrl('src/storage/migrations.js'),
  toAppUrl('src/storage/progress-store.js'),
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          return response;
        })
        .catch(() => caches.match(toAppUrl('index.html')));
    })
  );
});

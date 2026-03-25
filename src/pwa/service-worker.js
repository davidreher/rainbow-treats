/**
 * service-worker.js — App-shell cache-first service worker.
 *
 * Cache-first app-shell strategy for offline relaunch.
 */

const CACHE_NAME = 'sweet-match-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/public/manifest.webmanifest',
  '/public/icons/icon-192.svg',
  '/public/icons/icon-512.svg',

  '/src/styles/base.css',
  '/src/styles/layout.css',
  '/src/styles/board.css',
  '/src/styles/motion.css',

  '/src/app/bootstrap.js',
  '/src/app/game-controller.js',
  '/src/app/level-flow.js',
  '/src/app/screen-router.js',

  '/src/components/board-view.js',
  '/src/components/hud-view.js',
  '/src/components/level-select-view.js',
  '/src/components/modal-view.js',
  '/src/components/toast-view.js',

  '/src/engine/board-generator.js',
  '/src/engine/gravity-engine.js',
  '/src/engine/levels.js',
  '/src/engine/match-resolver.js',
  '/src/engine/scoring.js',
  '/src/engine/special-sweets.js',
  '/src/engine/types.js',

  '/src/storage/migrations.js',
  '/src/storage/progress-store.js',
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
        .catch(() => caches.match('/index.html'));
    })
  );
});

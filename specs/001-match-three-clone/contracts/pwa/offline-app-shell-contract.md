# Offline App Shell Contract

## Purpose

Defines the minimum offline behavior for the static PWA.

## Cached App Shell

The service worker must make these asset categories available after the first successful load:
- the root HTML entry document
- core CSS files
- core JavaScript modules
- manifest file
- required icon assets

## Runtime Expectations

- After the first successful online load, the app must open again without network access.
- The player must be able to reach either the level select view or the saved active level view offline.
- Offline availability applies only to assets already cached and data already stored locally.

## Update Strategy

- The app shell uses cache-first reads for known static assets.
- A versioned cache name controls rollout of new builds.
- Old caches are deleted when a new version is activated.

## Failure Handling

- If the service worker is unsupported, the app still runs online as a normal static page.
- If offline launch occurs before the first successful load, the app may show a non-cached failure state.

# Quickstart: Sweet Match Puzzle PWA

## Overview

This feature is planned as a static, mobile-first match-three PWA implemented with plain HTML, CSS, and JavaScript modules. The runtime has no required frontend framework and no required styling framework.

## Prerequisites

- A modern evergreen browser
- Python 3 for a simple local static server
- Node.js only when running the planned automated test tooling

## Planned Project Layout

```text
index.html
src/
├── app/
├── components/
├── engine/
├── storage/
├── pwa/
└── styles/
public/
├── icons/
└── manifest.webmanifest
tests/
├── e2e/
├── integration/
└── unit/
```

## Local Run Flow

1. Serve the repository root over HTTP:

```bash
python3 -m http.server 4173
```

2. Open the app in a browser:

```text
http://localhost:4173/
```

3. Load the app online once so the service worker can cache the app shell.
4. Reload and verify the level select screen appears.
5. Disconnect the network and verify the app still opens.

## Primary Manual Validation

### P1: Core Match Turn

1. Start level 1.
2. Perform a valid adjacent swap.
3. Verify the matched line resolves, the matching type is cleared in the resolved row or column, the score increases, gravity applies, and the board refills.
4. Perform an invalid adjacent swap.
5. Verify the board reverts and the move is not consumed.

### P2: Level Progression and Specials

1. Complete an early level and verify the next level unlocks.
2. Trigger a clear larger than four tiles in one resolved row or column.
3. Verify a special sweet is awarded and later produces a stronger clearing effect.
4. Compare an early and late level to verify the later level has a higher difficulty profile.

### P3: Persistence and Offline Resume

1. Play until at least two levels are unlocked.
2. Reload the page.
3. Verify unlocked progress and best scores are restored.
4. Close the browser tab, reopen the app offline, and verify the app still opens from cached assets and local progress.

## Planned Automated Validation

After implementation and test tooling setup:

```bash
npx vitest run
npx playwright test
```

## Storage Failure Check

1. Temporarily block or clear local storage using browser developer tools.
2. Reload the app.
3. Verify the app remains playable for the current session and shows a clear message that progress cannot be saved or has been reset.

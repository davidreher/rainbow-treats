---
description: "Task list for Sweet Match Puzzle PWA"
---

# Tasks: Sweet Match Puzzle PWA

**Input**: Design documents from `/specs/001-match-three-clone/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅ quickstart.md ✅

**Tests**: No TDD was requested. Tests are placed in the Polish phase as verification coverage rather than driving implementation.

**Organization**: Tasks are grouped by user story so each story can be implemented, tested, and validated independently.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths are included in every task description

## Path Conventions

Static web app: `index.html` at root, `src/` for modules, `public/` for hosted assets, `tests/` for validation

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the project skeleton so implementation tasks can begin immediately.

- [X] - [X] T001 Create full project directory tree per plan: `src/app/`, `src/components/`, `src/engine/`, `src/storage/`, `src/pwa/`, `src/styles/`, `public/icons/`, `tests/unit/`, `tests/integration/`, `tests/e2e/`
- [X] - [X] T002 Create root `index.html` with semantic screen containers (`#screen-level-select`, `#screen-game`, `#screen-modal`), module script entry point, and stylesheet links
- [X] - [X] T003 [P] Create `package.json` listing only dev dependencies: Vitest, `@vitest/coverage-v8`, Playwright; include scripts for `test:unit`, `test:e2e`, `dev`
- [X] - [X] T004 [P] Create `public/manifest.webmanifest` with app name, display mode `standalone`, theme color, background color, start URL, and icon stubs in `public/icons/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core primitives, data shapes, layout base, and app-shell skeleton that all three user stories depend on before any story work can begin.

**⚠️ CRITICAL**: No user story work begins until this phase is complete.

- [X] T005 Define game-wide constants and pure data types in `src/engine/types.js`: sweet type enum (`strawberry`, `lemon`, `mint`, `grape`, `blueberry`, `orange`, `cream`), tile states, board statuses, special sweet types, and resolution effect types
- [X] T006 [P] Implement board generator in `src/engine/board-generator.js`: generate a grid of random tiles for given dimensions and sweet-type count; include `hasValidInitialBoard()` guard that rejects boards with pre-existing clears or no legal moves and regenerates until valid; export `generateBoard(levelDef)`
- [X] T007 [P] Create CSS custom properties in `src/styles/base.css`: color palette for all seven sweet types, special sweet highlight, surface, shadow, text, and motion timing tokens; add a CSS reset and body defaults targeting 360px mobile-first base
- [X] T008 [P] Create responsive layout CSS in `src/styles/layout.css`: full-viewport single-page shell, stacked screen areas, centered game container with max-width cap for desktop; mobile-first media queries
- [X] T009 [P] Create board and tile CSS in `src/styles/board.css`: CSS Grid board container sized from `--board-cols` and `--board-rows` custom properties; tile base styles using sweet-type class names; state modifier classes `tile--selected`, `tile--matched`, `tile--falling`, `tile--spawning`, `tile--special`, `tile--locked`
- [X] T010 [P] Create motion CSS in `src/styles/motion.css`: keyframe animations for swap, fall, pop/explode, and spawn; `prefers-reduced-motion` media query that disables or reduces all transitions to instant
- [X] T011 Implement screen router in `src/app/screen-router.js`: exports `showScreen(name)` that shows one named screen container and hides the others; manages history pushState for browser back button support

**Checkpoint**: Project structure exists, data shapes are defined, board generator produces valid boards, CSS foundation renders a basic grid, and screen routing is wired up.

---

## Phase 3: User Story 1 — Play a Valid Match Turn (Priority: P1) 🎯 MVP

**Goal**: A player can open the game, make valid and invalid swaps, watch the board resolve correctly (clear matching line, apply gravity, refill), earn a score, and have invalid swaps rejected without consuming a move.

**Independent Test**: Open `index.html` over a local server, start level 1 manually, and verify the full swap and resolution cycle works without needing the level progression or persistence systems.

### Implementation for User Story 1

- [X] T012 [P] [US1] Implement match resolver in `src/engine/match-resolver.js`: given a `BoardState`, find all qualifying horizontal and vertical clear groups; return ordered list of `MatchGroup` objects including `clearedCells`, `clearedCount`, `awardsSpecial` flag, and `awardedSpecialType`; handle cross-axis simultaneous matches in one pass
- [X] T013 [P] [US1] Implement gravity engine in `src/engine/gravity-engine.js`: given a board with consumed tile gaps, shift remaining tiles downward column by column; spawn new tiles at the top using the level's sweet-type pool; return updated `BoardState` and list of spawn `ResolutionEffect` entries
- [X] T014 [P] [US1] Implement scoring calculator in `src/engine/scoring.js`: given a list of `MatchGroup` results, compute awarded points using `clearedCount`; apply a cascade multiplier for consecutive resolution steps; export `calculateScore(matchGroups, comboChain)`
- [X] T015 [US1] Implement the full turn orchestrator in `src/app/game-controller.js`: accept a swap input, check adjacency, perform swap, run match resolver; if no match groups found revert swap and return `invalid`; if match groups found apply clears, score, special awards, gravity, then re-run resolver for cascades until board is stable; update `BoardState` status through the full state machine (`idle` → `swapping` → `resolving` → `refilling` → `idle | won | lost`); detect no-legal-move condition and trigger reshuffle (depends on T012, T013, T014)
- [X] T016 [US1] Implement board view renderer in `src/components/board-view.js`: create and maintain one DOM tile element per cell; set CSS Grid column/row count via custom properties on the board container; update tile class list from `Tile.state` and `Tile.sweetType`; expose `render(boardState)` for full redraws and `animateEffect(effect)` for incremental animation
- [X] T017 [US1] Implement swap input controller in `src/components/board-view.js` (or `src/components/input-controller.js`): handle `pointerdown`, `pointermove`, `pointerup` for drag-to-swap gesture and tap-to-select-then-tap-adjacent pattern; emit a `swap-requested` event with from/to cell coordinates; disable input while board status is not `idle`
- [X] T018 [P] [US1] Implement HUD view in `src/components/hud-view.js`: bind to DOM elements for level number, current score, remaining moves, and target score; expose `update(snapshot)` method called after each turn; include pause/retry/exit controls that emit named events
- [X] T019 [US1] Wire up game bootstrap in `src/app/bootstrap.js`: import board generator, game controller, board view, HUD view, and screen router; create initial `BoardState` from a hardcoded level 1 definition; connect swap events from input controller to game controller; call board view render and HUD update after each resolution (depends on T015, T016, T017, T018)
- [X] T020 [US1] Add invalid-swap visual feedback in `src/components/board-view.js`: play a brief shake or bounce animation on the selected tile pair when a swap is rejected; ensure the board reverts to the previous DOM state with no score or move changes visible

**Checkpoint**: US1 is fully playable. A player can open `index.html`, swap tiles, see valid matches resolve with gravity and score updates, and see invalid swaps rejected. No level select or persistence needed to verify this story.

---

## Phase 4: User Story 2 — Progress Through Increasing Levels (Priority: P2)

**Goal**: A player can move through at least 50 levels of increasing difficulty, earn special sweets from large clears, and activate those specials through standard play.

**Independent Test**: Start level 1 and complete it to verify unlock; verify level select shows the next level as unlocked; trigger a 5+ clear to confirm a special sweet appears; compare level 1 and level 50 definitions to confirm measurably different difficulty parameters.

### Implementation for User Story 2

- [X] T021 [P] [US2] Implement all 50 level definitions in `src/engine/levels.js`: export `LEVELS` array with one object per level containing `id`, `name`, `boardWidth`, `boardHeight`, `sweetTypeCount`, `targetScore`, `moveLimit`, `difficultyTier`, and `specialRewardThreshold`; difficulty band — levels 1–10 (`intro`: 6×6, 4 types, 25 moves, targets 500–1 500); levels 11–30 (`mid`: 8×8, 5–6 types, 20→15 moves, targets 2 000–4 000); levels 31–50 (`late`: 8×8, 6–7 types, 14→10 moves, targets 4 500–6 500)
- [X] T022 [P] [US2] Implement special sweet engine in `src/engine/special-sweets.js`: export effect functions `applyRowClear(board, tile)`, `applyColumnClear(board, tile)`, `applySameTypeClear(board, tile)`; each returns updated `BoardState` and a `ResolutionEffect` list; integrate with game controller cascade loop so triggered specials feed back into the resolver
- [X] T023 [US2] Integrate special sweet award and activation into `src/app/game-controller.js`: after match resolution detect `awardsSpecial` groups, place a special tile of the awarded type at the cleared position; during cascades detect consumed special tiles and dispatch their effect function (depends on T021, T022)
- [X] T024 [US2] Implement level flow controller in `src/app/level-flow.js`: handle win condition check (score >= target), defeat check (movesLeft <= 0), increment `highestUnlockedLevel` on win, emit `level-won` and `level-lost` events with summary data; export `LevelFlow` that wraps game controller per level
- [X] T025 [US2] Implement level select view in `src/components/level-select-view.js`: render a scrollable grid of level buttons in progression order; mark levels beyond `highestUnlockedLevel` as locked with a visible lock state; display best score badge for completed levels; emit `level-selected` event on tap of an unlocked level
- [X] T026 [P] [US2] Implement modal view in `src/components/modal-view.js`: generic overlay panel that accepts a title, message, and array of action buttons; used for win summary (score, best score, next level), lose/retry prompt, and exit confirmation; emit named action events so parent screens can react without coupling
- [X] T027 [US2] Wire level progression into screen router and bootstrap in `src/app/bootstrap.js` and `src/app/screen-router.js`: on `level-won`, show win modal then return to level select with updated unlock state; on `level-lost`, show retry/exit modal; on `level-selected`, generate board from chosen level definition and transition to game screen (depends on T024, T025, T026)

**Checkpoint**: US2 is independently testable. A player can navigate the level select, play through levels, unlock the next, trigger and activate special sweets, and see difficulty change across the 50-level ladder.

---

## Phase 5: User Story 3 — Resume Progress on Any Visit (Priority: P3)

**Goal**: Unlocked levels and best scores survive page reloads; the app relaunches from cached assets after going offline; storage failures surface a clear player message.

**Independent Test**: Play two levels, reload the page, verify progress restores; disable network in dev tools and reload to verify offline relaunch; force localStorage to fail and verify the game stays playable with a visible warning.

### Implementation for User Story 3

- [X] T028 [P] [US3] Implement progress store in `src/storage/progress-store.js`: export `loadProgress()` that reads and validates the `sweet-match-progress` localStorage key; export `saveProgress(progress)` that serialises and writes it; wrap both in try/catch and emit a `storage-error` custom event if unavailable; export `clearProgress()` for reset flows
- [X] T029 [P] [US3] Implement migration functions in `src/storage/migrations.js`: export `migrate(rawData)` that reads `schemaVersion` and applies sequential transforms to reach the current schema version; preserve `highestUnlockedLevel` and `bestScoresByLevel` across all migrations; fall back to a clean default if migration throws
- [X] T030 [US3] Implement toast notification view in `src/components/toast-view.js`: renders a dismissable status message at the top of the viewport; listens for `storage-error` events and shows "Progress cannot be saved" message; used for any short-lived player-facing notification (depends on T028)
- [X] T031 [US3] Integrate save checkpoints into level flow and game controller: call `saveProgress()` after level completion, after `highestUnlockedLevel` advances, after a new best score is set, and after a resumable snapshot is written; pass loaded progress into level select view and HUD on app start (depends on T028, T024)
- [X] T032 [US3] Implement resume session restore in `src/app/bootstrap.js`: on app load, call `loadProgress()`, check for a valid `resumeSession`, and if present offer the player a "Continue" option that restores `BoardState` from the saved session before entering the game screen (depends on T028, T029)
- [X] T033 [P] [US3] Complete service worker in `src/pwa/service-worker.js`: cache-first strategy for all app-shell assets listed by name; use a versioned cache name (`sweet-match-v1`) so old caches are deleted on activation; handle `install`, `activate`, and `fetch` events; include `index.html`, all CSS files, all JS modules, manifest, and icon assets in the precache list
- [X] T034 [US3] Register service worker and configure offline fallback in `index.html`: add inline registration script that checks `navigator.serviceWorker` support before registering `src/pwa/service-worker.js`; no graceful-degradation needed beyond skipping registration in unsupported browsers

**Checkpoint**: US3 is independently testable. Progress survives reloads, the app opens offline, and storage failures surface a visible message without breaking active gameplay.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Visual polish, accessibility, and verification coverage that improve all three stories.

- [ ] T035 [P] Add candy-style visual layer to `src/styles/board.css`: layered radial gradients or SVG-based fill per sweet type using CSS custom properties; glow ring for `tile--selected`; burst opacity flash for `tile--matched`; shadow depth for resting tiles
- [ ] T036 [P] Add accessibility improvements across all interactive components: ARIA labels on board tiles and controls; keyboard navigation for tile selection (arrow keys + Enter/Space); ensure HUD and modals announce score changes with live regions
- [ ] T037 [P] Add app icon set to `public/icons/`: minimum sizes 192×192 and 512×512 PNG; update `manifest.webmanifest` icon references; verify install prompt appears in Chrome and Safari mobile
- [ ] T038 [P] Write unit tests for match resolver in `tests/unit/match-resolver.test.js`: cases for row match, column match, simultaneous cross-axis match, exactly-three match, five-or-more match triggering special award, no-match board
- [ ] T039 [P] Write unit tests for gravity engine in `tests/unit/gravity-engine.test.js`: cases for single gap, multi-gap column, full-column gap, spawn count equals gap count
- [ ] T040 [P] Write unit tests for scoring and special sweets in `tests/unit/scoring.test.js`: base points per clear count, cascade multiplier, row-clear effect cell count, column-clear effect cell count, same-type-clear effect cell count
- [ ] T041 [P] Write unit tests for progress store and migrations in `tests/unit/storage.test.js`: fresh install default, round-trip save and load, schema migration from v0 to current, corrupt-data fallback to default
- [ ] T042 Write Playwright e2e test for mobile match-turn flow in `tests/e2e/mobile-play.spec.js`: viewport 390×844, launch level 1, perform a valid swap, assert board updates; perform an invalid swap, assert board reverts
- [ ] T043 Write Playwright e2e test for persistence and offline in `tests/e2e/offline.spec.js`: complete level 1, reload page, assert progress restored; enable offline mode, reload, assert app-shell loads and level select appears
- [ ] T044 Run manual quickstart validation scenarios from `specs/001-match-three-clone/quickstart.md` and confirm all checkpoints pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Requires Phase 1 completion — blocks all user stories
- **US1 (Phase 3)**: Requires Phase 2 — no dependency on US2 or US3
- **US2 (Phase 4)**: Requires Phase 2 — no dependency on US3; integrates with US1 engine
- **US3 (Phase 5)**: Requires Phase 2 — integrates with US1 game controller and US2 level flow
- **Polish (Phase N)**: Requires all desired user stories to be complete

### User Story Dependencies

- **US1**: Depends only on Phase 2 foundational work — no cross-story dependencies
- **US2**: Depends on Phase 2 and builds on the US1 engine modules (match resolver, game controller); can be started once T015 is merged
- **US3**: Depends on Phase 2; integrates with US1 save checkpoints (T031) and US2 level unlock (T031); can be started independently from US2 as long as T015 exists

### Within Each User Story

- Engine modules (T012, T013, T014) before orchestrator (T015)
- Game controller (T015) before bootstrap wiring (T019)
- Level data and special engine (T021, T022) before integration (T023)
- Progress store (T028) and migrations (T029) before checkpoint integration (T031) and resume restore (T032)

---

## Parallel Opportunities

### During Phase 2 (Foundational)

```
T006 board-generator.js
T007 base.css              ← all independent, run together
T008 layout.css
T009 board.css
T010 motion.css
```

### During Phase 3 (US1)

```
T012 match-resolver.js
T013 gravity-engine.js     ← launch together, then T015 waits for all three
T014 scoring.js
T018 hud-view.js           ← independent of engine tasks, runs in parallel
```

### During Phase 4 (US2)

```
T021 levels.js
T022 special-sweets.js     ← independent of each other
T026 modal-view.js
```

### During Phase 5 (US3)

```
T028 progress-store.js
T029 migrations.js         ← independent of each other
T033 service-worker.js
```

### During Polish

```
T035 visual polish
T036 accessibility         ← all independent, run together
T037 icons
T038–T041 unit tests       ← all four test files are independent
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup (T001–T004)
2. Complete Phase 2: Foundational (T005–T011)
3. Complete Phase 3: US1 (T012–T020)
4. **STOP and VALIDATE**: swap logic works on a single level, score updates, invalid swaps revert
5. Demo the core loop before adding progression or persistence

### Incremental Delivery

- Foundation + US1 → playable core loop `[MVP]`
- Add US2 → full 50-level progression with specials
- Add US3 → local save, offline relaunch, resume
- Add Polish → visual quality, accessibility, tests

### Parallel Team Strategy

With two developers:
- Developer A: Phase 2 engine modules (T006, T012, T013, T014, T022) + Phase 3 game controller
- Developer B: Phase 2 CSS + HTML shell (T007–T011) + Phase 3 views (T016–T018)
- Both integrate through `bootstrap.js` (T019)

---

## Notes

- [P] tasks touch different files with no dependencies on incomplete tasks in the same phase
- [US] label maps each task to the user story it serves for traceability
- Each user story phase is independently completable and testable
- Include offline, storage, and mobile-first checks in every phase checkpoint
- Avoid same-file conflicts within parallel work groups
- Constitution check: every task stays within static HTML/CSS/JS, localStorage, and service worker — no backend assumptions

# Research: Sweet Match Puzzle PWA

## Decision: Use DOM elements with CSS Grid for the game board

Rationale:
- An 8x8 or smaller board keeps DOM size low, so performance remains well within mobile browser limits.
- CSS Grid makes responsive board sizing and touch-friendly layout simpler than manual canvas coordinate math.
- DOM-based tiles are easier to animate, debug, and keep accessible than a canvas-only rendering layer.
- The board state is easier to inspect during testing and local debugging.

Alternatives considered:
- Canvas: rejected because the board is too small to justify a custom rendering pipeline, touch hit testing, and manual animation orchestration.
- SVG: rejected because it adds little over a DOM grid for a square tile board.
- WebGL or WebAssembly: rejected as unnecessary complexity for a static match-three game.

## Decision: Use vanilla CSS with CSS variables instead of Tailwind

Rationale:
- The constitution prioritizes minimal dependencies and a static deployable surface.
- A candy-styled interface can be achieved with custom properties, gradients, layered backgrounds, and targeted animations without a utility framework.
- Vanilla CSS keeps the production runtime dependency-free and avoids a build-time styling pipeline.
- A small component count makes custom class naming manageable.

Alternatives considered:
- Tailwind CSS: rejected because it would add build tooling and dependency overhead without solving a hard problem for this size of interface.
- SCSS or LESS: rejected because CSS variables and modern CSS cover the needed styling patterns.

## Decision: Use plain HTML, CSS, and JavaScript modules with no runtime framework

Rationale:
- The user explicitly wants a JavaScript, CSS, and HTML solution.
- The feature scope fits a single-page app with a small number of screens: splash or level select, active game board, pause or retry dialogs, and progress summaries.
- A framework is not required to manage the number of UI states involved.
- ES modules are supported in the target browsers and keep code organization straightforward.

Alternatives considered:
- React, Vue, or similar frameworks: rejected because they add runtime and tooling complexity not justified by the feature scope.
- Vite as mandatory build tooling: rejected for the initial implementation because a static module-based app can run without bundling.

## Decision: Use a static file layout with a lightweight local dev server

Rationale:
- Service workers require serving the app over HTTP, but that can be handled by a simple local server such as `python3 -m http.server`.
- Static hosting is the final deployment target, so development should remain close to production.
- Avoiding a bundler keeps the project aligned with the constitution's simplicity and dependency rules.

Alternatives considered:
- Vite dev server and build pipeline: rejected initially because it adds configuration and npm dependencies that are not required for the first implementation.

## Decision: Use a custom service worker with a cache-first app shell strategy

Rationale:
- The feature requires offline relaunch after the first successful load.
- A custom service worker is sufficient for caching the app shell, icons, manifest, and level assets.
- Cache-first behavior is appropriate because the app is static and does not depend on live server data.
- Keeping the implementation custom avoids the weight and abstraction of Workbox.

Alternatives considered:
- Workbox: rejected because it introduces additional dependency and configuration overhead.
- No service worker: rejected because it would fail the offline PWA requirement.

## Decision: Persist progression with versioned localStorage records

Rationale:
- The saved data footprint is small: unlocked levels, best scores, settings, and an optional resumable board state.
- localStorage is synchronous and simple, which keeps the game loop and save checkpoints straightforward.
- Schema versioning allows future migration without silently corrupting saved progress.
- The application can gracefully continue in session mode if persistence is unavailable.

Alternatives considered:
- IndexedDB: rejected because it adds asynchronous complexity for a modest amount of data.
- Remote persistence: rejected because it violates the no-backend constitution.

## Decision: Define 50 levels through static metadata, not procedural generation

Rationale:
- Static level definitions make difficulty progression explicit, testable, and easier to tune.
- The requested difficulty ramp can be expressed by combining goal score, move limit, board size, and sweet type count.
- Designers can rebalance individual levels without changing the core engine.
- Static data works cleanly with offline play and avoids runtime unpredictability.

Alternatives considered:
- Procedural generation: rejected because it makes progression consistency and testing harder.
- A single endless mode: rejected because it does not satisfy the requirement for at least 50 increasingly difficult levels.

## Decision: Keep level difficulty simple in v1 by varying score targets, move limits, board dimensions, and sweet variety

Rationale:
- This approach satisfies the increasing-difficulty requirement without introducing blockers, monetization systems, or extra tile rule complexity in the first version.
- Early levels can teach mechanics on smaller boards with more moves.
- Mid and late levels can increase pressure by raising score targets, reducing move counts, and broadening the active sweet set.
- This remains compatible with later expansion if obstacle tiles are ever needed.

Alternatives considered:
- Obstacle-heavy late levels: rejected for v1 because they expand the engine surface area significantly.
- Random difficulty scaling only: rejected because it produces a less predictable progression curve.

## Decision: Award special sweets from clears of five or more tiles and activate them through standard swap or triggered clear resolution

Rationale:
- This maps directly to the user requirement for stronger sweets after larger clears.
- Activation by normal swapping keeps player interaction consistent.
- Trigger resolution during cascades creates satisfying chain reactions without requiring extra controls.
- A deterministic resolution order keeps scoring and replay behavior testable.

Alternatives considered:
- Separate tap-to-activate special controls: rejected because they complicate mobile interaction and introduce more UI state.
- A large catalog of special types: rejected in favor of a focused set of row clear, column clear, and same-type clear effects.

## Decision: Use Vitest for logic tests and Playwright for mobile and offline end-to-end coverage

Rationale:
- The board engine, scoring rules, invalid swap reversion, gravity, and level unlock logic all need deterministic automated validation.
- Playwright can emulate mobile viewports and offline conditions, which directly matches the highest-risk user journeys.
- Vitest is a small, ESM-friendly choice for JavaScript logic testing.

Alternatives considered:
- Jest: rejected as heavier than needed for this project.
- Cypress: rejected because Playwright covers mobile and offline scenarios more directly for this use case.

## Decision: Use a candy-styled visual system built with CSS only

Rationale:
- A sleek look can be produced with layered gradients, expressive typography, rounded surfaces, and animated highlights.
- CSS-only visual polish keeps runtime dependencies at zero.
- The board and HUD can stay readable on small screens while still feeling playful and intentional.

Alternatives considered:
- External UI kits or component libraries: rejected because they would add dependencies and dilute the visual specificity of the app.

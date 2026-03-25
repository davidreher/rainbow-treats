# Implementation Plan: Sweet Match Puzzle PWA

**Branch**: `001-match-three-clone` | **Date**: 2026-03-24 | **Spec**: `/Users/david/private/rainbow-treats/specs/001-match-three-clone/spec.md`
**Input**: Feature specification from `/specs/001-match-three-clone/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build a single-page, mobile-first match-three PWA with at least 50 increasingly difficult levels using plain HTML, CSS, and JavaScript modules. The implementation will use a DOM and CSS Grid board, a custom game engine for deterministic swap and cascade resolution, versioned localStorage for progression, and a custom service worker for offline app-shell caching, while avoiding unnecessary runtime dependencies and skipping Tailwind unless later implementation proves it necessary.

## Technical Context

**Language/Version**: JavaScript (ES2022 modules), HTML5, CSS3  
**Primary Dependencies**: Runtime: none; Validation: Vitest, Playwright  
**Storage**: localStorage for player progress and resume state; Cache Storage for offline app shell  
**Testing**: Vitest for unit and integration logic; Playwright for mobile, persistence, and offline end-to-end validation  
**Target Platform**: Modern evergreen mobile-first browsers with desktop support and installable PWA capability  
**Project Type**: Static web app / Progressive Web App  
**Performance Goals**: First interactive board available quickly on mobile, normal move resolution completes within 1 second, animations remain perceptibly smooth on mid-range mobile devices  
**Constraints**: Static deployment only, no SSR or backend, mobile-first at 360px width, local-first persistence, offline relaunch after first load, minimal runtime dependencies  
**Scale/Scope**: Single-page puzzle game, 50 fixed levels, one local player profile, board sizes from 6x6 to 8x8, focused special sweet set

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Gate Review

- PASS: Static deployment only. The design uses deployable static assets with no server runtime, API, or SSR dependency.
- PASS: Local-first persistence only. Progress, settings, and optional resume state are stored locally with versioned `localStorage` records; no remote sync is introduced.
- PASS: Mobile-first PWA. The primary board interaction is designed for touch on a 360px viewport, and offline relaunch is handled through an app-shell service worker.
- PASS: Dependency discipline. The runtime stack is plain HTML, CSS, and JavaScript with no required UI framework or Tailwind.
- PASS: Simplicity review. DOM plus CSS Grid was selected over Canvas, WebGL, Tailwind, and mandatory bundling because the feature scope does not justify those layers.

### Post-Design Gate Review

- PASS: Research, data model, contracts, and quickstart remain aligned with a static deployment target.
- PASS: Persistence and migration behavior are explicitly documented in the storage contract and data model.
- PASS: Mobile-first and offline obligations are reflected in the UI, PWA, and validation contracts.
- PASS: Added complexity is limited to a custom service worker and automated test tooling, both justified by offline and validation requirements rather than styling or rendering convenience.
- PASS: No constitutional violations require exception handling or governance changes.

## Project Structure

### Documentation (this feature)

```text
specs/001-match-three-clone/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── data/
│   ├── pwa/
│   ├── storage/
│   ├── testing/
│   └── ui/
└── tasks.md
```

### Source Code (repository root)

```text
index.html
src/
├── app/
│   ├── bootstrap.js
│   ├── game-controller.js
│   ├── level-flow.js
│   └── screen-router.js
├── components/
│   ├── board-view.js
│   ├── hud-view.js
│   ├── level-select-view.js
│   ├── modal-view.js
│   └── toast-view.js
├── engine/
│   ├── board-generator.js
│   ├── match-resolver.js
│   ├── gravity-engine.js
│   ├── special-sweets.js
│   ├── scoring.js
│   └── levels.js
├── storage/
│   ├── progress-store.js
│   └── migrations.js
├── pwa/
│   ├── manifest.webmanifest
│   └── service-worker.js
└── styles/
    ├── base.css
    ├── layout.css
    ├── board.css
    └── motion.css
public/
├── icons/
└── social-preview/
tests/
├── e2e/
├── integration/
└── unit/
```

**Structure Decision**: Use a root `index.html` entry and a feature-focused `src/` tree so the app stays deployable as plain static files while keeping engine logic, UI rendering, persistence, and PWA concerns separated. `public/` holds host-served assets such as icons and metadata. `tests/` mirrors the chosen validation layers.

## Complexity Tracking

No constitution violations require justification at planning time.

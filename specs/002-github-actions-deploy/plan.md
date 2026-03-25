# Implementation Plan: GitHub Actions CI/CD and GitHub Pages Deployment

**Branch**: `002-github-actions-deploy` | **Date**: 2026-03-25 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-github-actions-deploy/spec.md`

## Summary

Deploy the Rainbow Treats game automatically to GitHub Pages using GitHub Actions. Two YAML workflow files are added: `ci.yml` (runs Vitest unit tests on all branches and PRs) and `deploy.yml` (runs tests then stages and publishes static game files on push to `main`). No bundler or compilation step is needed — `index.html`, `src/`, and `public/` are copied to a staging directory and uploaded as a Pages artifact using the official `actions/upload-pages-artifact` + `actions/deploy-pages` actions. One pre-existing compatibility fix is required: the service worker registration scope and the PWA manifest `start_url` must use relative paths (`'./'`) so the PWA installs correctly under the GitHub Pages subpath (`/<repo>/`).

## Technical Context

**Language/Version**: JavaScript ES modules (game runtime); YAML (workflow configuration); Node.js v22.x LTS (CI runner)  
**Primary Dependencies**: `actions/checkout@v4`, `actions/setup-node@v4`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4` — all official GitHub-maintained actions; zero new npm packages  
**Storage**: No new storage. Existing `localStorage` usage unchanged.  
**Testing**: Vitest v2 (unit tests, CI gate); Playwright (e2e, not in CI gate — see research)  
**Target Platform**: GitHub Actions `ubuntu-latest` runners; GitHub Pages CDN (free for public repositories)  
**Project Type**: Static web app + CI/CD pipeline configuration  
**Performance Goals**: Full pipeline (checkout → install → test → deploy) completes in < 4 minutes (SC-007)  
**Constraints**: Public GitHub repository; no bundler; no server-side logic; free-tier Actions minutes; GitHub Pages subpath deployment  
**Scale/Scope**: Single repository, single Pages deployment target

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Static deployment only** ✅ — GitHub Actions copies static files to Pages via `upload-pages-artifact` + `deploy-pages`. No runtime is introduced. The deployed output is identical to what `python3 -m http.server` serves locally.
- **Local-first persistence only** ✅ — The pipeline introduces no new storage. All game state remains in `localStorage` on the player's device. The deployment process does not read, modify, or migrate local data.
- **Mobile-first PWA** ✅ — The same HTML, CSS, JS, manifest, and service worker are deployed unchanged. A scope compatibility fix (`'/'` → `'./'`) is required to make the PWA installable on the GitHub Pages subpath; this also works correctly on local dev.
- **Dependency discipline** ✅ — Zero new npm packages. The four official GitHub Actions actions are CI-only; they are not shipped to users and have no impact on bundle size or runtime.
- **Simplicity review** ✅ — No bundler, no build step, direct file copy. The simpler rejected alternative (manual `git push` to a `gh-pages` branch) was eliminated because it violates FR-010 (zero manual steps beyond merging a PR).

**Complexity tracking (justified violations):**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Service worker `scope` change `'/'` → `'./'` | GitHub Pages serves the app at `/<repo>/`; a scope of `'/'` crosses the origin root boundary, causing the browser to reject the SW registration silently in production | Keeping `'/'` makes the PWA non-installable on Pages with no visible error to the developer; `'./'` is the correct relative scope and works identically on `localhost` |

*Post-design Constitution re-check*: No additional violations introduced. Design is minimal and fully within the constitution.

## Project Structure

### Documentation (this feature)

```text
specs/002-github-actions-deploy/
├── plan.md                          # This file
├── research.md                      # Phase 0 output
├── data-model.md                    # Phase 1 output
├── quickstart.md                    # Phase 1 output
├── contracts/
│   ├── status-checks.md             # Phase 1 output
│   └── deployment-artifact.md       # Phase 1 output
└── tasks.md                         # Phase 2 output (/speckit.tasks — not created here)
```

### Source Code (repository root)

```text
.github/
└── workflows/
    ├── ci.yml           # NEW: unit tests on all pushes and PRs
    └── deploy.yml       # NEW: unit tests + GitHub Pages deployment on push to main

index.html               # MODIFIED: SW registration scope '/' → './'
public/
└── manifest.webmanifest # MODIFIED: start_url '/' → './'

src/                     # Unchanged (all deployed as-is)
├── app/
├── components/
├── engine/
├── pwa/
│   └── service-worker.js
├── storage/
└── styles/
```

**Structure Decision**: CI/CD configuration lives entirely in `.github/workflows/`. Two new YAML files are added. Two existing files receive targeted single-line edits (scope and start_url). No new source directories are created.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Service worker `scope` change `'/'` → `'./'` | GitHub Pages serves the app at `/<repo>/`. A SW script at `…/<repo>/src/pwa/service-worker.js` cannot hold a scope of `'/'` (origin root) — the browser rejects the registration silently. The game appears to work but is not installable as a PWA on Pages. | Keeping `'/'` causes a silent production failure with no developer-visible error. `'./'` is the correct relative scope, resolves to `/<repo>/` on Pages, and resolves to `/` on localhost — no regression on local dev. |


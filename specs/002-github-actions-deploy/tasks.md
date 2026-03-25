---
description: "Task list for 002-github-actions-deploy"
---

# Tasks: GitHub Actions CI/CD and GitHub Pages Deployment

**Input**: Design documents from `/specs/002-github-actions-deploy/`  
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: User story label — US1, US2, US3 (setup and polish phases have no story label)

---

## Phase 1: Setup (Repository Configuration)

**Purpose**: One-time manual prerequisite that enables all automated deployment.

- [X] T001 Configure GitHub Pages source to "GitHub Actions" in repository Settings → Pages (manual step — required before any deploy.yml run can publish)

---

## Phase 2: User Story 1 — Automatic Deployment on Merge (Priority: P1) 🎯 MVP

**Goal**: Merging a PR to main automatically deploys the game to GitHub Pages with no further manual action.

**Independent Test**: Push any commit to main → confirm Actions tab shows passing `Deploy / test` and `Deploy / deploy` jobs → visit the Pages URL and confirm the game loads within 5 minutes of the merge.

### Implementation for User Story 1

- [X] T002 [US1] Create `.github/workflows/deploy.yml` with `name: Deploy`, `on: push` trigger scoped to `branches: [main]`, permissions (`contents: read`, `pages: write`, `id-token: write`), and concurrency block (`group: pages`, `cancel-in-progress: true`)
- [X] T003 [US1] Add `test` job to `.github/workflows/deploy.yml`: `runs-on: ubuntu-latest`, steps `actions/checkout@v4`, `actions/setup-node@v4` (node-version 22, cache npm), `npm ci`, `npm run test:unit`
- [X] T004 [US1] Add `deploy` job to `.github/workflows/deploy.yml`: `needs: test`, `environment: {name: github-pages, url: ${{ steps.deploy.outputs.page_url }}}`, staging step (`mkdir _site && cp index.html _site/ && cp -r src/ _site/src && cp -r public/ _site/public && touch _site/.nojekyll`), `actions/upload-pages-artifact@v3` (path `_site`), `actions/deploy-pages@v4` (id `deploy`)

**Checkpoint**: US1 independently testable — merge a commit to main, confirm both jobs pass in the Actions tab, open the Pages URL and confirm the game is the updated version.

---

## Phase 3: User Story 2 — Automated Test Gate on Pull Requests (Priority: P2)

**Goal**: Every pull request targeting main automatically receives a CI status check (`CI / test`) so developers see test results before merging.

**Independent Test**: Open a PR targeting main → confirm `CI / test` status check appears and passes; push a deliberate test failure → confirm the check turns red.

### Implementation for User Story 2

- [X] T005 [US2] Create `.github/workflows/ci.yml` with `name: CI`, triggers (`on: push` all branches, `on: pull_request` targeting `main`), `permissions: {contents: read}`, and `test` job (`runs-on: ubuntu-latest`, `actions/checkout@v4`, `actions/setup-node@v4` Node 22 with npm cache, `npm ci`, `npm run test:unit`)

**Checkpoint**: US2 independently testable — open a PR to main, confirm the `CI / test` status check appears on the PR page with a pass/fail result. Note: `CI / test` is the status check name to use in branch protection rules (see `contracts/status-checks.md`).

---

## Phase 4: User Story 3 — Stable Public URL for Players (Priority: P3)

**Goal**: The game deployed to GitHub Pages is fully playable, installable as a PWA, and works offline — requiring a targeted fix to the service worker scope and manifest `start_url` which would otherwise break under the Pages subpath (`/<repo>/`).

**Independent Test**: After deployment, visit the Pages URL → open DevTools → Application → Service Workers → confirm SW registered with scope `/<repo>/` (no error) → open Manifest tab → confirm `start_url` is `./` → install PWA → close all tabs → reopen installed app offline → confirm game loads.

### Implementation for User Story 3

- [X] T006 [P] [US3] Fix service worker registration scope in `index.html`: change `{ scope: '/' }` to `{ scope: './' }` so the SW registers at `/<repo>/` on GitHub Pages without crossing the origin root boundary
- [X] T007 [P] [US3] Fix `start_url` in `public/manifest.webmanifest`: change `"/"` to `"./"` so the installed PWA launches the game at the correct GitHub Pages subpath rather than the origin root

**Checkpoint**: US3 independently testable — install the PWA from the Pages URL, launch it offline, confirm the game loads and DevTools shows no SW registration errors.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T008 Create `README.md` at repository root with project title, GitHub Actions CI badge (`![CI](https://github.com/ORG/REPO/actions/workflows/ci.yml/badge.svg)`), and a link to the live GitHub Pages URL (replace `ORG` and `REPO` with actual values)

---

## Dependencies & Execution Order

```text
T001 (Settings → Pages: one-time manual setup)
  │
  ├── T002 → T003 → T004   [US1: deploy.yml — steps are sequential within one file]
  │
  ├── T005                  [US2: ci.yml — independent of US1, can begin after T001]
  │
  ├── T006, T007            [US3: PWA fixes — independent of US1/US2, parallel with each other]
  │
  └── T008                  [Polish — independent, can be done any time]
```

### Parallel Opportunities per User Story

**US1 is sequential** — T002 → T003 → T004 build on each other within a single YAML file.

**US2** (T005) can be written in parallel with any US1 task — different file, no shared dependencies.

**US3** — T006 and T007 are fully parallel (different files).

**Polish** (T008) is independent of all implementation tasks.

---

## Implementation Strategy

### MVP (User Story 1 Only)

Complete T001 + T002 + T003 + T004. This gives fully automated deployment: merging to main publishes the game to GitHub Pages with no manual steps. Satisfies FR-001, FR-002, FR-003, FR-005 through FR-011.

### Add PR gate (User Story 2)

Add T005. Developers now see test results before merging any PR. Satisfies FR-001 and FR-004.

### Add PWA correctness (User Story 3)

Apply T006 + T007 (can be done before or after the pipeline tasks — these are pure file edits). The game becomes installable as a PWA and works offline from the Pages URL. Satisfies FR-012 (no new dependencies) and SC-005.

### Polish

T008 — add README with badge. The repository home page shows live CI status at a glance.

---

## Task Count Summary

| Phase | Tasks | User Story | Parallel? |
|-------|-------|-----------|-----------|
| Phase 1: Setup | 1 | — | N (manual) |
| Phase 2: US1 Deployment | 3 | US1 (P1) | T002→T003→T004 sequential |
| Phase 3: US2 CI Gate | 1 | US2 (P2) | Yes (parallel with US1) |
| Phase 4: US3 PWA Fix | 2 | US3 (P3) | T006/T007 parallel |
| Phase 5: Polish | 1 | — | Yes |
| **Total** | **8** | | |

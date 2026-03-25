# Research: GitHub Actions CI/CD and GitHub Pages Deployment

**Phase**: 0 — Unknowns resolved before design  
**Feature**: 002-github-actions-deploy

## Decision 1: GitHub Pages source method

**Decision**: Use **GitHub Actions as the Pages source** (Settings → Pages → Source → GitHub Actions), not "Deploy from a branch."

**Rationale**: The "GitHub Actions" source method (GA since 2022) lets workflows upload a file artifact using `actions/upload-pages-artifact` and then deploy it using `actions/deploy-pages` — both official GitHub-maintained actions. The deployment is tracked in the GitHub Deployments UI, the `github-pages` environment enforces the correct permission model (`id-token: write` for OIDC), and no extra branch is created.

**Alternatives considered**:
- `peaceiris/actions-gh-pages` (community action, pushes to a `gh-pages` branch). Rejected: creates throw-away commits on a separate branch, pollutes repository history, requires write permission to a branch rather than an OIDC deployment token, complicates first-run initialisation.
- Manual `git push origin gh-pages` in the workflow. Rejected: same history pollution problem plus additional git credential setup.

---

## Decision 2: Workflow file structure (one vs two files)

**Decision**: **Two workflow files** — `.github/workflows/ci.yml` and `.github/workflows/deploy.yml`.

| File | Trigger | Jobs |
|------|---------|------|
| `ci.yml` | `push` (all branches), `pull_request` targeting `main` | `test` (Vitest unit tests) |
| `deploy.yml` | `push` to `main` only | `test` → `deploy` (sequential) |

**Rationale**: Separating CI from deployment gives:
1. A predictable status check name (`ci / test`) for branch protection rules — independent of the deploy workflow.
2. The `id-token: write` Pages permission scoped only to `deploy.yml`, which never runs on fork PR pushes — preventing permission escalation from untrusted code.
3. Independent iteration on testing strategy vs deployment strategy.

**Alternatives considered**: Single workflow with `if: github.ref == 'refs/heads/main'` guards on the deploy job. Rejected: `id-token: write` would appear in the same workflow file as the PR test job, granting overly broad permissions even if the job is skipped on PRs from forks.

---

## Decision 3: Tests run in CI gate

**Decision**: **Run only Vitest unit tests** in the CI gate (`npm run test:unit`). Playwright e2e tests are NOT part of the automated merge gate.

**Rationale**: Playwright tests require a running HTTP server (the game is an ES-module app that cannot be opened as `file://`). Setting up a background server, waiting for it to be ready, and tearing it down adds complexity (~60–90 s extra) and is fragile. The existing `offline.spec.js` already skips gracefully when the service worker controller is unavailable in headless Chromium — giving no additional signal over the unit tests. Unit tests cover all engine logic and are sufficient as a regression gate.

**Alternatives considered**: Running `npm test` (Vitest + Playwright) in CI by launching `python3 -m http.server` as a background process. Not rejected outright — this is a viable follow-up. Excluded from scope here to keep the initial pipeline simple and within the 4-minute SC-007 target.

---

## Decision 4: Deployment artifact — which files to publish

**Decision**: Stage and publish **only**: `index.html`, `src/`, `public/`, and a `.nojekyll` marker file. All other repository content is excluded.

**Files excluded**: `.git/`, `.github/`, `.specify/`, `specs/`, `tests/`, `test-results/`, `node_modules/`, `package.json`, `package-lock.json`, `playwright.config.js`, `vitest.config.*`.

**Rationale**: The game loads `index.html` at the root and imports modules from `src/` and assets from `public/`. Nothing else is needed at runtime. Publishing the full repository exposes planning documents and test fixtures unnecessarily and increases artifact size.

The `.nojekyll` file tells GitHub Pages to skip Jekyll processing, which prevents it from ignoring any file or directory prefixed with `_`. No such files exist today, but the marker is best-practice.

**Implementation**: The `deploy.yml` workflow creates a `_site/` staging directory, copies the three paths into it, writes `.nojekyll`, then passes `_site/` as the `path` to `actions/upload-pages-artifact`.

**Alternatives considered**: Using `path: '.'` (entire repo root) in `upload-pages-artifact`. Rejected: publishes `specs/`, `.specify/`, and `tests/` unnecessarily and increases artifact upload time.

---

## Decision 5: Service worker scope and manifest start_url on GitHub Pages subpath

**Decision**: Make two targeted edits to align the PWA with the GitHub Pages subpath:

1. **`index.html`** — change SW registration from `{ scope: '/' }` to `{ scope: './' }`.
2. **`public/manifest.webmanifest`** — change `"start_url"` from `"/"` to `"./"`.

**Rationale**: GitHub Pages serves the app at `https://<org>.github.io/<repo>/`. The service worker file is at `…/<repo>/src/pwa/service-worker.js`. A SW registered with `scope: '/'` requests control over the entire origin root, but the browser enforces that a SW script can only control paths within its own directory or below — `scope: '/'` is *above* the script at `/rainbow-treats/src/pwa/`, so the browser silently rejects the registration. Using `scope: './'` resolves relative to the `index.html` location, giving a scope of `/<repo>/`, which is exactly right.

The `start_url: '/'` in the manifest causes the installed PWA to launch `https://<org>.github.io/` (the root of the origin), not the game. Using `'./'` makes it launch the correct subpath. Both `'./'` values work identically under local dev (`http://localhost:4173/`) because `index.html` is at the server root there.

**Alternatives considered**: Custom domain at the origin root, eliminating the subpath problem. Rejected: out of scope per spec assumptions.

---

## Decision 6: Concurrency strategy for parallel main-branch pushes

**Decision**: Add a `concurrency` block to `deploy.yml`:
```yaml
concurrency:
  group: pages
  cancel-in-progress: true
```

**Rationale**: If two commits land on `main` within seconds of each other, the first deploy run may still be installing dependencies when the second starts. Without concurrency control, both try to reach the `deploy` job. GitHub Pages serialises deployment API calls, but cancelling the stale run immediately frees the runner and ensures the latest commit is always what ends up live, rather than whichever run happens to finish last.

**Alternatives considered**: No concurrency control (let both runs complete). Rejected: wastes free-tier Actions minutes and risks deploying stale code if the first run (for an older commit) finishes after the second.

---

## Summary of resolved unknowns

| Unknown | Resolution |
|---------|------------|
| Pages source method | GitHub Actions (OIDC, `upload-pages-artifact` + `deploy-pages`) |
| Workflow structure | 2 files: `ci.yml` + `deploy.yml` |
| Test scope in CI | Unit tests only (Vitest) — Playwright out of scope for now |
| Deployment artifact | Staged subset: `index.html` + `src/` + `public/` + `.nojekyll` |
| SW scope on subpath | `scope: './'` in registration; `start_url: './'` in manifest |
| Concurrency | `cancel-in-progress: true` on `deploy.yml`, group `pages` |

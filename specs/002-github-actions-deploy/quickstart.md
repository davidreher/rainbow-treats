# Quickstart: GitHub Actions CI/CD and GitHub Pages Deployment

**Feature**: 002-github-actions-deploy  
**Audience**: Developer setting up CI/CD for the first time

## Prerequisites

- Repository is **public** on GitHub (required for free GitHub Pages and Actions).
- You have **admin access** to the repository settings.
- The `main` branch exists and contains the current game code.

---

## One-Time Setup Steps (Manual)

These steps are performed once in the GitHub web UI. After setup, all deployments are fully automatic.

### Step 1 — Enable GitHub Pages with GitHub Actions source

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Source**, select **GitHub Actions**.
4. Click **Save**.

> Do not select "Deploy from a branch." The `deploy.yml` workflow handles publishing.

### Step 2 — (Optional) Enable branch protection on `main`

To prevent merging PRs with failing tests:

1. Go to **Settings → Branches → Add branch ruleset** (or classic "Branch protection rules").
2. Target the `main` branch.
3. Check **Require status checks to pass before merging**.
4. Add the required check: **`CI / test`**.
5. Save the rule.

---

## What Happens Automatically After Setup

| Event | What the pipeline does |
|-------|----------------------|
| Push to any branch | `ci.yml` runs Vitest unit tests and posts the result |
| PR opened/updated targeting `main` | `ci.yml` runs and posts a status check on the PR |
| Merge (push) to `main` | `deploy.yml` runs tests, then deploys static files to GitHub Pages |
| Tests fail on `main` | `deploy.yml` stops; live site is unchanged |
| Two commits land on `main` quickly | Older in-progress run is cancelled; only the latest commit is deployed |

---

## Verifying a Deployment

1. After merging to `main`, open the repository's **Actions** tab.
2. Find the latest **Deploy** workflow run — it should show ✅ for both `test` and `deploy` jobs.
3. Open **Settings → Pages** — the published URL is displayed there (e.g., `https://<org>.github.io/rainbow-treats/`).
4. Click the URL and confirm the game loads.

---

## Service Worker and PWA Notes

The service worker registration in `index.html` uses `scope: './'` (relative), which resolves correctly at both:
- **Local dev**: `http://localhost:4173/` — scope is `/`
- **GitHub Pages**: `https://<org>.github.io/rainbow-treats/` — scope is `/rainbow-treats/`

The web app manifest uses `"start_url": "./"` for the same reason. When players install the PWA from GitHub Pages, it launches the correct subpath.

**Cache invalidation**: After a new deployment, browsers detect the updated service worker file (byte-change comparison) and schedule a SW update. Players see the new version on the next visit after closing all open tabs of the game.

---

## Local Developer Workflow (Unchanged)

The CI/CD feature does not change how you run the game locally:

```sh
# Start local dev server
npm run dev          # http://localhost:4173

# Run unit tests
npm run test:unit

# Run e2e tests (requires local server running)
npm run test:e2e
```

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---------|-------------|-----|
| Pages shows 404 after first push | GitHub Pages source not set to "GitHub Actions" | See Step 1 above |
| `Deploy / deploy` fails with permission error | Pages source is still set to "branch" not "Actions" | See Step 1 above |
| PWA not installable on Pages URL | `scope` or `start_url` still uses `'/'` (absolute) | Verify `index.html` SW registration uses `{ scope: './' }` and `manifest.webmanifest` has `"start_url": "./"` |
| Stale content served after deployment | Service worker serving cached version | Open DevTools → Application → Service Workers → click "Update" or do a hard reload (`Cmd+Shift+R`) |
| No status check appears on PRs | `ci.yml` has wrong `name:` field | Verify `name: CI` in `ci.yml` — GitHub formats the check as `<name> / <job id>` |

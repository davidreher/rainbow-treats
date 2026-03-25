# Feature Specification: GitHub Actions CI/CD and GitHub Pages Deployment

**Feature Branch**: `002-github-actions-deploy`  
**Created**: 2026-03-25  
**Status**: Draft  
**Input**: User description: "I want to add build and deployment through GitHub Actions and GitHub Pages."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automatic Deployment on Merge (Priority: P1)

A developer merges a pull request into the main branch. Within minutes, the updated game is live at the public GitHub Pages URL with no manual steps required.

**Why this priority**: This is the core value of the feature. Once automatic deployment works, the site is always in sync with the main branch, eliminating manual deployment toil and reducing the chance of the live site being out of date.

**Independent Test**: Can be fully tested by merging any code change to main and verifying the GitHub Pages URL reflects the change within 5 minutes.

**Acceptance Scenarios**:

1. **Given** a pull request has been merged to main, **When** the deployment pipeline completes, **Then** the updated game is accessible at the GitHub Pages URL without any manual action.
2. **Given** a deployment was triggered, **When** it completes successfully, **Then** the pipeline run is marked as passed in the repository's Actions tab.
3. **Given** a deployment was triggered, **When** it fails for any reason (e.g., test failure), **Then** the live site is NOT updated and the pipeline run is marked as failed with a clear error message.

---

### User Story 2 - Automated Test Gate on Pull Requests (Priority: P2)

A developer opens a pull request. The CI pipeline automatically runs the test suite and posts the result as a status check on the PR. The developer can see whether their changes pass tests before merging.

**Why this priority**: Tests must run on every PR to catch regressions before they reach main. This protects the deployment quality of User Story 1 and gives developers fast feedback.

**Independent Test**: Can be fully tested by opening a PR with a deliberate test failure and confirming the status check blocks (or warns) on the PR, then fixing the failure and confirming the check passes.

**Acceptance Scenarios**:

1. **Given** a pull request is opened or updated, **When** the CI pipeline runs, **Then** unit tests execute and their result is reported as a status check on the PR.
2. **Given** a pull request with failing unit tests, **When** the CI pipeline completes, **Then** the status check is marked failed and the PR cannot be merged via the standard merge button (assuming branch protection is configured).
3. **Given** a pull request with all tests passing, **When** the CI pipeline completes, **Then** the status check is marked passed and the PR is unblocked for merging.

---

### User Story 3 - Stable Public URL for Players (Priority: P3)

End users (players) access the game through a stable, memorable GitHub Pages URL. The URL does not change between deployments, and the game loads fully from that URL without any server-side processing.

**Why this priority**: Without a stable URL, the deployment pipeline has no visible end result for players. This story validates that the deployed output is a working game, not just a passing pipeline.

**Independent Test**: Can be fully tested by visiting the GitHub Pages URL in a browser after a successful deployment and confirming the game loads, is playable, and the PWA manifest/service worker register correctly.

**Acceptance Scenarios**:

1. **Given** a successful deployment, **When** a player visits the GitHub Pages URL, **Then** the game loads fully in the browser with no server errors.
2. **Given** the GitHub Pages URL, **When** accessed on a mobile viewport (≥ 375px wide), **Then** the game is fully playable without horizontal scrolling.
3. **Given** the game is loaded from GitHub Pages and the player installs the PWA, **When** the player launches the installed app offline, **Then** the game is playable using the cached assets.

---

### Constitution Alignment *(mandatory)*

- **Static assets only**: The pipeline copies the repository's existing static files (HTML, CSS, JS, images, icons, manifest, service worker) directly to GitHub Pages. No build step, server-side rendering, or compilation is required. GitHub Pages serves these files verbatim.
- **Local data / localStorage**: This feature introduces no new data storage. All existing game state (scores, progress, level) remains in `localStorage` on the player's device. The deployment pipeline does not touch or migrate local data. If `localStorage` is unavailable, existing game fallback behaviour applies.
- **Mobile-first**: Deployment does not affect the app's layout or interaction model. The smallest supported viewport (375px wide) is unchanged. The CI pipeline should validate on at least one mobile-emulated viewport.
- **PWA impact**: The service worker uses a versioned cache name. Deploying a new version of the service worker to GitHub Pages will prompt existing installed users to update on next visit. The pipeline must ensure the service worker file is included in the deployed output unchanged. No new PWA capabilities are added by this feature.
- **External dependencies**: No new runtime dependencies are introduced. The CI pipeline uses GitHub Actions (provided free for public repositories), Vitest (already in devDependencies), and Playwright (already in devDependencies). No additional npm packages are needed for deployment.

### Edge Cases

- **What happens when tests fail on main?** The deployment step must not run; the live site must remain at the last successfully deployed version.
- **What happens if a deployment is already in progress when a second push arrives?** The newer run should either queue or cancel and replace the in-progress run to avoid race conditions on the deployed output.
- **What happens when the GitHub Pages source branch (gh-pages) is first created?** The pipeline must initialise it correctly on the very first run, even when no prior deployment exists.
- **What happens if the repository is private and GitHub Pages requires a paid plan?** The spec assumes a public repository. Private repo Pages access is out of scope.
- **What happens to the service worker cache after a new deployment?** Players with a cached version will continue using cached assets until the updated service worker activates (on next visit + tab close). This is the existing behaviour and is not changed by this feature.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST automatically run the unit test suite on every push to any branch and on every pull request targeting main.
- **FR-002**: The system MUST automatically deploy the static game assets to GitHub Pages when all tests pass on the main branch.
- **FR-003**: The system MUST NOT deploy to GitHub Pages if any step in the pipeline (including tests) fails.
- **FR-004**: The system MUST report pipeline results as a visible status on pull requests so that authors and reviewers can see pass/fail without leaving the PR page.
- **FR-005**: The system MUST deploy all files needed to run the game: HTML entry point, CSS, JavaScript modules, icons, web app manifest, and service worker.
- **FR-006**: The deployed game MUST be accessible at a stable, publicly reachable URL without authentication.
- **FR-007**: The pipeline MUST complete (tests + deployment) within a time that keeps the feedback loop practical for developers.
- **FR-008**: The system MUST continue to serve the last successfully deployed version of the game while a new deployment is in progress or if a deployment fails.
- **FR-009**: The pipeline configuration MUST be stored in the repository as code (workflow files under version control) so changes to CI/CD are reviewed and auditable like any other code change.
- **FR-010**: The system MUST require no manual steps from a developer beyond merging a pull request into main for a deployment to occur.
- **FR-011**: The system MUST continue the primary user journey (playing the game) without requiring a backend or server-rendered response after the initial static asset load. GitHub Pages serves static files only; no server-side logic is introduced.
- **FR-012**: The system MUST NOT introduce any new runtime dependency that is not already present in the project's existing dependency list.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A merged pull request to main results in the updated game being live on GitHub Pages within 5 minutes of the merge completing, measured end-to-end.
- **SC-002**: 100% of pull requests to main receive an automated test status check before they can be merged (assuming branch protection rules are enabled).
- **SC-003**: A deliberate test failure introduced in a pull request causes the pipeline to fail and blocks deployment, with the failure visible on the PR within 3 minutes of the push.
- **SC-004**: The deployed game loads successfully in a browser on both desktop (≥ 1024px) and mobile (375px) viewports with no console errors related to missing assets.
- **SC-005**: The deployed game is installable as a PWA from the GitHub Pages URL, and the installed version is playable offline after the first load.
- **SC-006**: The pipeline configuration requires zero changes to run after initial setup — subsequent deployments are fully automated without developer intervention.
- **SC-007**: The full pipeline (unit tests + deployment) completes in under 4 minutes under normal conditions, keeping the feedback loop fast for developers.

## Assumptions

- The repository is hosted on GitHub (public visibility). GitHub Pages and GitHub Actions are available at no cost for public repositories.
- No bundler or compilation step is required. The project is served as plain static files, so the "build" step is simply copying the source files to the deployment output.
- The main branch is named `main`. The deployment pipeline triggers on pushes to `main`.
- Branch protection rules (requiring status checks to pass before merging) are configured separately by the repository owner and are not part of this feature's implementation scope.
- The existing unit tests (Vitest) and e2e tests (Playwright) are sufficiently stable to serve as the CI gate. Flaky tests that cause false failures are a pre-existing concern, not introduced by this feature.
- Node.js LTS (v22.x) is used in CI to match the local development environment.
- Playwright tests run in headless Chromium in CI. The existing offline e2e spec already handles the case where a service worker controller is unavailable and skips gracefully.
- The service worker cache name does not need to be auto-incremented by the pipeline. Cache invalidation relies on the service worker's existing update lifecycle (byte-change detection by the browser).
- No custom domain is configured. The game is served at the default GitHub Pages URL (`https://<org>.github.io/<repo>/`).
- The `public/` directory and root-level `index.html` together constitute the full deployable output. No files outside these locations need to be published.

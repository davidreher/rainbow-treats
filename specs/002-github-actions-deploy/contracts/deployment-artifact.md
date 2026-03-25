# Contract: Deployment Artifact Manifest

**Feature**: 002-github-actions-deploy  
**Audience**: Developers adding new files to the game; ops reviewing what is published to GitHub Pages

## Overview

Each deployment uploads a zip artifact (`github-pages`) containing the files listed below. GitHub Pages serves these files verbatim at `https://<org>.github.io/<repo>/`. The artifact is built by the `deploy.yml` workflow in a staging directory (`_site/`) before upload.

## Published File Manifest

| URL path on GitHub Pages | Source in repository | Mutated by pipeline? |
|--------------------------|---------------------|----------------------|
| `index.html` | `index.html` | No — copied as-is |
| `src/app/**` | `src/app/` | No |
| `src/components/**` | `src/components/` | No |
| `src/engine/**` | `src/engine/` | No |
| `src/pwa/**` | `src/pwa/` | No |
| `src/storage/**` | `src/storage/` | No |
| `src/styles/**` | `src/styles/` | No |
| `public/manifest.webmanifest` | `public/manifest.webmanifest` | No — copied as-is |
| `public/icons/**` | `public/icons/` | No |
| `.nojekyll` | Created by workflow | Yes — empty file, created at staging time |

## Files Explicitly Excluded from the Artifact

The following paths exist in the repository but are **not** published to GitHub Pages:

| Excluded path | Reason |
|--------------|--------|
| `.git/` | VCS internals, never published |
| `.github/` | CI/CD configuration, not a runtime asset |
| `.specify/` | Internal planning tooling |
| `specs/` | Feature specifications and plans |
| `tests/` | Test suite source files |
| `test-results/` | Playwright output directory |
| `node_modules/` | Dev/test dependencies, not shipped |
| `package.json`, `package-lock.json` | Node.js project config |
| `playwright.config.js` | Test runner config |

## Adding New Files to the Deployment

When a developer adds a new static asset to the game:

- Files placed under `src/`, `public/`, or in `index.html` are **automatically included** in the next deployment.
- Files placed anywhere else in the repository are **not published** unless the staging step in `deploy.yml` is updated to include the new path.
- If a new top-level directory is added (e.g., `assets/`), the `deploy.yml` staging step must be explicitly updated to copy it into `_site/`.

## Artifact Size Considerations

GitHub Pages has a published site size limit of 1 GB and a soft limit on individual artifact zip size. The current game assets are well within these limits. No action is required unless large binary assets (video, large fonts) are added in future features.

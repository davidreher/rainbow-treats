# Data Model: GitHub Actions CI/CD and GitHub Pages Deployment

**Phase**: 1 — Design  
**Feature**: 002-github-actions-deploy

## Overview

This feature introduces no new user-facing data entities and no changes to the game's existing data model (game state, level configuration, scores and progress stored in `localStorage`). The "entities" described here are CI/CD configuration concepts that define how the pipeline behaves.

---

## CI/CD Entities

### Workflow

Represents a GitHub Actions workflow file stored under `.github/workflows/`.

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Human-readable display name shown in the Actions UI |
| `on` | trigger object | Conditions that cause the workflow to start (events, branches, paths) |
| `permissions` | map | GitHub token permission scopes granted to jobs in the file |
| `concurrency` | object | Optional group key and cancel-in-progress flag |
| `jobs` | map | Named jobs that run in this workflow |

**Instances used in this feature**:
- `ci.yml` — triggers on `push` to all branches and `pull_request` to `main`; permissions: `contents: read`
- `deploy.yml` — triggers on `push` to `main` only; permissions: `contents: read`, `pages: write`, `id-token: write`; concurrency group: `pages`

---

### Job

A named unit of work within a workflow. Jobs run on a runner and consist of sequential steps.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier within the workflow (e.g., `test`, `deploy`) |
| `runs-on` | string | Runner image (always `ubuntu-latest` for this feature) |
| `needs` | string[] | Job IDs that must succeed before this job starts |
| `environment` | object | Named deployment environment (deploy job only: `github-pages`) |
| `outputs` | map | Values the job exposes to downstream jobs (e.g., Pages URL) |
| `steps` | Step[] | Ordered list of actions and shell commands |

**Instances**:
- `test` job (in both `ci.yml` and `deploy.yml`): checkout → setup Node.js → install deps → run unit tests
- `deploy` job (in `deploy.yml` only, `needs: test`): upload artifact → deploy to Pages

---

### Deployment Artifact

The set of files uploaded to GitHub Pages in a single deployment run.

| Field | Type | Description |
|-------|------|-------------|
| `path` | string | Local staging directory whose contents are zipped and uploaded |
| `name` | string | Artifact name registered with the GitHub Pages API (`github-pages`) |
| `contents` | file list | The files included in the artifact (see below) |

**Artifact contents** (staged under `_site/` by the workflow):

| Path in artifact | Source | Notes |
|-----------------|--------|-------|
| `index.html` | `index.html` (repo root) | Game entry point |
| `src/**` | `src/` (repo root) | JS modules, CSS, service worker |
| `public/**` | `public/` (repo root) | Web app manifest, icons |
| `.nojekyll` | Created by workflow | Prevents Jekyll processing on Pages |

---

### Deployment Environment

The GitHub concept that controls which branches can deploy and records deployment history.

| Field | Value |
|-------|-------|
| Name | `github-pages` |
| URL | `https://<org>.github.io/<repo>/` (set automatically by `deploy-pages`) |
| Protection | Only `main` branch can deploy (configured in repository settings) |
| Permission required | `pages: write` + `id-token: write` |

---

## Existing Data Model (unchanged)

The game's `localStorage` schema is not modified by this feature. For reference, the existing stored keys are:

| Key | Content | Owned by |
|-----|---------|----------|
| `sweetMatch_gameState` | Current board state, score, moves remaining | `storage/` module |
| `sweetMatch_levelProgress` | Highest completed level | `storage/` module |

No migration, versioning, or fallback changes are needed as part of this feature.

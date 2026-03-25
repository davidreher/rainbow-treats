# Contract: CI Status Check Names

**Feature**: 002-github-actions-deploy  
**Audience**: Repository maintainers configuring branch protection rules

## Overview

GitHub Actions reports each job as a named status check on pull requests. The check name is formatted as `<workflow name> / <job id>`. Branch protection rules must reference the exact check name.

## Status Checks Exposed by This Feature

| Check Name | Workflow File | Trigger | When It Runs |
|-----------|--------------|---------|-------------|
| `CI / test` | `.github/workflows/ci.yml` | `push` to any branch, `pull_request` to `main` | On every PR and every commit push |
| `Deploy / test` | `.github/workflows/deploy.yml` | `push` to `main` | Only when code reaches `main` |
| `Deploy / deploy` | `.github/workflows/deploy.yml` | `push` to `main` | Only after `Deploy / test` passes |

> **Note**: Workflow `name:` fields in the YAML files must match the names shown above for the check names to match. `ci.yml` must have `name: CI` and `deploy.yml` must have `name: Deploy`.

## Recommended Branch Protection Configuration

To enforce the CI gate before merging, configure the `main` branch protection rule to require:

- **Required status check**: `CI / test`  
  _(This is the check that runs on every PR — it is the appropriate merge gate.)_

The `Deploy / test` and `Deploy / deploy` checks do **not** need to be required status checks — they run on `main` after merge and are not available on PR branches.

## Failure Semantics

| Scenario | CI / test result | Deployment outcome |
|----------|-----------------|-------------------|
| PR with failing unit tests | ❌ Failed | No deployment (PR not on `main`) |
| Push to `main`, all tests pass | ✅ Passed | Deployment proceeds |
| Push to `main`, tests fail | ❌ Failed | `Deploy / deploy` job is skipped; live site unchanged |
| Push to `main`, deploy job fails | ✅ Passed (test), ❌ Failed (deploy) | Live site unchanged; retry by pushing a new commit |

# rainbow-treats Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-25

## Active Technologies
- JavaScript ES modules (game runtime); YAML (workflow configuration); Node.js v22.x LTS (CI runner) + `actions/checkout@v4`, `actions/setup-node@v4`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4` — all official GitHub-maintained actions; zero new npm packages (002-github-actions-deploy)
- No new storage. Existing `localStorage` usage unchanged. (002-github-actions-deploy)

- JavaScript (ES2022 modules), HTML5, CSS3 + Runtime: none; Validation: Vitest, Playwrigh (001-match-three-clone)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test && npm run lint

## Code Style

JavaScript (ES2022 modules), HTML5, CSS3: Follow standard conventions

## Recent Changes
- 002-github-actions-deploy: Added JavaScript ES modules (game runtime); YAML (workflow configuration); Node.js v22.x LTS (CI runner) + `actions/checkout@v4`, `actions/setup-node@v4`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4` — all official GitHub-maintained actions; zero new npm packages

- 001-match-three-clone: Added JavaScript (ES2022 modules), HTML5, CSS3 + Runtime: none; Validation: Vitest, Playwrigh

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

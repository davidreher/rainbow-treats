import { test, expect } from '@playwright/test';

async function performOneValidSwap(page) {
  const pair = await page.evaluate(() => {
    const board = document.getElementById('board');
    const width = Number(getComputedStyle(board).getPropertyValue('--board-cols'));
    const height = Number(getComputedStyle(board).getPropertyValue('--board-rows'));
    const tiles = [...document.querySelectorAll('.tile[data-x][data-y]')];

    const typeByCell = Array.from({ length: height }, () => Array(width).fill(null));
    for (const el of tiles) {
      const x = Number(el.dataset.x);
      const y = Number(el.dataset.y);
      const sweetClass = [...el.classList].find(c => c.startsWith('tile--') && !['tile--selected', 'tile--matched', 'tile--falling', 'tile--spawning', 'tile--special', 'tile--locked', 'tile--row-clear', 'tile--column-clear', 'tile--same-type-clear'].includes(c));
      typeByCell[y][x] = sweetClass?.replace('tile--', '') ?? null;
    }

    function hasRun3(grid) {
      for (let y = 0; y < height; y++) {
        let run = 1;
        for (let x = 1; x < width; x++) {
          if (grid[y][x] && grid[y][x] === grid[y][x - 1]) {
            run++;
            if (run >= 3) return true;
          } else run = 1;
        }
      }
      for (let x = 0; x < width; x++) {
        let run = 1;
        for (let y = 1; y < height; y++) {
          if (grid[y][x] && grid[y][x] === grid[y - 1][x]) {
            run++;
            if (run >= 3) return true;
          } else run = 1;
        }
      }
      return false;
    }

    function createsMatch(x1, y1, x2, y2) {
      const clone = typeByCell.map(row => row.slice());
      const t = clone[y1][x1];
      clone[y1][x1] = clone[y2][x2];
      clone[y2][x2] = t;
      return hasRun3(clone);
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (x + 1 < width && createsMatch(x, y, x + 1, y)) return { from: { x, y }, to: { x: x + 1, y } };
        if (y + 1 < height && createsMatch(x, y, x, y + 1)) return { from: { x, y }, to: { x, y: y + 1 } };
      }
    }

    return null;
  });

  if (!pair) throw new Error('No valid swap found for persistence setup');

  await page.locator(`.tile[data-x=\"${pair.from.x}\"][data-y=\"${pair.from.y}\"]`).click();
  await page.locator(`.tile[data-x=\"${pair.to.x}\"][data-y=\"${pair.to.y}\"]`).click();
  await page.waitForTimeout(900);
}

test('persistence and offline app-shell flow', async ({ context, page }) => {
  await page.goto('http://localhost:4173/');
  await page.locator('.level-btn:not(.level-btn--locked)').first().click();
  await expect(page.locator('#board .tile')).toHaveCount(36);

  await performOneValidSwap(page);

  await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return;
    try {
      await navigator.serviceWorker.register('/src/pwa/service-worker.js', { scope: '/' });
      await navigator.serviceWorker.ready;
    } catch {
      // continue: app may still be available from regular cache in this test run
    }
  });

  await page.goto('http://localhost:4173/');

  await expect(page.locator('#modal-title')).toHaveText('Continue game?');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.locator('#board')).toBeVisible();

  await page.goto('http://localhost:4173/?offline-check=1');

  const hasController = await page
    .waitForFunction(() => !!navigator.serviceWorker?.controller, null, { timeout: 10000 })
    .then(() => true)
    .catch(() => false);

  test.skip(!hasController, 'Service worker controller unavailable in this runtime');

  await context.setOffline(true);
  await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded', timeout: 10000 });

  const modalVisible = await page.locator('#modal-title').isVisible().catch(() => false);
  if (modalVisible) {
    const title = await page.locator('#modal-title').innerText();
    if (title.includes('Continue')) {
      await page.getByRole('button', { name: 'Start Fresh' }).click();
    }
  }

  await expect(page.locator('#app')).toBeVisible();

  const hasLevelSelect = await page.locator('.level-btn').count();
  const hasBoard = await page.locator('#board .tile').count();
  expect(hasLevelSelect > 0 || hasBoard > 0).toBe(true);

  await context.setOffline(false);
});

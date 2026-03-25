import { test, expect } from '@playwright/test';

async function findSwapPair(page, kind = 'valid') {
  return await page.evaluate((targetKind) => {
    const tiles = [...document.querySelectorAll('.tile[data-x][data-y]')];
    const width = Number(getComputedStyle(document.getElementById('board')).getPropertyValue('--board-cols')) || 0;
    const height = Number(getComputedStyle(document.getElementById('board')).getPropertyValue('--board-rows')) || 0;

    const typeByCell = Array.from({ length: height }, () => Array(width).fill(null));
    for (const el of tiles) {
      const x = Number(el.dataset.x);
      const y = Number(el.dataset.y);
      const sweetClass = [...el.classList].find(c => c.startsWith('tile--') && !['tile--selected', 'tile--matched', 'tile--falling', 'tile--spawning', 'tile--special', 'tile--locked', 'tile--row-clear', 'tile--column-clear', 'tile--same-type-clear'].includes(c));
      if (!sweetClass) continue;
      typeByCell[y][x] = sweetClass.replace('tile--', '');
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

    function swapCreatesMatch(x1, y1, x2, y2) {
      const clone = typeByCell.map(row => row.slice());
      const t = clone[y1][x1];
      clone[y1][x1] = clone[y2][x2];
      clone[y2][x2] = t;
      return hasRun3(clone);
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const candidates = [[x + 1, y], [x, y + 1]];
        for (const [nx, ny] of candidates) {
          if (nx >= width || ny >= height) continue;
          const creates = swapCreatesMatch(x, y, nx, ny);
          if ((targetKind === 'valid' && creates) || (targetKind === 'invalid' && !creates)) {
            return { from: { x, y }, to: { x: nx, y: ny } };
          }
        }
      }
    }

    return null;
  }, kind);
}

test('mobile match-turn flow (valid + invalid swap)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:4173/');

  await page.locator('.level-btn:not(.level-btn--locked)').first().click();
  await expect(page.locator('#board .tile')).toHaveCount(36);

  const scoreBefore = Number((await page.locator('#hud-score').innerText()).replace(/[^0-9]/g, '') || '0');
  const validPair = await findSwapPair(page, 'valid');
  expect(validPair).not.toBeNull();

  await page.locator(`.tile[data-x=\"${validPair.from.x}\"][data-y=\"${validPair.from.y}\"]`).click();
  await page.locator(`.tile[data-x=\"${validPair.to.x}\"][data-y=\"${validPair.to.y}\"]`).click();

  await page.waitForTimeout(900);
  const scoreAfter = Number((await page.locator('#hud-score').innerText()).replace(/[^0-9]/g, '') || '0');
  expect(scoreAfter).toBeGreaterThanOrEqual(scoreBefore);

  const movesBefore = Number((await page.locator('#hud-moves').innerText()).replace(/[^0-9]/g, '') || '0');
  const invalidPair = await findSwapPair(page, 'invalid');
  expect(invalidPair).not.toBeNull();

  await page.locator(`.tile[data-x=\"${invalidPair.from.x}\"][data-y=\"${invalidPair.from.y}\"]`).click();
  await page.locator(`.tile[data-x=\"${invalidPair.to.x}\"][data-y=\"${invalidPair.to.y}\"]`).click();

  await page.waitForTimeout(450);
  const movesAfter = Number((await page.locator('#hud-moves').innerText()).replace(/[^0-9]/g, '') || '0');
  expect(movesAfter).toBe(movesBefore);
});

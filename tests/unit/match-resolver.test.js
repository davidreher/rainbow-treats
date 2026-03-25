import { describe, it, expect } from 'vitest';
import { findMatches } from '../../src/engine/match-resolver.js';
import { TileState, SpecialType } from '../../src/engine/types.js';

const TYPE = {
  A: 'strawberry',
  B: 'lemon',
  C: 'mint',
  D: 'grape',
  E: 'blueberry',
};

function boardFromRows(rows) {
  const height = rows.length;
  const width = rows[0].length;
  const tiles = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      tiles.push({
        id: `t-${x}-${y}`,
        x,
        y,
        sweetType: TYPE[rows[y][x]],
        specialType: SpecialType.NONE,
        state: TileState.RESTING,
      });
    }
  }

  return { width, height, tiles, score: 0, movesLeft: 10, status: 'idle', pendingEffects: [], comboChain: 0 };
}

describe('match resolver', () => {
  it('detects row match and clears only contiguous run cells', () => {
    const board = boardFromRows([
      'BCDEA',
      'AAABA',
      'CDEBC',
      'DEBCD',
      'EBCDE',
    ]);

    const groups = findMatches(board);
    const rowGroup = groups.find(group => group.axis === 'row' && group.matchedSweetType === 'strawberry');

    expect(rowGroup).toBeTruthy();
    expect(rowGroup.clearedCount).toBe(3);
    expect(rowGroup.awardsSpecial).toBe(false);
  });

  it('detects column match and clears only contiguous run cells', () => {
    const board = boardFromRows([
      'ABCDE',
      'AACDE',
      'AACDE',
      'BACDE',
      'EBCDE',
    ]);

    const groups = findMatches(board);
    const colGroup = groups.find(group => group.axis === 'column' && group.matchedSweetType === 'strawberry');

    expect(colGroup).toBeTruthy();
    expect(colGroup.clearedCount).toBe(3);
  });

  it('detects simultaneous cross-axis matches in one pass', () => {
    const board = boardFromRows([
      'BCDDB',
      'DAAAD',
      'BCADB',
      'DEADB',
      'BCDEA',
    ]);

    const groups = findMatches(board);
    expect(groups.some(group => group.axis === 'row' && group.matchedSweetType === 'strawberry')).toBe(true);
    expect(groups.some(group => group.axis === 'column' && group.matchedSweetType === 'strawberry')).toBe(true);
  });

  it('keeps exactly-three clear groups without awarding special', () => {
    const board = boardFromRows([
      'BCDEA',
      'AAABC',
      'CDEBC',
      'DEBCD',
      'EBCDE',
    ]);

    const groups = findMatches(board);
    const g = groups.find(group => group.axis === 'row' && group.matchedSweetType === 'strawberry');

    expect(g).toBeTruthy();
    expect(g.clearedCount).toBe(3);
    expect(g.awardsSpecial).toBe(false);
  });

  it('awards special for five-or-more clears', () => {
    const board = boardFromRows([
      'BCDEA',
      'AAAAA',
      'CDEBC',
      'DEBCD',
      'EBCDE',
    ]);

    const groups = findMatches(board);
    const g = groups.find(group => group.axis === 'row' && group.matchedSweetType === 'strawberry');

    expect(g).toBeTruthy();
    expect(g.clearedCount).toBe(5);
    expect(g.awardsSpecial).toBe(true);
    expect(g.awardedSpecialType).toBe('row-clear');
  });

  it('returns no groups for board with no qualifying runs', () => {
    const board = boardFromRows([
      'ABCDE',
      'BCDEA',
      'CDEAB',
      'DEABC',
      'EABCD',
    ]);

    const groups = findMatches(board);
    expect(groups).toHaveLength(0);
  });

  it('handles multiple separated runs of same type in one row as separate groups', () => {
    const board = boardFromRows([
      'AAABAAA',
      'BCDEBCD',
      'CDEBCDE',
      'DEBCDEB',
      'EBCDEBC',
    ]);

    const groups = findMatches(board).filter(group => group.axis === 'row' && group.matchedSweetType === 'strawberry');
    expect(groups).toHaveLength(2);
    expect(groups.every(group => group.clearedCount === 3)).toBe(true);
  });
});

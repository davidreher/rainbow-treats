import { describe, it, expect } from 'vitest';
import { calculateScore } from '../../src/engine/scoring.js';
import { applyRowClear, applyColumnClear, applySameTypeClear } from '../../src/engine/special-sweets.js';
import { TileState, SpecialType } from '../../src/engine/types.js';

function tile(id, x, y, sweetType, specialType = SpecialType.NONE) {
  return { id, x, y, sweetType, specialType, state: TileState.RESTING };
}

function makeBoard(width, height, tiles) {
  return { width, height, tiles, score: 0, movesLeft: 20, status: 'idle', pendingEffects: [], comboChain: 0 };
}

describe('scoring and special sweet effects', () => {
  it('calculates base points from cleared count', () => {
    const score = calculateScore([{ clearedCount: 4 }, { clearedCount: 3 }], 0);
    expect(score).toBe(350);
  });

  it('applies cascade multiplier', () => {
    const base = calculateScore([{ clearedCount: 6 }], 0);
    const combo = calculateScore([{ clearedCount: 6 }], 2);
    expect(base).toBe(300);
    expect(combo).toBe(600);
  });

  it('row-clear effect clears all cells in target row', () => {
    const board = makeBoard(4, 3, [
      tile('a', 0, 0, 'strawberry'), tile('b', 1, 0, 'lemon'), tile('c', 2, 0, 'mint'), tile('d', 3, 0, 'grape'),
      tile('e', 0, 1, 'strawberry', 'row-clear'), tile('f', 1, 1, 'lemon'), tile('g', 2, 1, 'mint'), tile('h', 3, 1, 'grape'),
      tile('i', 0, 2, 'strawberry'), tile('j', 1, 2, 'lemon'), tile('k', 2, 2, 'mint'), tile('l', 3, 2, 'grape'),
    ]);

    const { board: next, effects } = applyRowClear(board, board.tiles[4]);
    const consumed = next.tiles.filter(t => t.state === TileState.CONSUMED);

    expect(consumed).toHaveLength(4);
    expect(effects[0].payload.clearedCells).toHaveLength(4);
  });

  it('column-clear effect clears all cells in target column', () => {
    const board = makeBoard(3, 4, [
      tile('a', 0, 0, 'strawberry'), tile('b', 1, 0, 'lemon', 'column-clear'), tile('c', 2, 0, 'mint'),
      tile('d', 0, 1, 'grape'), tile('e', 1, 1, 'orange'), tile('f', 2, 1, 'cream'),
      tile('g', 0, 2, 'strawberry'), tile('h', 1, 2, 'lemon'), tile('i', 2, 2, 'mint'),
      tile('j', 0, 3, 'grape'), tile('k', 1, 3, 'orange'), tile('l', 2, 3, 'cream'),
    ]);

    const { board: next, effects } = applyColumnClear(board, board.tiles[1]);
    const consumed = next.tiles.filter(t => t.state === TileState.CONSUMED);

    expect(consumed).toHaveLength(4);
    expect(effects[0].payload.clearedCells).toHaveLength(4);
  });

  it('same-type-clear effect clears all matching sweet types', () => {
    const board = makeBoard(3, 3, [
      tile('a', 0, 0, 'strawberry', 'same-type-clear'), tile('b', 1, 0, 'lemon'), tile('c', 2, 0, 'mint'),
      tile('d', 0, 1, 'strawberry'), tile('e', 1, 1, 'orange'), tile('f', 2, 1, 'strawberry'),
      tile('g', 0, 2, 'cream'), tile('h', 1, 2, 'lemon'), tile('i', 2, 2, 'strawberry'),
    ]);

    const { board: next, effects } = applySameTypeClear(board, board.tiles[0]);
    const consumed = next.tiles.filter(t => t.state === TileState.CONSUMED);

    expect(consumed).toHaveLength(4);
    expect(effects[0].payload.clearedCells).toHaveLength(4);
  });
});

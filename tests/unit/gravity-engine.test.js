import { describe, it, expect } from 'vitest';
import { applyGravity } from '../../src/engine/gravity-engine.js';
import { TileState, SpecialType } from '../../src/engine/types.js';

function makeTile(id, x, y, sweetType, state = TileState.RESTING) {
  return { id, x, y, sweetType, specialType: SpecialType.NONE, state };
}

function board(width, height, tiles) {
  return { width, height, tiles, score: 0, movesLeft: 10, status: 'refilling', pendingEffects: [], comboChain: 0 };
}

describe('gravity engine', () => {
  const pool = ['strawberry', 'lemon', 'mint'];

  it('fills a single gap with one spawned tile', () => {
    const tiles = [
      makeTile('a', 0, 0, 'strawberry'),
      makeTile('b', 1, 0, 'lemon'),
      makeTile('c', 0, 1, 'mint', TileState.CONSUMED),
      makeTile('d', 1, 1, 'strawberry'),
      makeTile('e', 0, 2, 'lemon'),
      makeTile('f', 1, 2, 'mint'),
    ];

    const out = applyGravity(board(2, 3, tiles), pool);
    const spawning = out.tiles.filter(tile => tile.state === TileState.SPAWNING);

    expect(out.tiles).toHaveLength(6);
    expect(spawning).toHaveLength(1);
    expect(out.tiles.filter(tile => tile.state === TileState.CONSUMED)).toHaveLength(0);
  });

  it('handles multi-gap columns and keeps board full', () => {
    const tiles = [
      makeTile('a', 0, 0, 'strawberry', TileState.CONSUMED),
      makeTile('b', 1, 0, 'lemon'),
      makeTile('c', 0, 1, 'mint', TileState.CONSUMED),
      makeTile('d', 1, 1, 'strawberry'),
      makeTile('e', 0, 2, 'lemon'),
      makeTile('f', 1, 2, 'mint'),
      makeTile('g', 0, 3, 'grape'),
      makeTile('h', 1, 3, 'blueberry'),
    ];

    const out = applyGravity(board(2, 4, tiles), pool);

    expect(out.tiles).toHaveLength(8);
    expect(out.tiles.filter(tile => tile.state === TileState.SPAWNING)).toHaveLength(2);
    expect(out.tiles.filter(tile => tile.state === TileState.CONSUMED)).toHaveLength(0);
  });

  it('fills a full-column gap with spawns only', () => {
    const tiles = [
      makeTile('a', 0, 0, 'strawberry', TileState.CONSUMED),
      makeTile('b', 1, 0, 'lemon'),
      makeTile('c', 0, 1, 'mint', TileState.CONSUMED),
      makeTile('d', 1, 1, 'strawberry'),
      makeTile('e', 0, 2, 'lemon', TileState.CONSUMED),
      makeTile('f', 1, 2, 'mint'),
    ];

    const out = applyGravity(board(2, 3, tiles), pool);
    const col0 = out.tiles.filter(tile => tile.x === 0);

    expect(col0.every(tile => tile.state === TileState.SPAWNING)).toBe(true);
    expect(col0).toHaveLength(3);
  });

  it('spawns exactly the number of consumed gaps', () => {
    const tiles = [
      makeTile('a', 0, 0, 'strawberry', TileState.CONSUMED),
      makeTile('b', 1, 0, 'lemon', TileState.CONSUMED),
      makeTile('c', 0, 1, 'mint', TileState.CONSUMED),
      makeTile('d', 1, 1, 'strawberry'),
    ];

    const consumedCount = tiles.filter(tile => tile.state === TileState.CONSUMED).length;
    const out = applyGravity(board(2, 2, tiles), pool);

    expect(out.tiles.filter(tile => tile.state === TileState.SPAWNING)).toHaveLength(consumedCount);
  });
});

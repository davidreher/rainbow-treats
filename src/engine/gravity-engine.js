/**
 * gravity-engine.js — Applies downward gravity to a board after tile clears.
 *
 * Algorithm (column by column):
 *   1. Scan bottom-to-top; collect non-consumed tiles preserving order.
 *   2. Pack them back to the BOTTOM of the column (gravity-down).
 *   3. Fill remaining top slots with newly spawned tiles.
 *
 * Tile states after this pass:
 *   - Tiles that moved to a lower y:  TileState.FALLING
 *   - Tiles that did not move:        TileState.RESTING
 *   - Newly introduced tiles:         TileState.SPAWNING
 */

import { TileState } from './types.js';
import { spawnTile } from './board-generator.js';

/**
 * Apply gravity and tile spawn to a BoardState containing consumed tiles.
 *
 * @param {object} boardState — BoardState with some tiles in 'consumed' state
 * @param {string[]} pool — sweet type pool for the active level
 * @returns {object} new BoardState with tiles shifted down and gaps filled
 */
export function applyGravity(boardState, pool) {
  const { width, height, tiles } = boardState;
  const result = new Array(width * height);

  for (let x = 0; x < width; x++) {
    // Scan bottom-to-top, collect surviving (non-consumed) tiles
    const surviving = [];
    for (let y = height - 1; y >= 0; y--) {
      const tile = tiles[y * width + x];
      if (tile.state !== TileState.CONSUMED) {
        surviving.push(tile); // collected bottom-to-top
      }
    }

    const gaps = height - surviving.length;

    // Pack surviving tiles to the bottom (write from y = height-1 upward)
    for (let i = 0; i < surviving.length; i++) {
      const newY = height - 1 - i;
      const orig = surviving[i];
      result[newY * width + x] = {
        ...orig,
        y: newY,
        state: orig.y !== newY ? TileState.FALLING : TileState.RESTING,
      };
    }

    // Fill the top gaps with spawned tiles
    for (let i = 0; i < gaps; i++) {
      const newY = i;
      result[newY * width + x] = {
        ...spawnTile(x, newY, pool),
        state: TileState.SPAWNING,
      };
    }
  }

  return { ...boardState, tiles: result, pendingEffects: [] };
}

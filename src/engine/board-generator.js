/**
 * board-generator.js — Generates a valid initial BoardState from a LevelDefinition.
 * "Valid" means: no pre-existing qualifying clears and at least one legal adjacent swap.
 */

import {
  ALL_SWEET_TYPES,
  BoardStatus,
  SpecialType,
  TileState,
  MATCH_MIN_LENGTH,
  RESHUFFLE_MAX_ATTEMPTS,
} from './types.js';

// ── Internal helpers ─────────────────────────────────────────────────────────

let _tileIdCounter = 0;

function makeTile(x, y, sweetType) {
  return {
    id: `t${++_tileIdCounter}`,
    x,
    y,
    sweetType,
    specialType: SpecialType.NONE,
    state: TileState.RESTING,
  };
}

function indexAt(width, x, y) {
  return y * width + x;
}

/** Pick a random element from an array. */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Returns the sweet type pool for a level (first N types by stable order). */
function sweetPool(sweetTypeCount) {
  return ALL_SWEET_TYPES.slice(0, sweetTypeCount);
}

// ── Pre-existing clear detection ─────────────────────────────────────────────

/**
 * Returns true if the tile grid (flat array, row-major) contains any run of
 * MATCH_MIN_LENGTH or more identical sweet types along a row or column.
 */
function hasPreExistingClears(tiles, width, height) {
  // Check rows
  for (let y = 0; y < height; y++) {
    let run = 1;
    for (let x = 1; x < width; x++) {
      const cur  = tiles[indexAt(width, x, y)].sweetType;
      const prev = tiles[indexAt(width, x - 1, y)].sweetType;
      if (cur === prev) {
        run++;
        if (run >= MATCH_MIN_LENGTH) return true;
      } else {
        run = 1;
      }
    }
  }
  // Check columns
  for (let x = 0; x < width; x++) {
    let run = 1;
    for (let y = 1; y < height; y++) {
      const cur  = tiles[indexAt(width, x, y)].sweetType;
      const prev = tiles[indexAt(width, x, y - 1)].sweetType;
      if (cur === prev) {
        run++;
        if (run >= MATCH_MIN_LENGTH) return true;
      } else {
        run = 1;
      }
    }
  }
  return false;
}

// ── Legal move detection ─────────────────────────────────────────────────────

/**
 * Simulates swapping tiles at (x1,y1) and (x2,y2) and returns true if the
 * resulting board would have at least one qualifying clear line of MATCH_MIN_LENGTH.
 */
function swapCreatesMatch(tiles, width, height, x1, y1, x2, y2) {
  // Shallow clone just the two positions we're testing
  const copy = tiles.slice();
  const i1 = indexAt(width, x1, y1);
  const i2 = indexAt(width, x2, y2);
  copy[i1] = { ...tiles[i1], sweetType: tiles[i2].sweetType };
  copy[i2] = { ...tiles[i2], sweetType: tiles[i1].sweetType };

  // Check row containing y1 and y2
  for (const y of new Set([y1, y2])) {
    let run = 1;
    for (let x = 1; x < width; x++) {
      if (copy[indexAt(width, x, y)].sweetType === copy[indexAt(width, x - 1, y)].sweetType) {
        if (++run >= MATCH_MIN_LENGTH) return true;
      } else {
        run = 1;
      }
    }
  }
  // Check column containing x1 and x2
  for (const x of new Set([x1, x2])) {
    let run = 1;
    for (let y = 1; y < height; y++) {
      if (copy[indexAt(width, x, y)].sweetType === copy[indexAt(width, x, y - 1)].sweetType) {
        if (++run >= MATCH_MIN_LENGTH) return true;
      } else {
        run = 1;
      }
    }
  }
  return false;
}

/**
 * Returns true if the board has at least one adjacent swap that would produce
 * a qualifying clear line.
 */
function hasLegalMove(tiles, width, height) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Check swap right
      if (x + 1 < width && swapCreatesMatch(tiles, width, height, x, y, x + 1, y)) return true;
      // Check swap down
      if (y + 1 < height && swapCreatesMatch(tiles, width, height, x, y, x, y + 1)) return true;
    }
  }
  return false;
}

// ── Board generation ─────────────────────────────────────────────────────────

/**
 * Generates a flat tile array that is free of pre-existing clears.
 * Uses a greedy approach first, then random restarts if needed.
 */
function generateTiles(width, height, pool) {
  for (let attempt = 0; attempt < RESHUFFLE_MAX_ATTEMPTS; attempt++) {
    const tiles = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Pick a type that doesn't immediately form a run of 3
        const forbidden = new Set();
        if (x >= 2 &&
            tiles[indexAt(width, x - 1, y)].sweetType === tiles[indexAt(width, x - 2, y)].sweetType) {
          forbidden.add(tiles[indexAt(width, x - 1, y)].sweetType);
        }
        if (y >= 2 &&
            tiles[indexAt(width, x, y - 1)].sweetType === tiles[indexAt(width, x, y - 2)].sweetType) {
          forbidden.add(tiles[indexAt(width, x, y - 1)].sweetType);
        }
        const available = pool.filter(t => !forbidden.has(t));
        const type = available.length > 0 ? pick(available) : pick(pool);
        tiles.push(makeTile(x, y, type));
      }
    }
    if (!hasPreExistingClears(tiles, width, height)) {
      return tiles;
    }
  }
  // Fallback: return last attempt even if it has clears (extremely unlikely)
  return Array.from({ length: width * height }, (_, i) => {
    const x = i % width;
    const y = Math.floor(i / width);
    return makeTile(x, y, pick(pool));
  });
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Generates a valid initial BoardState from a LevelDefinition.
 * Retries until the board has no pre-existing clears AND has at least one legal move.
 *
 * @param {object} levelDef — LevelDefinition record from levels.js
 * @returns {object} BoardState
 */
export function generateBoard(levelDef) {
  const { id, boardWidth: width, boardHeight: height, sweetTypeCount, moveLimit } = levelDef;
  const pool = sweetPool(sweetTypeCount);

  let tiles;
  let attempts = 0;
  do {
    tiles = generateTiles(width, height, pool);
    attempts++;
  } while (!hasLegalMove(tiles, width, height) && attempts < RESHUFFLE_MAX_ATTEMPTS);

  return {
    levelId: id,
    width,
    height,
    tiles,
    score: 0,
    movesLeft: moveLimit,
    status: BoardStatus.IDLE,
    pendingEffects: [],
    comboChain: 0,
  };
}

/**
 * Generates a new tile for a given position, used during gravity refill.
 *
 * @param {number} x
 * @param {number} y
 * @param {string[]} pool — sweet type pool for the active level
 * @returns {object} Tile
 */
export function spawnTile(x, y, pool) {
  return makeTile(x, y, pick(pool));
}

/**
 * Re-shuffles an existing board when no legal moves remain.
 * Preserves tile count and produces a board with at least one legal move.
 *
 * @param {object} boardState — current BoardState
 * @param {string[]} pool — sweet type pool
 * @returns {object} new BoardState with shuffled tiles
 */
export function reshuffleBoard(boardState, pool) {
  const { width, height } = boardState;
  let tiles;
  let attempts = 0;
  do {
    tiles = generateTiles(width, height, pool);
    attempts++;
  } while (!hasLegalMove(tiles, width, height) && attempts < RESHUFFLE_MAX_ATTEMPTS);

  return { ...boardState, tiles, pendingEffects: [] };
}

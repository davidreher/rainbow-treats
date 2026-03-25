/**
 * match-resolver.js — Detects qualifying clears from a BoardState.
 *
 * Clearing rule:
 *   A run of ≥ MATCH_MIN_LENGTH same sweet type in a row or column clears
 *   only the ADJACENT cells in that run.
 *
 * Returns one MatchGroup per contiguous run.
 */

import {
  MatchAxis,
  SpecialType,
  MATCH_MIN_LENGTH,
  SPECIAL_REWARD_THRESHOLD,
} from './types.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

function idx(width, x, y) {
  return y * width + x;
}

/**
 * Determine which special type to award based on cleared count and axis.
 * Row/column specials for 5-8 clears; same-type special for 9+ (full 8-wide line).
 */
function specialTypeFor(axis, clearedCount) {
  if (clearedCount >= 9) return SpecialType.SAME_TYPE_CLEAR;
  if (axis === MatchAxis.ROW) return SpecialType.ROW_CLEAR;
  return SpecialType.COLUMN_CLEAR;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Find all qualifying MatchGroups in the current BoardState.
 *
 * Each MatchGroup represents one (axis, sweetType, line-index) combination
 * where a run of ≥ MATCH_MIN_LENGTH exists. The `clearedCells` contain ALL
 * positions in that line sharing the same sweet type, not just the run.
 *
 * @param {object} boardState — live BoardState
 * @returns {Array<object>} ordered list of MatchGroup objects
 */
export function findMatches(boardState) {
  const { tiles, width, height } = boardState;
  const groups = [];

  // ── Row sweeps ────────────────────────────────────────────────────────────
  for (let y = 0; y < height; y++) {
    let runStart = 0;
    for (let x = 1; x <= width; x++) {
      const sameAsPrev =
        x < width &&
        tiles[idx(width, x, y)].sweetType === tiles[idx(width, runStart, y)].sweetType;

      if (!sameAsPrev) {
        const runLen = x - runStart;
        if (runLen >= MATCH_MIN_LENGTH) {
          const type = tiles[idx(width, runStart, y)].sweetType;

          const anchorCells = [];
          for (let ax = runStart; ax < x; ax++) anchorCells.push({ x: ax, y });

          const clearedCells = anchorCells.slice();
          const clearedCount = clearedCells.length;
          const awardsSpecial = clearedCount >= SPECIAL_REWARD_THRESHOLD;
          groups.push({
            axis: MatchAxis.ROW,
            matchedSweetType: type,
            anchorCells,
            clearedCells,
            clearedCount,
            awardsSpecial,
            awardedSpecialType: awardsSpecial
              ? specialTypeFor(MatchAxis.ROW, clearedCount)
              : null,
          });
        }
        runStart = x;
      }
    }
  }

  // ── Column sweeps ─────────────────────────────────────────────────────────
  for (let x = 0; x < width; x++) {
    let runStart = 0;
    for (let y = 1; y <= height; y++) {
      const sameAsPrev =
        y < height &&
        tiles[idx(width, x, y)].sweetType === tiles[idx(width, x, runStart)].sweetType;

      if (!sameAsPrev) {
        const runLen = y - runStart;
        if (runLen >= MATCH_MIN_LENGTH) {
          const type = tiles[idx(width, x, runStart)].sweetType;

          const anchorCells = [];
          for (let ay = runStart; ay < y; ay++) anchorCells.push({ x, y: ay });

          const clearedCells = anchorCells.slice();
          const clearedCount = clearedCells.length;
          const awardsSpecial = clearedCount >= SPECIAL_REWARD_THRESHOLD;
          groups.push({
            axis: MatchAxis.COLUMN,
            matchedSweetType: type,
            anchorCells,
            clearedCells,
            clearedCount,
            awardsSpecial,
            awardedSpecialType: awardsSpecial
              ? specialTypeFor(MatchAxis.COLUMN, clearedCount)
              : null,
          });
        }
        runStart = y;
      }
    }
  }

  return groups;
}

/**
 * Mark tiles identified by MatchGroups as 'consumed' and return a new BoardState.
 * Deduplicates to ensure each position is consumed only once.
 *
 * @param {object} boardState
 * @param {Array<object>} matchGroups
 * @returns {object} new BoardState
 */
export function applyMatches(boardState, matchGroups) {
  const { width } = boardState;
  const consumed = new Set();

  for (const group of matchGroups) {
    for (const { x, y } of group.clearedCells) {
      consumed.add(idx(width, x, y));
    }
  }

  const tiles = boardState.tiles.map((tile, i) =>
    consumed.has(i) ? { ...tile, state: 'consumed' } : tile
  );

  return { ...boardState, tiles };
}

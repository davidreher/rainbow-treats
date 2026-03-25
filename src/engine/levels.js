/**
 * levels.js — Level definitions for Sweet Match Puzzle PWA.
 *
 * Phase 3 stub: contains levels 1-10 (intro tier) so bootstrap.js can run.
 * Phase 4 (T021) will expand this to all 50 levels.
 *
 * Difficulty bands (per data-model.md):
 *   intro (1–10):  6×6 board, 4 sweet types, 25 moves, targets 500–1 500
 *   mid   (11–30): 8×8 board, 5-6 types, 20→15 moves, targets 2 000–4 000
 *   late  (31–50): 8×8 board, 6-7 types, 14→10 moves, targets 4 500–6 500
 */

import { DifficultyTier } from './types.js';

// ── Helper: linearly interpolate between two values over n steps ──────────────
function lerp(a, b, n, i) {
  return Math.round(a + ((b - a) * i) / (n - 1));
}

// ── Intro tier: levels 1–10 ───────────────────────────────────────────────────
const INTRO = Array.from({ length: 10 }, (_, i) => ({
  id:                    i + 1,
  name:                  `Level ${i + 1}`,
  boardWidth:            6,
  boardHeight:           6,
  sweetTypeCount:        4,
  targetScore:           lerp(500, 1500, 10, i),
  moveLimit:             25,
  difficultyTier:        DifficultyTier.INTRO,
  specialRewardThreshold: 5,
}));

// ── Mid tier: levels 11–30 ────────────────────────────────────────────────────
const MID = Array.from({ length: 20 }, (_, i) => ({
  id:                    i + 11,
  name:                  `Level ${i + 11}`,
  boardWidth:            8,
  boardHeight:           8,
  sweetTypeCount:        i < 10 ? 5 : 6,
  targetScore:           lerp(2000, 4000, 20, i),
  moveLimit:             lerp(20, 15, 20, i),
  difficultyTier:        DifficultyTier.MID,
  specialRewardThreshold: 5,
}));

// ── Late tier: levels 31–50 ───────────────────────────────────────────────────
const LATE = Array.from({ length: 20 }, (_, i) => ({
  id:                    i + 31,
  name:                  `Level ${i + 31}`,
  boardWidth:            8,
  boardHeight:           8,
  sweetTypeCount:        i < 10 ? 6 : 7,
  targetScore:           lerp(4500, 6500, 20, i),
  moveLimit:             lerp(14, 10, 20, i),
  difficultyTier:        DifficultyTier.LATE,
  specialRewardThreshold: 5,
}));

/** All 50 level definitions in progression order. */
export const LEVELS = [...INTRO, ...MID, ...LATE];

/**
 * Get a single level definition by 1-based ID.
 * @param {number} id
 * @returns {object} LevelDefinition
 */
export function getLevel(id) {
  const level = LEVELS.find(l => l.id === id);
  if (!level) throw new RangeError(`Level ${id} not found`);
  return level;
}

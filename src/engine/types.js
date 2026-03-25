/**
 * types.js — Game-wide constants and pure data type definitions.
 * No framework, no dependencies. ES2022 module.
 */

// ── Sweet type enum ──────────────────────────────────────────────────────────
export const SweetType = Object.freeze({
  STRAWBERRY: 'strawberry',
  LEMON:      'lemon',
  MINT:       'mint',
  GRAPE:      'grape',
  BLUEBERRY:  'blueberry',
  ORANGE:     'orange',
  CREAM:      'cream',
});

/** All sweet type values in a stable order (used for indexed pool slicing). */
export const ALL_SWEET_TYPES = Object.values(SweetType);

// ── Tile state enum ──────────────────────────────────────────────────────────
export const TileState = Object.freeze({
  RESTING:  'resting',
  SELECTED: 'selected',
  MATCHED:  'matched',
  FALLING:  'falling',
  SPAWNING: 'spawning',
  CONSUMED: 'consumed',
});

// ── Special sweet type enum ──────────────────────────────────────────────────
export const SpecialType = Object.freeze({
  NONE:           'none',
  ROW_CLEAR:      'row-clear',
  COLUMN_CLEAR:   'column-clear',
  SAME_TYPE_CLEAR: 'same-type-clear',
});

// ── Board status enum ────────────────────────────────────────────────────────
export const BoardStatus = Object.freeze({
  IDLE:       'idle',
  SWAPPING:   'swapping',
  RESOLVING:  'resolving',
  REFILLING:  'refilling',
  WON:        'won',
  LOST:       'lost',
});

// ── Resolution effect type enum ──────────────────────────────────────────────
export const EffectType = Object.freeze({
  CLEAR:        'clear',
  SPECIAL_CLEAR: 'special-clear',
  GRAVITY:      'gravity',
  SPAWN:        'spawn',
  SCORE:        'score',
  RESHUFFLE:    'reshuffle',
});

// ── Match axis enum ──────────────────────────────────────────────────────────
export const MatchAxis = Object.freeze({
  ROW:    'row',
  COLUMN: 'column',
});

// ── Difficulty tier enum ─────────────────────────────────────────────────────
export const DifficultyTier = Object.freeze({
  INTRO: 'intro',
  MID:   'mid',
  LATE:  'late',
});

// ── Game constants ───────────────────────────────────────────────────────────
export const MATCH_MIN_LENGTH          = 3;   // minimum tiles to form a clearing line
export const SPECIAL_REWARD_THRESHOLD  = 5;   // cleared count that awards a special sweet
export const RESHUFFLE_MAX_ATTEMPTS    = 50;  // safety cap when seeking a legal board

// ── Factory: default PlayerProgress ─────────────────────────────────────────
export function defaultProgress() {
  return {
    schemaVersion: 1,
    highestUnlockedLevel: 1,
    bestScoresByLevel: {},
    lastPlayedLevelId: null,
    resumeSession: null,
    settings: {
      soundEnabled: true,
      musicEnabled: true,
      hapticsEnabled: true,
      reducedMotionPreferred: false,
    },
    updatedAt: new Date().toISOString(),
  };
}

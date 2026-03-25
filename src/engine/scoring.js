/**
 * scoring.js — Calculates score for a resolution step.
 *
 * Formula:
 *   stepScore = sum(group.clearedCount * BASE_POINTS_PER_TILE) * cascadeMultiplier
 *   cascadeMultiplier = 1 + comboChain * 0.5
 *
 * comboChain = 0 for the first resolution step after a swap,
 *              increments for each subsequent cascade step.
 */

const BASE_POINTS_PER_TILE = 50;

/**
 * Calculate the score earned for one resolution step.
 *
 * @param {Array<object>} matchGroups — MatchGroup objects from match-resolver
 * @param {number} comboChain — cascade depth (0 for initial match)
 * @returns {number} integer points earned this step
 */
export function calculateScore(matchGroups, comboChain) {
  const cascadeMultiplier = 1 + comboChain * 0.5;
  let raw = 0;
  for (const group of matchGroups) {
    raw += group.clearedCount * BASE_POINTS_PER_TILE;
  }
  return Math.round(raw * cascadeMultiplier);
}

/**
 * game-controller.js — Full turn orchestrator for the match-three game.
 *
 * Turn flow:
 *   1. Validate adjacency
 *   2. Briefly swap tiles to detect matches
 *   3a. No match → revert, return 'invalid' with shake phase
 *   3b. Match found → resolve cascade:
 *      - Mark consumed → score → gravity+spawn → repeat until stable
 *      - After stability: reshuffle if no legal moves remain
 *      - Check win/lose conditions
 *   4. Return { result, phases, boardState, scoreEarned }
 *
 * Animation durations match motion.css keyframe durations.
 */

import { findMatches, applyMatches } from '../engine/match-resolver.js';
import { applyGravity }              from '../engine/gravity-engine.js';
import { calculateScore }            from '../engine/scoring.js';
import { reshuffleBoard }            from '../engine/board-generator.js';
import { applySpecialEffect }        from '../engine/special-sweets.js';
import { BoardStatus, ALL_SWEET_TYPES, TileState } from '../engine/types.js';

// Match motion.css animation durations
const DUR_SWAP  = 150;  // brief swap preview before revert
const DUR_POP   = 260;  // tile-pop animation
const DUR_FALL  = 220;  // tile-fall + tile-spawn animation

export class GameController {
  /**
   * @param {object} levelDef  — LevelDefinition for the active level
   * @param {object} boardState — initial BoardState from generateBoard()
   */
  constructor(levelDef, boardState) {
    this._levelDef = levelDef;
    this._state    = boardState;
    this._pool     = ALL_SWEET_TYPES.slice(0, levelDef.sweetTypeCount);
  }

  /** Returns the current BoardState (the latest stable state). */
  getBoardState() {
    return this._state;
  }

  /**
   * Attempt a swap between two board positions.
   *
   * @param {{x:number, y:number}} from
   * @param {{x:number, y:number}} to
   * @returns {{
   *   result: 'valid'|'invalid'|'won'|'lost'|'busy',
   *   phases: Array<{state: object, duration: number}>,
   *   boardState: object,
   *   scoreEarned: number,
   * }}
   */
  processSwap(from, to) {
    if (this._state.status !== BoardStatus.IDLE) {
      return { result: 'busy', phases: [], boardState: this._state, scoreEarned: 0 };
    }

    if (!this._isAdjacent(from, to)) {
      return { result: 'invalid', phases: [], boardState: this._state, scoreEarned: 0 };
    }

    // Apply the swap to a candidate state
    const swappedState = this._swapTiles(this._state, from, to);

    // Check for qualifying matches
    const initialMatches = findMatches(swappedState);

    if (initialMatches.length === 0) {
      // Invalid swap — revert after showing the swap briefly
      return {
        result: 'invalid',
        phases: [{ state: { ...swappedState, status: BoardStatus.SWAPPING }, duration: DUR_SWAP }],
        boardState: this._state,
        scoreEarned: 0,
      };
    }

    // ── Valid swap: enter resolution cascade ─────────────────────────────────
    const phases = [];

    // Phase 0: show the accepted swap
    phases.push({ state: { ...swappedState, status: BoardStatus.SWAPPING }, duration: DUR_SWAP });

    let current     = { ...swappedState, status: BoardStatus.RESOLVING };
    let matches     = initialMatches;
    let comboChain  = 0;
    let totalScore  = 0;

    while (matches.length > 0) {
      const beforeClear = current;

      const awardedSpecials = matches
        .filter(group => group.awardsSpecial && group.anchorCells?.length)
        .map(group => ({
          position: group.anchorCells[0],
          specialType: group.awardedSpecialType,
          sweetType: group.matchedSweetType,
        }));

      // Apply clears
      current = applyMatches(current, matches);
      current = this._placeAwardedSpecials(current, awardedSpecials);

      const triggeredSpecials = this._collectTriggeredSpecialTiles(beforeClear, matches);
      if (triggeredSpecials.length > 0) {
        current = this._applyTriggeredSpecials(current, triggeredSpecials);
      }

      phases.push({ state: { ...current, status: BoardStatus.RESOLVING }, duration: DUR_POP });

      // Score
      const stepScore = calculateScore(matches, comboChain);
      totalScore += stepScore;

      // Deduct one move only on the first step (the player's actual move)
      const movesLeft = comboChain === 0
        ? current.movesLeft - 1
        : current.movesLeft;

      current = {
        ...current,
        score: current.score + stepScore,
        movesLeft,
        status: BoardStatus.REFILLING,
      };

      // Apply gravity and spawn
      current = applyGravity(current, this._pool);
      phases.push({ state: { ...current, status: BoardStatus.REFILLING }, duration: DUR_FALL });

      // Settle animated tile states to resting before next resolver pass
      current = this._settle(current);

      // Check for cascades
      matches = findMatches(current);
      comboChain++;
    }

    // ── Reshuffle if no legal moves remain ───────────────────────────────────
    if (!this._hasLegalMove(current)) {
      current = reshuffleBoard(current, this._pool);
      current = this._settle(current);
      phases.push({ state: { ...current, status: BoardStatus.REFILLING }, duration: DUR_FALL });
    }

    // ── Win / lose check ─────────────────────────────────────────────────────
    let result;
    if (current.score >= this._levelDef.targetScore) {
      current = { ...current, status: BoardStatus.WON };
      result  = 'won';
    } else if (current.movesLeft <= 0) {
      current = { ...current, status: BoardStatus.LOST };
      result  = 'lost';
    } else {
      current = { ...current, status: BoardStatus.IDLE };
      result  = 'valid';
    }

    // Push the final stable state as a zero-duration phase
    phases.push({ state: current, duration: 0 });

    this._state = current;
    return { result, phases, boardState: current, scoreEarned: totalScore };
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  /** Swap the sweetType of two tiles (and update their coordinates). */
  _swapTiles(state, from, to) {
    const tiles  = state.tiles.map(t => ({ ...t }));
    const { width } = state;
    const fi = from.y * width + from.x;
    const ti = to.y   * width + to.x;

    const origFrom = state.tiles[fi];
    const origTo   = state.tiles[ti];
    tiles[fi] = { ...origTo,   x: from.x, y: from.y };
    tiles[ti] = { ...origFrom, x: to.x,   y: to.y   };

    return { ...state, tiles };
  }

  /** Reset all tile states to RESTING. */
  _settle(state) {
    return {
      ...state,
      tiles: state.tiles.map(t => ({ ...t, state: TileState.RESTING })),
    };
  }

  _isAdjacent(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
  }

  /** Returns true if at least one adjacent swap produces a qualifying match. */
  _hasLegalMove(state) {
    const { tiles, width, height } = state;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (x + 1 < width && this._swapCreatesMatch(tiles, width, height, x, y, x + 1, y))
          return true;
        if (y + 1 < height && this._swapCreatesMatch(tiles, width, height, x, y, x, y + 1))
          return true;
      }
    }
    return false;
  }

  _swapCreatesMatch(tiles, width, height, x1, y1, x2, y2) {
    const copy = tiles.slice();
    const i1   = y1 * width + x1;
    const i2   = y2 * width + x2;
    // Swap sweet types only (avoid mutating objects)
    const t1Type = tiles[i2].sweetType;
    const t2Type = tiles[i1].sweetType;
    copy[i1] = { ...tiles[i1], sweetType: t1Type };
    copy[i2] = { ...tiles[i2], sweetType: t2Type };

    const MATCH = 3;
    for (const y of new Set([y1, y2])) {
      let run = 1;
      for (let x = 1; x < width; x++) {
        if (copy[y * width + x].sweetType === copy[y * width + x - 1].sweetType) {
          if (++run >= MATCH) return true;
        } else { run = 1; }
      }
    }
    for (const x of new Set([x1, x2])) {
      let run = 1;
      for (let y = 1; y < height; y++) {
        if (copy[y * width + x].sweetType === copy[(y - 1) * width + x].sweetType) {
          if (++run >= MATCH) return true;
        } else { run = 1; }
      }
    }
    return false;
  }

  _placeAwardedSpecials(boardState, specials) {
    if (!specials.length) return boardState;

    const { width } = boardState;
    const tiles = boardState.tiles.map(t => ({ ...t }));

    for (const special of specials) {
      const i = special.position.y * width + special.position.x;
      const tile = tiles[i];
      if (!tile) continue;

      tiles[i] = {
        ...tile,
        sweetType: special.sweetType,
        specialType: special.specialType,
        state: TileState.RESTING,
      };
    }

    return { ...boardState, tiles };
  }

  _collectTriggeredSpecialTiles(beforeClear, matchGroups) {
    const { width, tiles } = beforeClear;
    const positions = new Set();

    for (const group of matchGroups) {
      for (const cell of group.clearedCells) {
        positions.add(cell.y * width + cell.x);
      }
    }

    const triggered = [];
    for (const i of positions) {
      const tile = tiles[i];
      if (tile && tile.specialType && tile.specialType !== 'none') {
        triggered.push(tile);
      }
    }

    return triggered;
  }

  _applyTriggeredSpecials(boardState, initialSpecials) {
    const queue = [...initialSpecials];
    const seen = new Set(initialSpecials.map(t => t.id));
    let current = boardState;

    while (queue.length) {
      const special = queue.shift();
      const before = current;
      const result = applySpecialEffect(current, special);
      current = result.board;

      for (let i = 0; i < before.tiles.length; i++) {
        const prev = before.tiles[i];
        const next = current.tiles[i];

        if (
          prev.specialType &&
          prev.specialType !== 'none' &&
          prev.state !== TileState.CONSUMED &&
          next?.state === TileState.CONSUMED &&
          !seen.has(prev.id)
        ) {
          seen.add(prev.id);
          queue.push(prev);
        }
      }
    }

    return current;
  }
}

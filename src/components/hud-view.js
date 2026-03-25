/**
 * hud-view.js — Renders the in-game HUD and emits named control events.
 *
 * Control events (dispatched on document, bubbles: true):
 *   'hud-pause'   — player pressed Pause
 *   'hud-retry'   — player pressed Retry
 *   'hud-exit'    — player pressed Exit
 */

export class HudView {
  constructor() {
    this._elLevel  = document.getElementById('hud-level');
    this._elScore  = document.getElementById('hud-score');
    this._elMoves  = document.getElementById('hud-moves');
    this._elTarget = document.getElementById('hud-target');

    const btnPause = document.getElementById('btn-pause');
    const btnRetry = document.getElementById('btn-retry');
    const btnExit  = document.getElementById('btn-exit');

    this._elLevel?.setAttribute('aria-live', 'polite');
    this._elScore?.setAttribute('aria-live', 'polite');
    this._elMoves?.setAttribute('aria-live', 'polite');
    this._elTarget?.setAttribute('aria-live', 'polite');

    btnPause?.addEventListener('click', () => this._dispatch('hud-pause'));
    btnRetry?.addEventListener('click', () => this._dispatch('hud-retry'));
    btnExit?.addEventListener('click',  () => this._dispatch('hud-exit'));
  }

  /**
   * Update all HUD counters.
   *
   * @param {object} snapshot
   * @param {number} snapshot.levelId
   * @param {number} snapshot.score
   * @param {number} snapshot.movesLeft
   * @param {number} snapshot.targetScore
   */
  update({ levelId, score, movesLeft, targetScore }) {
    if (this._elLevel)  this._elLevel.textContent  = `Lvl ${levelId}`;
    if (this._elScore)  this._elScore.textContent  = score.toLocaleString();
    if (this._elMoves)  this._elMoves.textContent  = `${movesLeft} ✦`;
    if (this._elTarget) this._elTarget.textContent = `/ ${targetScore.toLocaleString()}`;
  }

  _dispatch(name) {
    document.dispatchEvent(new CustomEvent(name, { bubbles: true }));
  }
}

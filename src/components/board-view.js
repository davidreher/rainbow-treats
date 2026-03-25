/**
 * board-view.js — DOM renderer and input controller for the game board.
 *
 * Rendering: full DOM rebuild on every render() call (board is at most 8×8 = 64 tiles,
 * so rebuilding is trivial and avoids diff complexity).
 *
 * Input (T017): two interaction modes handled simultaneously:
 *   • Drag-to-swap  — pointerdown on tile A, drag over adjacent tile B → fires swap
 *   • Tap-to-swap   — tap tile A (selects), tap adjacent tile B → fires swap
 *
 * Invalid swap feedback (T020): shake animation on the rejected tile pair via CSS class.
 *
 * Events emitted on document (bubbles: true):
 *   'swap-requested' — detail: { from: {x,y}, to: {x,y} }
 */

import { TileState, SpecialType } from '../engine/types.js';

// Visual emoji per sweet type
const SWEET_EMOJI = {
  strawberry: '🍓',
  lemon:      '🍋',
  mint:       '🍃',
  grape:      '🍇',
  blueberry:  '🫐',
  orange:     '🍊',
  cream:      '🍦',
};

export class BoardView {
  constructor() {
    this._boardEl    = document.getElementById('board');
    this._cellEls    = [];   // flat row-major array of tile DOM elements
    this._width      = 0;
    this._height     = 0;
    this._selected   = null; // {x, y} of the first tap selection
    this._resolving  = false;

    this._initPointerHandlers();
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Full re-render of the board from a BoardState.
   * Rebuilds all tile DOM elements each time; CSS classes drive animation.
   *
   * @param {object} boardState
   */
  render(boardState) {
    const { tiles, width, height, status } = boardState;

    // Block input during non-idle phases
    this._resolving = status !== 'idle';

    // Re-initialize grid if dimensions changed
    if (this._width !== width || this._height !== height) {
      this._buildGrid(width, height);
    }

    // Toggle board resolving class (disables pointer-events via CSS)
    this._boardEl.classList.toggle('board--resolving', this._resolving);

    // Update each cell element
    for (const tile of tiles) {
      const i   = tile.y * width + tile.x;
      const el  = this._cellEls[i];
      if (!el) continue;
      this._applyTile(el, tile);
    }
  }

  /**
   * Play a shake animation on the two tiles involved in a rejected swap.
   * This is called after render() has already drawn the reverted (original) state.
   *
   * @param {{x:number, y:number}} from
   * @param {{x:number, y:number}} to
   */
  shakeInvalidSwap(from, to) {
    const cells = [
      this._cellEls[from.y * this._width + from.x],
      this._cellEls[to.y   * this._width + to.x],
    ].filter(Boolean);

    for (const el of cells) {
      // Force animation restart by removing first
      el.classList.remove('anim-shake');
      // Trigger reflow so the browser registers the removal
      void el.offsetWidth;
      el.classList.add('anim-shake');
    }

    // Auto-clean after animation completes
    setTimeout(() => {
      for (const el of cells) el.classList.remove('anim-shake');
    }, 330);
  }

  // ── Grid construction ──────────────────────────────────────────────────────

  _buildGrid(width, height) {
    this._width  = width;
    this._height = height;
    this._boardEl.innerHTML = '';
    this._cellEls = [];

    this._boardEl.style.setProperty('--board-cols', width);
    this._boardEl.style.setProperty('--board-rows', height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const el = document.createElement('div');
        el.className = 'tile';
        el.dataset.x = x;
        el.dataset.y = y;
        el.setAttribute('role', 'gridcell');
        el.setAttribute('tabindex', '0');
        this._boardEl.appendChild(el);
        this._cellEls.push(el);
      }
    }
  }

  // ── Tile rendering ─────────────────────────────────────────────────────────

  _applyTile(el, tile) {
    const { sweetType, specialType, state } = tile;

    // Reset classes then rebuild
    el.className = `tile tile--${sweetType}`;

    if (state === TileState.SELECTED) el.classList.add('tile--selected');
    if (state === TileState.MATCHED)  el.classList.add('tile--matched');
    if (state === TileState.FALLING)  el.classList.add('tile--falling');
    if (state === TileState.SPAWNING) el.classList.add('tile--spawning');

    if (specialType && specialType !== SpecialType.NONE) {
      el.classList.add('tile--special', `tile--${specialType}`);
    }

    el.textContent = SWEET_EMOJI[sweetType] || '✦';
    el.setAttribute('aria-label', sweetType + (specialType !== SpecialType.NONE ? ' special' : ''));
  }

  // ── Input handling (T017) ──────────────────────────────────────────────────

  _initPointerHandlers() {
    let dragFrom = null;     // {x, y} where the active drag started
    let dragged  = false;    // whether a drag swap was already fired

    this._boardEl.addEventListener('pointerdown', (e) => {
      if (this._resolving) return;
      const el = e.target.closest('.tile[data-x]');
      if (!el) return;
      e.preventDefault();

      const from = { x: +el.dataset.x, y: +el.dataset.y };
      dragFrom = from;
      dragged  = false;
      this._boardEl.setPointerCapture(e.pointerId);
    });

    this._boardEl.addEventListener('pointermove', (e) => {
      if (this._resolving || !dragFrom || dragged) return;

      const rect     = this._boardEl.getBoundingClientRect();
      const tileSize = rect.width / this._width;
      const dx       = e.clientX - rect.left - (dragFrom.x + 0.5) * tileSize;
      const dy       = e.clientY - rect.top  - (dragFrom.y + 0.5) * tileSize;

      // Require the pointer to travel at least half a tile in one axis
      const threshold = tileSize * 0.45;
      if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;

      // Determine dominant direction
      let to;
      if (Math.abs(dx) >= Math.abs(dy)) {
        to = { x: dragFrom.x + (dx > 0 ? 1 : -1), y: dragFrom.y };
      } else {
        to = { x: dragFrom.x, y: dragFrom.y + (dy > 0 ? 1 : -1) };
      }

      // Bounds check
      if (to.x < 0 || to.x >= this._width || to.y < 0 || to.y >= this._height) return;

      dragged = true;
      this._clearSelection();
      this._fireSwap(dragFrom, to);
    });

    this._boardEl.addEventListener('pointerup', (e) => {
      if (this._resolving) { dragFrom = null; return; }

      const el = e.target.closest('.tile[data-x]');
      if (el && !dragged) {
        const tapped = { x: +el.dataset.x, y: +el.dataset.y };

        if (this._selected) {
          if (this._isSame(this._selected, tapped)) {
            // Tap the same tile → deselect
            this._clearSelection();
          } else if (this._isAdjacent(this._selected, tapped)) {
            // Tap adjacent → swap
            const from = this._selected;
            this._clearSelection();
            this._fireSwap(from, tapped);
          } else {
            // Tap a different non-adjacent tile → re-select
            this._clearSelection();
            this._select(tapped, el);
          }
        } else {
          // No current selection → select this tile
          this._select(tapped, el);
        }
      }

      dragFrom = null;
    });

    // Keyboard support (arrow keys to move selection; Enter/Space to confirm swap)
    this._boardEl.addEventListener('keydown', (e) => {
      if (this._resolving) return;
      const focused = document.activeElement?.closest('.tile[data-x]');
      if (!focused) return;

      const fx = +focused.dataset.x;
      const fy = +focused.dataset.y;

      let dx = 0, dy = 0;
      if (e.key === 'ArrowRight') dx =  1;
      if (e.key === 'ArrowLeft')  dx = -1;
      if (e.key === 'ArrowDown')  dy =  1;
      if (e.key === 'ArrowUp')    dy = -1;

      if ((dx || dy) && e.key.startsWith('Arrow')) {
        e.preventDefault();
        const nx = fx + dx;
        const ny = fy + dy;
        if (nx >= 0 && nx < this._width && ny >= 0 && ny < this._height) {
          const ni  = ny * this._width + nx;
          this._cellEls[ni]?.focus();
        }
        return;
      }

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const here = { x: fx, y: fy };
        if (this._selected) {
          if (this._isAdjacent(this._selected, here)) {
            const from = this._selected;
            this._clearSelection();
            this._fireSwap(from, here);
          } else {
            this._clearSelection();
            this._select(here, focused);
          }
        } else {
          this._select(here, focused);
        }
      }
    });
  }

  // ── Selection helpers ──────────────────────────────────────────────────────

  _select(pos, el) {
    this._selected = pos;
    el.classList.add('tile--selected');
  }

  _clearSelection() {
    if (this._selected) {
      const { x, y } = this._selected;
      const i = y * this._width + x;
      this._cellEls[i]?.classList.remove('tile--selected');
      this._selected = null;
    }
  }

  _isAdjacent(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
  }

  _isSame(a, b) {
    return a.x === b.x && a.y === b.y;
  }

  // ── Swap dispatch ──────────────────────────────────────────────────────────

  _fireSwap(from, to) {
    document.dispatchEvent(
      new CustomEvent('swap-requested', { bubbles: true, detail: { from, to } })
    );
  }
}

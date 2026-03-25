import { TileState, EffectType } from './types.js';

function idx(width, x, y) {
  return y * width + x;
}

function consumeCell(tiles, width, x, y) {
  const i = idx(width, x, y);
  const tile = tiles[i];
  if (!tile || tile.state === TileState.CONSUMED) return false;
  tiles[i] = { ...tile, state: TileState.CONSUMED };
  return true;
}

export function applyRowClear(board, tile) {
  const { width, tiles } = board;
  const nextTiles = tiles.map(t => ({ ...t }));
  const clearedCells = [];

  for (let x = 0; x < width; x++) {
    if (consumeCell(nextTiles, width, x, tile.y)) {
      clearedCells.push({ x, y: tile.y });
    }
  }

  return {
    board: { ...board, tiles: nextTiles },
    effects: [{
      type: EffectType.SPECIAL_CLEAR,
      source: { x: tile.x, y: tile.y, specialType: 'row-clear' },
      payload: { axis: 'row', row: tile.y, clearedCells },
      sequence: 0,
    }],
  };
}

export function applyColumnClear(board, tile) {
  const { width, height, tiles } = board;
  const nextTiles = tiles.map(t => ({ ...t }));
  const clearedCells = [];

  for (let y = 0; y < height; y++) {
    if (consumeCell(nextTiles, width, tile.x, y)) {
      clearedCells.push({ x: tile.x, y });
    }
  }

  return {
    board: { ...board, tiles: nextTiles },
    effects: [{
      type: EffectType.SPECIAL_CLEAR,
      source: { x: tile.x, y: tile.y, specialType: 'column-clear' },
      payload: { axis: 'column', column: tile.x, clearedCells },
      sequence: 0,
    }],
  };
}

export function applySameTypeClear(board, tile) {
  const { width, tiles } = board;
  const nextTiles = tiles.map(t => ({ ...t }));
  const clearedCells = [];
  const targetType = tile.sweetType;

  for (const cell of nextTiles) {
    if (cell.sweetType === targetType) {
      if (consumeCell(nextTiles, width, cell.x, cell.y)) {
        clearedCells.push({ x: cell.x, y: cell.y });
      }
    }
  }

  return {
    board: { ...board, tiles: nextTiles },
    effects: [{
      type: EffectType.SPECIAL_CLEAR,
      source: { x: tile.x, y: tile.y, specialType: 'same-type-clear' },
      payload: { sweetType: targetType, clearedCells },
      sequence: 0,
    }],
  };
}

export function applySpecialEffect(board, tile) {
  if (tile.specialType === 'row-clear') return applyRowClear(board, tile);
  if (tile.specialType === 'column-clear') return applyColumnClear(board, tile);
  if (tile.specialType === 'same-type-clear') return applySameTypeClear(board, tile);
  return { board, effects: [] };
}

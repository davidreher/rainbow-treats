import { defaultProgress } from '../engine/types.js';
import { migrate } from './migrations.js';

export const STORAGE_KEY = 'sweet-match-progress';

function emitStorageError() {
  document.dispatchEvent(new CustomEvent('storage-error', { bubbles: true }));
}

function canUseStorage() {
  try {
    const probe = '__sweet_match_probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export function loadProgress() {
  if (!canUseStorage()) {
    emitStorageError();
    return defaultProgress();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw);
    return migrate(parsed);
  } catch {
    emitStorageError();
    return defaultProgress();
  }
}

export function saveProgress(progress) {
  if (!canUseStorage()) {
    emitStorageError();
    return false;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...progress,
      updatedAt: new Date().toISOString(),
    }));
    return true;
  } catch {
    emitStorageError();
    return false;
  }
}

export function clearProgress() {
  if (!canUseStorage()) {
    emitStorageError();
    return false;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    emitStorageError();
    return false;
  }
}

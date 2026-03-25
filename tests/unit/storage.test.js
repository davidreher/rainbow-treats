import { beforeEach, describe, expect, it } from 'vitest';
import { loadProgress, saveProgress, clearProgress, STORAGE_KEY } from '../../src/storage/progress-store.js';
import { migrate } from '../../src/storage/migrations.js';

function mockStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

beforeEach(() => {
  globalThis.localStorage = mockStorage();

  globalThis.CustomEvent = class {
    constructor(type, init = {}) {
      this.type = type;
      this.detail = init.detail;
      this.bubbles = Boolean(init.bubbles);
    }
  };

  globalThis.document = {
    dispatched: [],
    dispatchEvent(evt) {
      this.dispatched.push(evt);
    },
  };
});

describe('progress-store and migrations', () => {
  it('returns defaults on fresh install', () => {
    const progress = loadProgress();
    expect(progress.highestUnlockedLevel).toBe(1);
    expect(progress.bestScoresByLevel).toEqual({});
    expect(progress.schemaVersion).toBe(1);
  });

  it('supports round-trip save and load', () => {
    const progress = loadProgress();
    progress.highestUnlockedLevel = 3;
    progress.bestScoresByLevel = { 1: 1500, 2: 1800 };

    const saved = saveProgress(progress);
    expect(saved).toBe(true);

    const loaded = loadProgress();
    expect(loaded.highestUnlockedLevel).toBe(3);
    expect(loaded.bestScoresByLevel).toEqual({ 1: 1500, 2: 1800 });
  });

  it('migrates schema v0 payloads to current schema', () => {
    const legacy = {
      highestUnlockedLevel: 4,
      bestScoresByLevel: { 1: 500 },
      settings: { soundEnabled: false },
    };

    const migrated = migrate(legacy);
    expect(migrated.schemaVersion).toBe(1);
    expect(migrated.highestUnlockedLevel).toBe(4);
    expect(migrated.bestScoresByLevel).toEqual({ 1: 500 });
    expect(migrated.settings.soundEnabled).toBe(false);
  });

  it('falls back to defaults on corrupt saved data', () => {
    localStorage.setItem(STORAGE_KEY, '{broken-json');
    const loaded = loadProgress();

    expect(loaded.schemaVersion).toBe(1);
    expect(loaded.highestUnlockedLevel).toBe(1);
    expect(document.dispatched.some(event => event.type === 'storage-error')).toBe(true);
  });

  it('clears stored progress', () => {
    saveProgress({
      schemaVersion: 1,
      highestUnlockedLevel: 2,
      bestScoresByLevel: { 1: 123 },
      lastPlayedLevelId: 1,
      resumeSession: null,
      settings: { soundEnabled: true, musicEnabled: true, hapticsEnabled: true, reducedMotionPreferred: false },
      updatedAt: new Date().toISOString(),
    });

    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    expect(clearProgress()).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

import { defaultProgress } from '../engine/types.js';

export const CURRENT_SCHEMA_VERSION = 1;

function migrateV0toV1(raw) {
  const base = defaultProgress();
  return {
    ...base,
    schemaVersion: 1,
    highestUnlockedLevel: Number.isInteger(raw?.highestUnlockedLevel)
      ? Math.max(1, raw.highestUnlockedLevel)
      : 1,
    bestScoresByLevel: typeof raw?.bestScoresByLevel === 'object' && raw.bestScoresByLevel
      ? raw.bestScoresByLevel
      : {},
    lastPlayedLevelId: Number.isInteger(raw?.lastPlayedLevelId) ? raw.lastPlayedLevelId : null,
    resumeSession: raw?.resumeSession ?? null,
    settings: {
      ...base.settings,
      ...(raw?.settings ?? {}),
    },
    updatedAt: raw?.updatedAt ?? new Date().toISOString(),
  };
}

export function migrate(rawData) {
  try {
    if (!rawData || typeof rawData !== 'object') {
      return defaultProgress();
    }

    const version = Number.isInteger(rawData.schemaVersion) ? rawData.schemaVersion : 0;

    let migrated = rawData;

    if (version < 1) {
      migrated = migrateV0toV1(migrated);
    }

    if (!Number.isInteger(migrated.schemaVersion) || migrated.schemaVersion !== CURRENT_SCHEMA_VERSION) {
      migrated = { ...migrated, schemaVersion: CURRENT_SCHEMA_VERSION };
    }

    return migrated;
  } catch {
    return defaultProgress();
  }
}

# Local Save Contract

## Purpose

Defines the browser-local persistence format for progression and resumable play.

## Storage Key

- Primary key: `sweet-match-progress`

## Saved Payload

```json
{
  "schemaVersion": 1,
  "highestUnlockedLevel": 1,
  "bestScoresByLevel": {
    "1": 1200
  },
  "lastPlayedLevelId": 1,
  "resumeSession": {
    "levelId": 1,
    "score": 600,
    "movesLeft": 8,
    "activeComboChain": 0,
    "savedAt": "2026-03-24T12:00:00.000Z",
    "boardState": {
      "levelId": 1,
      "width": 6,
      "height": 6,
      "tiles": []
    }
  },
  "settings": {
    "soundEnabled": true,
    "musicEnabled": true,
    "hapticsEnabled": true,
    "reducedMotionPreferred": false
  },
  "updatedAt": "2026-03-24T12:00:00.000Z"
}
```

## Contract Rules

- `schemaVersion` is mandatory on every save.
- Missing optional fields must default safely.
- Unknown fields must be ignored during read and omitted during rewrite unless explicitly adopted by a migration.
- Save operations must be atomic from the player perspective: partial saves must never leave unreadable progress.

## Failure Handling

- If `localStorage` is unavailable, the game continues in memory for the current session.
- If saving fails because storage is full or blocked, the UI must notify the player that progress cannot be saved.
- If the saved payload cannot be parsed or migrated, the app resets to a clean default progress state and informs the player.

## Migration Rules

- Each schema change increments `schemaVersion`.
- Migration functions must transform the previous known schema into the current schema before normal runtime reads continue.
- Migrations must preserve unlocked levels and best scores whenever possible.

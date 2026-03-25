# Data Model: Sweet Match Puzzle PWA

## LevelDefinition

Purpose:
- Describes one of the 50 fixed progression levels.

Fields:
- `id`: integer, unique, sequential from 1 to 50
- `name`: short display label
- `boardWidth`: integer, allowed range 6 to 8
- `boardHeight`: integer, allowed range 6 to 8
- `sweetTypeCount`: integer, allowed range 4 to 7
- `targetScore`: integer, greater than 0
- `moveLimit`: integer, greater than 0
- `specialRewardThreshold`: integer, default 5
- `difficultyTier`: enum `intro`, `mid`, `late`
- `unlockRule`: previous level completion requirement

Validation rules:
- The full level set must contain at least 50 records.
- IDs must be contiguous and unique.
- Later levels must not reduce difficulty below earlier levels in aggregate.
- Each level must generate an initial board with no pre-resolved clears and at least one legal move.

Relationships:
- One `LevelDefinition` creates one or more `BoardState` instances over time.

## PlayerProgress

Purpose:
- Stores local progression and resume information for the current browser profile.

Fields:
- `schemaVersion`: integer
- `highestUnlockedLevel`: integer, minimum 1
- `bestScoresByLevel`: map of level id to integer score
- `lastPlayedLevelId`: integer or null
- `resumeSession`: `ResumeSession` or null
- `settings`: `PlayerSettings`
- `updatedAt`: ISO timestamp string

Validation rules:
- `highestUnlockedLevel` cannot exceed the highest defined level.
- A best score can only exist for a defined level.
- `resumeSession.levelId` must refer to an unlocked level.

Relationships:
- One `PlayerProgress` record references zero or one `ResumeSession`.
- One `PlayerProgress` record references one `PlayerSettings` object.

## ResumeSession

Purpose:
- Stores enough information to restore an interrupted level locally.

Fields:
- `levelId`: integer
- `boardState`: `BoardState`
- `score`: integer
- `movesLeft`: integer
- `activeComboChain`: integer
- `savedAt`: ISO timestamp string

Validation rules:
- `movesLeft` must be zero or greater.
- `boardState.levelId` must match `levelId`.

## PlayerSettings

Purpose:
- Stores lightweight local preferences.

Fields:
- `soundEnabled`: boolean
- `musicEnabled`: boolean
- `hapticsEnabled`: boolean
- `reducedMotionPreferred`: boolean

Validation rules:
- All settings fields default safely if missing during migration.

## BoardState

Purpose:
- Represents the live gameplay state for one active level.

Fields:
- `levelId`: integer
- `width`: integer
- `height`: integer
- `tiles`: array of `Tile` with length `width * height`
- `score`: integer
- `movesLeft`: integer
- `status`: enum `idle`, `swapping`, `resolving`, `refilling`, `won`, `lost`
- `pendingEffects`: array of `ResolutionEffect`
- `comboChain`: integer

Validation rules:
- The tile array length must always match the board dimensions.
- No tile position can contain more than one tile.
- At the end of a full resolution cycle, the board must contain no unresolved clears.
- At the start of a level and after reshuffle, the board must contain at least one legal move.

Relationships:
- One `BoardState` contains many `Tile` records.
- One `BoardState` is created from one `LevelDefinition`.

## Tile

Purpose:
- Represents a single board piece.

Fields:
- `id`: string, unique within the board session
- `x`: integer
- `y`: integer
- `sweetType`: enum such as `strawberry`, `lemon`, `mint`, `grape`, `blueberry`, `orange`, `cream`
- `specialType`: enum `none`, `row-clear`, `column-clear`, `same-type-clear`
- `state`: enum `resting`, `selected`, `matched`, `falling`, `spawning`, `consumed`

Validation rules:
- `x` and `y` must remain inside the board bounds.
- `specialType` must be `none` for normal tiles.
- A tile cannot be both `consumed` and present on the settled board.

## MatchGroup

Purpose:
- Represents one detected qualifying clear from a swap or cascade.

Fields:
- `axis`: enum `row`, `column`
- `matchedSweetType`: sweet type enum
- `anchorCells`: array of cell coordinates that formed the qualifying line
- `clearedCells`: array of cell coordinates cleared by the rule for that line
- `clearedCount`: integer
- `awardsSpecial`: boolean
- `awardedSpecialType`: enum or null

Validation rules:
- `clearedCount` must equal the size of `clearedCells`.
- `awardsSpecial` is true only when `clearedCount` is greater than 4.

## ResolutionEffect

Purpose:
- Encodes the ordered outcomes of one move resolution cycle.

Fields:
- `type`: enum `clear`, `special-clear`, `gravity`, `spawn`, `score`, `reshuffle`
- `source`: coordinate, tile id, or system event label
- `payload`: effect-specific data
- `sequence`: integer order index

Validation rules:
- Resolution effects are applied in sequence order.
- Equal starting board states and equal inputs must produce equal ordered effects.

## State Transitions

### Gameplay State Machine

1. `idle` -> `swapping`
- Trigger: player selects two orthogonally adjacent tiles.
- Guard: board is interactive and not already resolving.

2. `swapping` -> `idle`
- Trigger: the attempted swap does not create a qualifying clear.
- Outcome: board reverts exactly, score unchanged, move not consumed.

3. `swapping` -> `resolving`
- Trigger: the attempted swap creates one or more qualifying clears.
- Outcome: move is accepted and resolution begins.

4. `resolving` -> `refilling`
- Trigger: all clear and special effects for the current step are applied.
- Outcome: empty spaces are prepared for gravity and spawn.

5. `refilling` -> `resolving`
- Trigger: gravity and new tile spawn create another qualifying clear.
- Outcome: cascade continues.

6. `refilling` -> `idle`
- Trigger: board is full, stable, and has at least one legal move.
- Outcome: player can act again.

7. `refilling` -> `idle` with reshuffle effect
- Trigger: board becomes stable but has no legal move.
- Outcome: board reshuffles into a legal playable state without resetting earned progress.

8. Any active state -> `won`
- Trigger: score or other completion target for the level is satisfied before failure.

9. Any active state -> `lost`
- Trigger: move limit or equivalent failure condition is reached without meeting the completion target.

## Persistence Rules

- Save checkpoints occur after level completion, after level unlock changes, after best score changes, after settings changes, and after an explicit resumable game snapshot.
- Save payloads must include `schemaVersion`.
- If migration fails, the app falls back to a clean default progress state and informs the player.
- If storage is unavailable, the runtime board continues in memory for the current session only.

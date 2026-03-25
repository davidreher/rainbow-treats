# Level Data Contract

## Purpose

Defines the static metadata shape for the 50-level progression set.

## Level Record

Each level record must provide:
- `id`: integer
- `name`: string
- `boardWidth`: integer
- `boardHeight`: integer
- `sweetTypeCount`: integer
- `targetScore`: integer
- `moveLimit`: integer
- `difficultyTier`: `intro` | `mid` | `late`
- `specialRewardThreshold`: integer

## Invariants

- Exactly one level record exists for each sequential level number.
- At least 50 levels must be present in the shipped data set.
- `boardWidth` and `boardHeight` remain within the supported rendering range.
- `sweetTypeCount` must not exceed the available normal sweet definitions.
- Difficulty must increase overall across the sequence through one or more of:
  - higher target score
  - lower move limit
  - larger board dimensions
  - more sweet types in play

## Recommended Difficulty Bands

### Levels 1-10
- Smaller boards
- Lower target scores
- More forgiving move limits
- Fewer sweet types

### Levels 11-30
- Standard board sizes
- Higher target scores
- Tighter move limits
- Moderate sweet variety

### Levels 31-50
- Standard large board sizes
- Highest target scores
- Tightest move limits
- Broadest sweet variety allowed in v1

## Validation Requirements

Before a level is shipped:
- its generated starting board must contain no immediate clear
- its generated starting board must contain at least one legal move
- its completion target must be achievable under expected play conditions

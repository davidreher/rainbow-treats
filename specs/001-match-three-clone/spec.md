# Feature Specification: Sweet Match Puzzle PWA

**Feature Branch**: `001-match-three-clone`  
**Created**: 2026-03-24  
**Status**: Draft  
**Input**: User description: "I want to build a candy crush clone. There should be at least 50 different levels, each one increasing in difficutly. The player should be able to swap different sweets on the screen. If the player gets at least three items in a row or column, all items of the same type in the same row or column explode and the user gets points depending on the number of items exploded. If the swapping did not add at least three items into a row or column, the move is not allowed and reverted. The items above the exploded ones will fall down and new items will fill up the board. If more than four items explode in one row or column, the player is awarded with a special sweet, with special functionalities, like clearing the entire row or column or all sweets of one kind or similar."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Play a Valid Match Turn (Priority: P1)

As a player, I want to swap neighboring sweets and have the board resolve valid
matches, so that the core puzzle loop feels responsive and rewarding.

**Why this priority**: This is the irreducible gameplay loop. Without valid
swapping, match detection, explosions, gravity, refill, and score updates, there
is no usable game.

**Independent Test**: Can be fully tested by opening the game, making valid and
invalid swaps on a single level, and confirming that the board, score, and move
rules resolve correctly without requiring any progression system.

**Acceptance Scenarios**:

1. **Given** an active level with two adjacent sweets that create a qualifying
  match when swapped, **When** the player swaps them, **Then** the swap is
  accepted, the qualifying line resolves, matching explosion effects are
  applied, the score increases, and the board refills to a playable state.
2. **Given** an active level with two adjacent sweets that do not create a
  qualifying match, **When** the player swaps them, **Then** the move is
  rejected and the board returns to its previous state without changing score
  or consuming the move.
3. **Given** a board state where exploded sweets leave gaps, **When** the move
  resolves, **Then** sweets above fall downward and new sweets enter from the
  top until the board is full.

---

### User Story 2 - Progress Through Increasing Levels (Priority: P2)

As a player, I want to clear many levels that grow harder over time and earn
special sweets from large explosions, so that the game stays challenging and
varied beyond the first board.

**Why this priority**: A single playable board proves the mechanic, but the
requested product is a level-based game with at least 50 increasing challenges
and reward mechanics for larger matches.

**Independent Test**: Can be tested by starting from level 1, completing levels,
unlocking later levels, and verifying that difficulty ramps up and special
sweets appear after qualifying explosions.

**Acceptance Scenarios**:

1. **Given** a completed level, **When** the player meets that level's success
  target, **Then** the next level unlocks and becomes selectable.
2. **Given** a line resolution where more than four sweets explode in one row or
  column, **When** the board finishes resolving, **Then** a special sweet is
  awarded on the board and can later trigger a stronger clearing effect.
3. **Given** the level list, **When** the player compares early and late levels,
  **Then** the later levels present a measurably harder challenge through
  stricter move pressure, higher goals, more board complexity, or a larger
  effective sweet variety.

---

### User Story 3 - Resume Progress on Any Visit (Priority: P3)

As a player, I want my unlocked levels, best scores, and current progress to be
stored on my device, so that I can continue playing later even without a
network connection.

**Why this priority**: Local persistence and offline continuity are required by
the project constitution and materially improve the usefulness of a mobile-first
PWA.

**Independent Test**: Can be tested by playing multiple levels, reloading the
app, reopening it offline, and confirming that progression and relevant saved
state are restored from the same browser profile.

**Acceptance Scenarios**:

1. **Given** a player who has unlocked levels and earned scores, **When** the
  app is closed and reopened in the same browser profile, **Then** the game
  restores the unlocked level range, best scores, and the last resumable level
  state if one exists.
2. **Given** the game has been loaded before on a supported device, **When** the
  player opens it without network access, **Then** the app still launches and
  allows play using locally available assets and data.

---

### Constitution Alignment *(mandatory)*

- The game remains deployable as static assets only. All gameplay rules, level
  data, progression logic, score calculation, and board resolution run entirely
  in the browser with no server-side rendering or backend services.
- Locally stored data includes unlocked level count, best score per level,
  player settings, and optionally the latest resumable in-progress level state.
  This belongs in `localStorage` because it is user-specific browser state with
  no cross-device sync requirement. If `localStorage` is unavailable, full, or
  cleared, the game must remain playable for the current session, notify the
  player that progress cannot be saved or has been lost, and avoid corrupting
  active gameplay.
- The primary interaction model is mobile-first with touch-friendly adjacent
  tile selection and swapping. The primary journey must remain usable on a 360px
  wide viewport without horizontal scrolling.
- PWA impact includes an installable manifest, offline-capable asset access
  after first load, and state recovery from local data on later visits.
- External dependencies should be avoided unless a dependency clearly reduces
  implementation risk for rendering, testing, or PWA support. The default plan
  assumes no mandatory runtime dependency beyond the project tooling already in
  use.

### Edge Cases

- The initial board for a level must not start with an automatic resolving match
  and must provide at least one legal player move; otherwise, the board must be
  regenerated before interaction begins.
- If a cascade ends in a board state with no legal moves, the board must be
  reshuffled or regenerated without erasing earned progress for the current
  level.
- If a single swap creates both a row match and a column match, all qualifying
  explosion effects from that move must resolve before gravity is applied.
- If multiple special sweets are triggered in the same chain reaction, their
  effects must resolve in a deterministic order so the score and board state are
  reproducible.
- If local storage is full, unavailable, or manually cleared, the player must be
  informed which saved progress cannot be recovered while keeping the current
  playable session stable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide at least 50 individually selectable levels.
- **FR-002**: The system MUST ensure later levels are more difficult than earlier
  levels by increasing one or more of the following in a measurable way: target
  score, board complexity, move pressure, or effective sweet variety.
- **FR-003**: The system MUST render a grid-based board of sweets and allow the
  player to select and swap two orthogonally adjacent sweets.
- **FR-004**: The system MUST accept a swap only when that swap creates at least
  one line of three or more matching sweets.
- **FR-005**: The system MUST revert an invalid swap to its original board state
  without consuming the move or changing the score.
- **FR-006**: When a valid move creates a qualifying horizontal or vertical line,
  the system MUST clear all sweets of the matched type that appear in that same
  resolved row or column and award points based on the total number of sweets
  cleared by that resolution.
- **FR-007**: The system MUST apply gravity after each clearing event so sweets
  above empty spaces fall downward and new sweets enter from the top until the
  board is full.
- **FR-008**: The system MUST continue resolving additional automatic cascades
  until no further clearing event remains on the board.
- **FR-009**: When more than four sweets are cleared within one resolved row or
  column, the system MUST award at least one special sweet on the board.
- **FR-010**: The system MUST include special sweet behaviors capable of
  producing stronger effects than a standard sweet, including row clearing,
  column clearing, or clearing all sweets of one type.
- **FR-011**: The system MUST define how the player activates a special sweet and
  present the result clearly during board resolution.
- **FR-012**: Each level MUST define a clear completion target and a failure
  state so the player can either complete, retry, or leave the level.
- **FR-013**: The system MUST unlock the next level only after the current level
  is completed successfully.
- **FR-014**: The system MUST track and display the player's current score during
  a level and retain the best completed score for each unlocked level.
- **FR-015**: The system MUST initialize each level with a playable board that
  has no automatic opening clear and at least one legal move.
- **FR-016**: The system MUST detect a board state with no legal moves during
  play and restore playability without resetting earned progress for that level.
- **FR-017**: The system MUST continue the primary user journey without
  requiring a backend or server-rendered response after the initial asset load.
- **FR-018**: The system MUST store unlocked levels, best scores, player
  settings, and resumable level state locally, and it MUST define how that data
  is created, updated, versioned, and recovered when `localStorage` is missing,
  full, or reset.
- **FR-019**: The system MUST provide a mobile-first interface that supports the
  primary gameplay journey on a 360px wide viewport without horizontal
  scrolling.
- **FR-020**: The system MUST state and implement offline expectations so that,
  after the initial asset load on a supported browser, the player can relaunch
  the game and continue using available local content without network access.
- **FR-021**: The system MUST surface a clear player-facing message whenever
  local persistence is unavailable or saved progress has been lost.
- **FR-022**: The system MUST justify each external dependency against a simpler
  browser-native or existing-tooling alternative in the implementation plan.

### Key Entities *(include if feature involves data)*

- **Level**: A predefined challenge with an order number, board setup rules,
  completion target, failure condition, and difficulty parameters.
- **Board State**: The current arrangement of sweets, open spaces, active
  special sweets, remaining moves, current score, and pending resolution state.
- **Sweet Tile**: A board item with a normal or special type, a position, and a
  current interaction state.
- **Special Sweet**: A rewarded tile that carries a stronger clearing effect,
  such as row clear, column clear, or same-type clear.
- **Player Progress**: Local data describing unlocked levels, best scores,
  current settings, and optionally the last resumable in-progress level state.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Players can start level 1 and complete their first valid swap
  within 30 seconds of opening the game on a supported mobile device.
- **SC-002**: Players can finish a full move resolution, including cascades and
  refill, within 1 second for normal turns on supported target devices.
- **SC-003**: 100% of released builds expose at least 50 playable levels with a
  documented increasing difficulty curve.
- **SC-004**: At least 90% of test participants can correctly distinguish a
  valid swap from an invalid swap after one practice turn.
- **SC-005**: Players can complete the primary gameplay journey on a 360px wide
  viewport without horizontal scrolling or obscured controls.
- **SC-006**: Reloading the app in the same browser profile preserves unlocked
  levels and best scores in 100% of normal storage-available cases.
- **SC-007**: After the first successful load on a supported device, players can
  reopen the game offline and reach the level-select or active-level screen in
  under 10 seconds.

## Assumptions

- A single local player profile per browser is sufficient for v1; account-based
  sync and multiplayer features are out of scope.
- Each level uses a score-based completion target with a limited number of moves
  unless a later plan intentionally defines an equivalent player-visible goal.
- Difficulty increases can be achieved without adding blockers or monetization
  systems in v1, as long as later levels are clearly harder by measurable board
  and scoring parameters.
- The app targets modern evergreen mobile and desktop browsers that support
  local persistence and installable offline-capable web app behavior.
- If persistent storage is unavailable, the game still offers session play but
  does not guarantee saved progression after the page is closed or refreshed.

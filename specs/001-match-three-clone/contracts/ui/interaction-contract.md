# UI Interaction Contract

## Purpose

Defines the player-facing interaction rules for the single-page match-three PWA.

## Board Interaction

- The board displays a visible grid of sweets sized for touch interaction on a 360px wide viewport.
- A player may select one tile and then one orthogonally adjacent tile to attempt a swap.
- A swap attempt is accepted only if it produces at least one qualifying clear.
- An invalid swap visibly reverts and does not consume a move.
- During resolution, the board is temporarily non-interactive.

## Tile States

The UI must communicate these states distinctly:
- resting
- selected
- matched
- falling
- spawning
- special
- disabled during resolution

## Special Sweet Interaction

- Special sweets are created automatically after a qualifying clear of more than four tiles in one resolved row or column.
- A special sweet is activated by being part of a valid swap or by being consumed in another resolving effect.
- The UI must clearly indicate when a special sweet is created and when its stronger effect is triggered.

## HUD Contract

The active level screen must always display:
- current level number
- current score
- remaining moves or equivalent failure counter
- target score or completion condition
- pause, retry, or exit control

## Level Select Contract

The level select view must:
- show all defined levels in progression order
- clearly distinguish locked and unlocked levels
- display best score for each completed level where available
- allow launching any unlocked level

## Accessibility Contract

- The primary interaction must work with touch and pointer input.
- The interface must remain usable without horizontal scrolling at 360px width.
- Interactive controls must expose accessible names.
- Motion-heavy effects must respect reduced-motion preferences.

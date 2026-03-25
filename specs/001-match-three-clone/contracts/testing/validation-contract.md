# Validation Contract

## Purpose

Defines the minimum automated and manual verification expected for the feature.

## Logic Coverage

Unit or integration tests must cover:
- valid swap acceptance
- invalid swap reversion
- row and column clear detection
- special reward creation after clears larger than four tiles
- gravity and refill behavior
- cascade resolution ordering
- no-legal-move reshuffle behavior
- level unlock progression
- local save migration and failure handling

## End-to-End Coverage

End-to-end validation must cover:
- mobile-first board play on a 360px wide viewport
- progress persistence after reload
- offline relaunch after first successful load
- player-visible save failure messaging when persistence is unavailable

## Manual Validation

Manual QA must confirm:
- the interface feels usable on touch devices
- motion and highlight states are readable and intentional
- the game remains understandable without desktop-only affordances

---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL unless the
feature specification or constitution requires validation for offline behavior,
storage handling, accessibility, or other risk-prone flows.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Static web app**: `src/`, `public/`, `tests/` at repository root
- **Single project library/tool**: `src/`, `tests/`
- Paths shown below assume a static web app - adjust based on plan.md structure

<!-- 
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.
  
  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/
  
  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment
  
  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize [language] project with the minimum required dependencies
- [ ] T003 [P] Configure linting and formatting tools
- [ ] T004 [P] Create or update PWA shell assets in public/ (manifest, icons,
  offline entry points as needed)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [ ] T005 Define local storage keys, versioning, and migration strategy
- [ ] T006 [P] Implement storage access utilities with unavailable/full/reset
  handling
- [ ] T007 [P] Establish responsive layout primitives for the smallest supported
  viewport
- [ ] T008 Configure offline caching or service worker behavior required by the
  plan
- [ ] T009 Establish error and empty-state UX for offline and storage failure
  scenarios

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Integration test for the primary local-first user journey in tests/integration/[name].test.[ext]
- [ ] T011 [P] [US1] Offline or storage-behavior test for the same journey in tests/integration/[name]-offline.test.[ext]

### Implementation for User Story 1

- [ ] T012 [P] [US1] Implement feature state model in src/app/[feature]/state.[ext]
- [ ] T013 [P] [US1] Implement local storage persistence in src/storage/[feature].[ext]
- [ ] T014 [US1] Implement primary mobile-first UI flow in src/components/[feature]/
- [ ] T015 [US1] Integrate offline and recovery messaging in src/app/[feature]/[file].[ext]
- [ ] T016 [US1] Add validation, empty states, and storage failure handling
- [ ] T017 [US1] Update manifest or service worker hooks if the story changes installability or offline behavior

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [ ] T018 [P] [US2] Integration test for the user journey in tests/integration/[name].test.[ext]
- [ ] T019 [P] [US2] Responsive or accessibility-focused test for the same journey in tests/integration/[name]-responsive.test.[ext]

### Implementation for User Story 2

- [ ] T020 [P] [US2] Extend feature state or derived view model in src/app/[feature]/[file].[ext]
- [ ] T021 [US2] Implement supporting UI flow in src/components/[feature]/
- [ ] T022 [US2] Update storage integration or migration handling if needed
- [ ] T023 [US2] Integrate with User Story 1 components while preserving independent testability

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [ ] T024 [P] [US3] Integration test for the user journey in tests/integration/[name].test.[ext]
- [ ] T025 [P] [US3] Installation, offline, or recovery-path test in tests/integration/[name]-install.test.[ext]

### Implementation for User Story 3

- [ ] T026 [P] [US3] Implement additional state or UI module in src/app/[feature]/[file].[ext]
- [ ] T027 [US3] Implement the user-facing flow in src/components/[feature]/
- [ ] T028 [US3] Update offline, installability, or recovery behavior touched by the story

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates in docs/
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Performance optimization across all stories
- [ ] TXXX [P] Additional unit tests (if requested) in tests/unit/
- [ ] TXXX Security hardening
- [ ] TXXX Verify manifest, installability, and offline behavior after integration
- [ ] TXXX Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- State and storage contracts before composed UI flows
- Core implementation before offline/recovery refinement
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- State, storage, and UI modules within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Integration test for the primary journey in tests/integration/[name].test.[ext]"
Task: "Offline or storage-behavior test in tests/integration/[name]-offline.test.[ext]"

# Launch independent implementation tasks for User Story 1 together:
Task: "Implement feature state model in src/app/[feature]/state.[ext]"
Task: "Implement local storage persistence in src/storage/[feature].[ext]"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Include offline, storage, and mobile-first validation tasks whenever a story touches those areas
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, backend assumptions, and cross-story dependencies that break independence

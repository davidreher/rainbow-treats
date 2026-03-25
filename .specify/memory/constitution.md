<!--
Sync Impact Report
Version change: template -> 1.0.0
Modified principles:
- Placeholder Principle 1 -> I. Static Frontend Delivery
- Placeholder Principle 2 -> II. Local-First Data Ownership
- Placeholder Principle 3 -> III. Mobile-First PWA Experience
- Placeholder Principle 4 -> IV. Lean Dependency Discipline
- Placeholder Principle 5 -> V. Verifiable Simplicity
Added sections:
- Technical Boundaries
- Delivery Workflow
Removed sections:
- None
Templates requiring updates:
- ✅ .specify/templates/plan-template.md
- ✅ .specify/templates/spec-template.md
- ✅ .specify/templates/tasks-template.md
- ✅ .specify/templates/constitution-template.md (already compatible; no changes required)
- ✅ .specify/templates/commands/*.md (directory absent; no changes required)
Follow-up TODOs:
- None
-->

# Rainbow Treats Constitution

## Core Principles

### I. Static Frontend Delivery
All shipped features MUST run as a client-rendered web application that can be
deployed as static assets without server-side rendering, server APIs, edge
functions, or background workers. Any proposed capability that depends on
backend execution is out of scope unless this constitution is amended first.
Rationale: the product requirement is a zero-backend deployment model with a
simple hosting surface and predictable operating cost.

### II. Local-First Data Ownership
The application MUST persist user state on-device only, using browser-managed
storage with `localStorage` as the default persistence mechanism. Features MUST
remain functional without network connectivity after the initial load, and they
MUST degrade safely when storage is unavailable, full, or cleared. No feature
may require remote accounts, cloud sync, or server-backed recovery flows.
Rationale: local-only persistence is a hard product constraint and must shape
both data modeling and failure handling from the start.

### III. Mobile-First PWA Experience
Every feature MUST be designed for small touch screens before larger layouts are
considered. Deliverables MUST include Progressive Web App essentials: installable
metadata, offline-capable asset behavior, responsive layouts, and accessible
interaction patterns that work with touch, keyboard, and screen readers.
Rationale: the primary experience is a mobile-first PWA, so installability,
offline use, and accessibility are product requirements rather than polish.

### IV. Lean Dependency Discipline
The default implementation choice MUST favor platform capabilities and framework
primitives over third-party packages. A new dependency is allowed only when it
removes substantial complexity, risk, or maintenance burden that cannot be met
reasonably with native browser APIs or existing project tooling. Each added
dependency MUST be justified in the implementation plan.
Rationale: minimizing external dependencies reduces bundle size, security
exposure, upgrade churn, and long-term maintenance cost.

### V. Verifiable Simplicity
Every feature MUST define a user-visible slice that can be validated end to end
inside a static browser environment. Plans, specs, and tasks MUST prefer the
smallest implementation that satisfies the requirement, with explicit rejection
of unnecessary abstractions, premature state management layers, and speculative
extensibility. If complexity is introduced, the simpler rejected alternative
MUST be documented.
Rationale: a static local-first app is easiest to evolve when behavior stays
easy to inspect, test, and reason about.

## Technical Boundaries

- Allowed runtime surface: static HTML, CSS, JavaScript, images, fonts, web app
	manifest, service worker, and browser APIs available in a modern evergreen
	browser.
- Disallowed architectural elements unless the constitution is amended: SSR,
	backend services, remote databases, authentication servers, analytics beacons,
	cloud functions, and persistent data transfer to third parties.
- Persistence scope MUST be documented per feature, including what is stored in
	`localStorage`, how schema changes are handled, and what the user loses if the
	browser clears storage.
- Performance expectations for primary journeys MUST be captured in specs using
	user-facing outcomes such as time to interact, tap target usability, and
	offline recovery behavior.
- Accessibility and offline behavior are release criteria, not optional follow-up
	work.

## Delivery Workflow

- Feature specs MUST describe offline behavior, local storage behavior, mobile
	breakpoints, installability impact, and any dependency additions.
- Implementation plans MUST include a Constitution Check that verifies static
	deployability, local-only persistence, mobile-first UX, dependency restraint,
	and a simpler-alternative review.
- Task lists MUST organize work by user story and include tasks for manifest or
	service worker changes, storage schema updates, responsive behavior, and manual
	or automated verification of offline and storage-failure flows whenever those
	concerns are affected.
- Reviews MUST reject features that introduce hidden backend assumptions,
	non-essential packages, or desktop-first layouts.
- Documentation for users and contributors MUST state any storage limits,
	offline caveats, and recovery behavior introduced by the feature.

## Governance

This constitution overrides conflicting guidance in feature specs, plans, tasks,
and contributor notes. Amendments require: (1) a written proposal describing the
rule change and affected artifacts, (2) explicit update of dependent templates,
and (3) approval before implementation work relying on the new rule begins.

Versioning policy follows semantic versioning for governance documents:

- MAJOR: incompatible principle removals, reversals, or redefinitions.
- MINOR: new principle or materially expanded governance requirement.
- PATCH: clarifications, wording refinements, and non-semantic edits.

Compliance review is mandatory for every plan and pull request. Reviewers MUST
verify that the work remains statically deployable, uses only local persistence,
keeps the PWA mobile-first, justifies each added dependency, and documents any
complexity tradeoff introduced.

**Version**: 1.0.0 | **Ratified**: 2026-03-24 | **Last Amended**: 2026-03-24

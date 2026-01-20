# Model Base Refactor Plan

## Target
Clarify lifecycle and state handling in `src/Model/base-model.js` while keeping public behavior stable.

## Goals
- Make freeze/reset/complete semantics explicit and testable.
- Reduce nested state branching and implicit invariants.
- Improve readability of core model lifecycle transitions.

## Non-Goals
- No change to external API surface or schema format support.
- No changes to Items/Properties model public contracts.

## Task list
- Add lifecycle tests for freeze, reset, complete, and error paths.
- Extract state guards into helpers (e.g., `assertMutable`, `assertFrozen`).
- Consolidate lifecycle transitions into a single, clearly labeled section.
- Make `reset({ complete })` handling explicit and documented in code.
- Isolate metadata updates into a helper to reduce side-effect coupling.
- Update docs/comments where lifecycle behavior is subtle.

## Risks
- Edge cases where reset interacts with child models or observers.
- Hidden reliance on implicit state flags.

## Validation
- Run full Model test suite with added lifecycle regression tests.
- Add targeted tests for reset with async observers.

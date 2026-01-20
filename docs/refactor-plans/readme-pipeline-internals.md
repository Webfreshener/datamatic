# Pipeline Internals Refactor Plan

## Target
Refactor Pipeline internals in `src/Pipeline/Pipeline.js` into smaller, focused modules while preserving public behavior.

## Goals
- Reduce file size and branching complexity.
- Make callback orchestration, lifecycle/reset, and executor wiring independently testable.
- Preserve async/promise callback behavior and existing external API shape.

## Non-Goals
- No changes to public method names or signatures.
- No behavior changes unless explicitly documented and tested.

## Task list
- Add regression tests for reset, async callbacks, and error paths.
- Create `PipelineCallbacks` module for callback init/invoke/error handling.
- Create `PipelineLifecycle` module for start/stop/reset and state guards.
- Create `PipelineWiring` module for executor/observer subscriptions.
- Replace inline logic in `Pipeline.js` with composition of the new modules.
- Add unit tests for each module and update Pipeline integration tests.

## Risks
- Subtle behavior changes around callback ordering or reset semantics.
- Hidden coupling between executor wiring and lifecycle state.

## Validation
- Run existing Pipeline tests plus new module-level tests.
- Add regression tests for async callback ordering and reset edge cases.

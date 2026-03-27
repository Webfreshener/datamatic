# Pipeline V2 Requirements

This document translates the current `Pipeline` runtime and tests into explicit requirements for:

- `pipeline-v2-core`
- `pipeline-v2-adapters`
- `pipeline-v2-parity`

It is based on:

- [src/Pipeline/Pipeline.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/Pipeline.js)
- [src/Pipeline/Properties.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/Properties.js)
- [src/Pipeline/Utils.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/Utils.js)
- [src/Pipeline/Validator.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/Validator.js)
- [src/Pipeline/Pipe.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/Pipe.test.js)
- [src/Pipeline/Pipe-api.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/Pipe-api.test.js)
- [src/Pipeline/coverage-extra.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/coverage-extra.test.js)

## Current Behavioral Shape

Current `Pipeline` behavior is not just "a list of transforms". It combines:

- direct execution via `exec(data)`
- push-mode execution via `write(data)`
- observer-driven notification
- schema/config coercion
- validator wrapping
- queue/rate shaping
- pipeline linking and merging
- trace-like iteration via `yield()`

That means Phase 2 must separate what becomes `Core V2` from what is retained only through compat and observe.

## Core Runtime Requirements

These are the behaviors Phase 2 must preserve conceptually in `PipelineV2`, even if the API shape changes:

1. Stage execution order must remain deterministic.
2. Sync and async stage composition must both be supported.
3. Validation stages and transform stages must remain composable in a single pipeline.
4. Empty/default construction must still yield a valid pass-through pipeline behavior in legacy paths.
5. Core execution must not require subscriptions, listeners, RxJS, Proxy, or runtime code generation.

## Legacy Behavior That Must Remain Reachable

These behaviors do not belong in `Core V2`, but must remain reachable through adapters or compat:

- `exec(data)` as direct one-shot execution
- `write(data)` as push-mode ingress
- `promise(data)` as subscription-wrapped promise flow
- `pipe(...)` chaining behavior
- `link(...)` / `unlink(...)`
- `split(...)`
- `merge(...)`
- `throttle(...)` / `unthrottle(...)`
- `sample(n)`
- `subscribe(...)`
- `close()` / `writable`
- `tap()` / `toJSON()` / `toString()`

## Replace-Not-Preserve Behavior

These behaviors should be replaced, not carried into `Core V2` unchanged:

- `yield(data)` using `new Function(...)`
- hidden state cloning semantics in `clone()`
- listener wiring as part of core execution
- schema/config coercion embedded inside core execution constructors

## Adapter Requirements

Phase 2 adapters should preserve these current semantics:

1. Function inputs are accepted as transform stages.
2. Schema-looking inputs are accepted as validator stages.
3. Validator instances can be wrapped as executable stages.
4. Iterator-like and array-wrapped stage flows remain supported in legacy paths.
5. Validation failures in legacy execution still surface through the current error channel patterns.
6. `yield()` replacement must expose a trace/introspection path without runtime code generation.

## Current Error and Notification Semantics

Current behavior visible in tests includes:

- `exec(data)` throws on validation failure
- `write(data)` pushes errors through observers
- a pipeline may remain reusable across multiple writes
- async pipelines notify through subscription paths
- a stage returning `false` can surface downstream validation-style error behavior

Phase 2 must not blur these paths unintentionally. If V2 core simplifies them, compat must restore the observable legacy distinctions.

## Parity Coverage Requirements

Before `pipeline-v2-parity` can be considered complete, coverage should explicitly pin:

1. Sync stage ordering.
2. Async stage ordering.
3. Direct execution vs push execution behavior.
4. Validation failure behavior for `exec(data)`.
5. Validation failure behavior for `write(data)` observer flows.
6. Function/schema/validator coercion behavior in legacy adapter paths.
7. `pipe`, `split`, and `merge` migration behavior.
8. `promise(data)` behavior as a compat surface.
9. `throttle`, `unthrottle`, and `sample` legacy behavior if retained in compat.
10. Trace behavior as the supported replacement for `yield()`.

## Recommended Phase 2 Split

### `pipeline-v2-core`

Own:

- explicit stage contract
- async-first `run(input, ctx)`
- deterministic stage execution
- plain result/error contract

Do not own:

- subscriptions
- push-mode ingress
- queue shaping
- link/merge orchestration
- runtime code generation

### `pipeline-v2-adapters`

Own:

- transform adapter
- validator adapter
- legacy coercion compatibility seams
- trace replacement for `yield()`

### `pipeline-v2-parity`

Own:

- regression coverage for the current legacy pathways that compat must preserve
- explicit proof that core/adapters reproduce required observable behavior where intended

## Immediate Backlog Impact

This document tightens the acceptance criteria for:

- `pipeline-v2-core`
- `pipeline-v2-adapters`
- `pipeline-v2-parity`

# Observe V2 Requirements

This document translates the current Model and Pipeline observation behavior into explicit requirements for:

- `observe-event-model`
- `observable-model`
- `observable-pipeline`

It is based on:

- [src/Model/observability.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/observability.test.js)
- [src/Model/model-rxjs.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/model-rxjs.test.js)
- [src/Model/_observerBuilder.js](/Users/vanschroeder/Workspace/datamatic/src/Model/_observerBuilder.js)
- [src/Model/_branchNotifier.js](/Users/vanschroeder/Workspace/datamatic/src/Model/_branchNotifier.js)
- [src/Pipeline/vxBehaviorSubject.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/vxBehaviorSubject.js)
- [src/Pipeline/vxBehaviorSubject.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/vxBehaviorSubject.test.js)
- [src/Pipeline/Pipe.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/Pipe.test.js)
- [src/Pipeline/Pipe-api.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/Pipe-api.test.js)

## Current Behavioral Shape

Current observation behavior is not just "subscribe to changes". It includes:

- root-level subscriptions
- path-scoped subscriptions
- distinct `next`, `error`, and `complete` channels
- unsubscribe semantics
- model-path fanout for root and ancestor notifications
- completion semantics tied to freeze/close
- pipeline observer behavior for sync, async, and invalid executions

Observe V2 should preserve the behavior that matters while removing RxJS from the new wrapper implementation.

## Shared Event Model Requirements

Observe V2 should preserve these conceptual semantics:

1. `next`, `error`, and `complete` are distinct channels.
2. Subscriptions can be created from either an observer object or a single `next` function.
3. Unsubscribing stops future notifications.
4. Completing an observable path prevents future `next` notifications for that path.
5. Error delivery remains channel-specific and does not masquerade as `next`.

## ObservableModel Requirements

Current Model observation semantics that must remain reachable:

1. Root subscriptions receive model updates.
2. BaseModel/node subscriptions receive updates for that node.
3. Path-scoped subscriptions receive updates when the subscribed path changes.
4. Invalid writes surface through the `error` channel, not `next`.
5. `freeze()` produces `complete` semantics and prevents future `next` events.
6. Unsubscribing prevents further notifications.
7. Model notifications currently fan out along model paths rather than only the exact leaf.

Important implementation note:

- current model `next` dispatch is asynchronous through notifier scheduling
- current model `error` and `complete` are path-aware and wrap error payloads with path information

Observe V2 may change implementation, but should not silently change these semantics where compat depends on them.

## ObservablePipeline Requirements

Current pipeline observation semantics that must remain reachable:

1. Pipelines support observer-object subscriptions.
2. Pipelines support `next`, `error`, and `complete` channels.
3. Invalid `write(data)` flows emit through `error`.
4. Async pipeline stages still emit through the observation path.
5. Pipelines can remain reusable across multiple writes until explicitly closed/frozen.
6. Completion is distinct from ordinary next/error signaling.

Observe V2 should preserve these semantics while keeping execution plain in `PipelineV2` core and moving observation into the wrapper.

## Replace-Not-Preserve Behavior

These current implementation details should not survive as hard requirements:

- RxJS `BehaviorSubject`
- `skip(1)` as the mechanism for suppressing seed emissions
- direct exposure of RxJS observables
- weakmap-hidden observer internals

These should be replaced with explicit wrapper-owned emitter/subscription mechanics.

## Event Taxonomy Requirements

Phase 4 should define explicit event taxonomies rather than inheriting them implicitly from current subjects.

At minimum:

- Model wrapper should define explicit update, error, and completion semantics.
- Pipeline wrapper should define explicit run/stage/error/completion semantics.
- Wrapper event payloads should be explicit about whether they carry model state, result state, path information, or error information.

## Parity Coverage Requirements

Before Observe V2 work is considered complete, coverage should explicitly pin:

1. Root model subscription behavior.
2. Path-scoped model subscription behavior.
3. Node-local model subscription behavior.
4. Unsubscribe behavior for model and pipeline wrappers.
5. Model invalid-write error behavior.
6. Model freeze-to-complete behavior.
7. Pipeline invalid-write error behavior.
8. Pipeline async next behavior.
9. Pipeline completion behavior where compat claims support.

## Recommended Phase 4 Split

### `observe-event-model`

Own:

- generic emitter/subscription primitive
- observer object vs function subscription handling
- unsubscribe semantics
- explicit event channel taxonomy

### `observable-model`

Own:

- root subscriptions
- path-scoped subscriptions
- model completion/error mapping
- path-aware fanout rules

### `observable-pipeline`

Own:

- run/stage/result observation
- error/completion mapping for pipeline wrappers
- async execution observation behavior

## Immediate Backlog Impact

This document tightens the acceptance criteria for:

- `observe-event-model`
- `observable-model`
- `observable-pipeline`

# Observability Test Plan (Public API)

Goal: strengthen tests around Datamatic's public observability surface without relying on internal classes such as `ObserverBuilder`.

## Public observability API surface
- `Model.subscribe(observer)` and `BaseModel.subscribe(observer)`
- `Model.subscribeTo(path, observer)` and `BaseModel.subscribeTo(path, observer)`
- Observer callbacks: `next`, `error`, `complete`
- `freeze()` triggering `complete`
- Error notifications from validation failures

## Usage patterns to verify
- Subscribe via `Model.subscribe` and receive `next` when `model` is set.
- Subscribe via `BaseModel.subscribe` and receive `next` when `model` is set on that node.
- Subscribe via `subscribeTo(path, ...)` and receive `next` for nested changes.
- Observer form variants:
  - object with `next`/`error`/`complete`
  - function shorthand (`subscribe(fn)` means `next`)
- Unsubscribe stops receiving notifications.

## Edge cases worth covering
- Multiple subscribers receive the same notification (fan-out behavior).
- Sequential updates do not skip notifications.
- `freeze()` triggers `complete` and prevents further `next` calls.
- Validation errors call `error` and do not emit `next`.
- Invalid `subscribeTo` path:
  - path does not exist at subscription time
  - path exists later after model expansion
- Root vs. child subscription:
  - root observer receives notifications from nested updates
  - child observer only receives notifications for its subtree
- Replacing the full model object emits exactly one `next`.
- Setting a property vs. setting the entire model:
  - property set emits `next` once for that subtree
- Subscribing after a change should not replay old values (BehaviorSubject is used internally but public API should be consistent and predictable).

## Proposed test additions
- `Model.subscribe` happy path:
  - set `model` and assert `next` called with JSON string output.
- `BaseModel.subscribe` happy path:
  - subscribe to `root.model.$model`, set `root.model = {...}`, assert `next`.
- `subscribeTo(path)`:
  - subscribe to `properties/name`, set `root.model = {name: "x"}`, assert `next`.
- Unsubscribe:
  - subscribe, update, unsubscribe, update again, assert only one call.
- Error path:
  - set invalid value, assert `error` called and `next` not called.
- Complete path:
  - subscribe, call `freeze()`, assert `complete` called, further updates ignored.

## Notes
- Tests should avoid `ObserverBuilder` directly; use only `Model`/`BaseModel`.
- Prefer deterministic async handling:
  - wrap in `Promise` with timeout
  - assert call counts rather than timing gaps where possible

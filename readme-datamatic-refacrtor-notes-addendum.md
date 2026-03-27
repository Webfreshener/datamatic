# Datamatic Refactor Notes and Addendum

## TL;DR

Reactivity should stop being the mechanism that makes models and pipelines work. It should become an instrumentation layer around explicit operations. That principle fits the current repo’s pain points well, but the wrapper plan needs to account for a few concrete realities:

- current observation is path-aware, not just root-aware
- current observers use `next` / `error` / `complete` semantics
- current pipeline usage mixes pull-style `exec()` with push-style `write()`
- throttling, sampling, piping, and merging exist today and need a destination

## Table of Contents

- [Current Reactive Shape](#current-reactive-shape)
- [Core Design Change](#core-design-change)
- [Proposed Wrapper Model](#proposed-wrapper-model)
- [Event Taxonomy](#event-taxonomy)
- [How This Maps from the Current API](#how-this-maps-from-the-current-api)
- [Gaps in the Original Wrapper Plan](#gaps-in-the-original-wrapper-plan)
- [Recommendations](#recommendations)
- [Assessment](#assessment)

## Current Reactive Shape

Today reactivity is not an add-on. It is part of the runtime contract.

### Model side

- `Model.subscribe(...)` exists on the core class.
- `Model.subscribeTo(path, ...)` exists for path-level observation.
- `ObserverBuilder` creates RxJS `BehaviorSubject`-backed channels for `next`, `error`, and `complete`.
- `PropertiesModel` and `ItemsModel` emit notifications as a consequence of Proxy-driven mutations.

### Pipeline side

- `Pipeline.subscribe(...)` exists on the core class.
- `Pipeline.write(data)` is the observable ingress path.
- `Pipeline.exec(data)` is a direct execution path.
- `Pipeline.promise(data)` is another convenience layer on top.
- `PipeListener` connects validation, execution, async handling, and output notification together.

This coupling is exactly why the redesign should separate execution from observation.

## Core Design Change

Move from this:

```text
core object = state + validation + execution + subscriptions + propagation
```

To this:

```text
core object = state + validation + execution
wrapper = observation around explicit operations
```

That means:

- `DataModel` does not know about subscribers
- `Pipeline` does not know about subscribers
- wrappers emit events around calls like `set()`, `update()`, and `run()`
- RxJS becomes an adapter target instead of a required runtime dependency

## Proposed Wrapper Model

### Observable model wrapper

```ts
type ModelEvent<T> =
  | { type: "set"; path: string; value: unknown; snapshot: T }
  | { type: "update"; path: string; snapshot: T }
  | { type: "replace"; snapshot: T }
  | { type: "reset"; snapshot: T }
  | { type: "freeze"; snapshot: T }
  | { type: "validate:ok"; path?: string; snapshot: T }
  | { type: "validate:error"; path?: string; errors: ValidationError[]; snapshot: T }

class ObservableModel<T> {
  constructor(private readonly model: DataModel<T>) {}

  subscribe(listener: (event: ModelEvent<T>) => void): Unsubscribe
  subscribeTo?(path: string, listener: (event: ModelEvent<T>) => void): Unsubscribe
  set(path: string, value: unknown): this
  update(path: string, fn: (current: unknown) => unknown): this
  validate(path?: string): ValidationResult
  snapshot(): T
}
```

### Observable pipeline wrapper

```ts
type PipelineEvent<I, O> =
  | { type: "run:start"; input: I }
  | { type: "stage:start"; index: number; input: unknown }
  | { type: "stage:success"; index: number; input: unknown; output: unknown }
  | { type: "stage:error"; index: number; input: unknown; error: unknown }
  | { type: "run:success"; input: I; output: O }
  | { type: "run:error"; input: I; error: unknown }
  | { type: "run:cancelled"; input: I }

class ObservablePipeline<I, O> {
  constructor(private readonly pipeline: Pipeline<I, O>) {}

  subscribe(listener: (event: PipelineEvent<I, O>) => void): Unsubscribe
  run(input: I, ctx?: StageContext): Promise<O>
}
```

### Minimal emitter

```ts
class Emitter<T> {
  #listeners = new Set<(event: T) => void>()

  subscribe(listener: (event: T) => void) {
    this.#listeners.add(listener)
    return () => this.#listeners.delete(listener)
  }

  emit(event: T) {
    for (const listener of this.#listeners) listener(event)
  }
}
```

## Event Taxonomy

The events should stay narrow and obvious.

### Model events

Keep:

- `set`
- `update`
- `replace`
- `reset`
- `freeze`
- `validate:ok`
- `validate:error`

Avoid:

- deep internal traversal events
- leaf-by-leaf implementation noise
- hidden mutation notifications not tied to a public method call

### Pipeline events

Keep:

- `run:start`
- `stage:start`
- `stage:success`
- `stage:error`
- `run:success`
- `run:error`
- `run:cancelled` when `AbortSignal` is supported

Avoid:

- event graphs that become a second execution engine

## How This Maps from the Current API

### Current model style

Today:

```js
obj.subscribe(...)
obj.model = ...
obj.model.topScores[0].score++
```

Proposed:

```ts
const model = new DataModel({ schemaId: "root#", initial, registry })
const observed = new ObservableModel(model)

const unsub = observed.subscribe((event) => {
  console.log(event.type, event)
})

observed.set("topScores.0.score", 12300001)
observed.validate("topScores")
```

### Current pipeline style

Today:

```js
pipe.subscribe(listener)
pipe.write(input)
const result = pipe.exec(input)
```

Proposed:

```ts
const pipeline = new Pipeline([stage1, stage2])
const observed = new ObservablePipeline(pipeline)

observed.subscribe((event) => {
  console.log(event.type)
})

const result = await observed.run(input)
```

If no observation is needed:

```ts
const result = await pipeline.run(input)
```

## Gaps in the Original Wrapper Plan

### 1. Path-aware observation needs an explicit home

Current `Model.subscribeTo(path, observer)` is a real capability.

Recommendation: either:

- keep `subscribeTo(path, ...)` on `ObservableModel`, or
- provide path filters as a first-class helper

Dropping path awareness entirely would be a regression.

### 2. `complete` semantics still need a story

Current model and pipeline observation includes `complete`.

Recommendation:

- model completion should map to `freeze` or a dedicated completion event
- pipeline completion should map to `close()` in compat, not necessarily in the core wrapper

### 3. Push-mode pipeline features need a destination

The new `run()`-only wrapper is clean, but the current pipeline also supports:

- `write()`
- `sample()`
- `throttle()`
- `merge()`
- `pipe()`

Recommendation: decide where these live:

- in compat only
- in a future stream-oriented package
- or as explicit queue/channel abstractions outside the core

They should not quietly disappear.

### 4. Validation policy should be configurable at the wrapper boundary

Two valid policies exist:

1. mutate only on valid writes
2. emit attempted mutation and report validation result separately

Recommendation: keep this configurable in the wrapper, not in the core runtime.

### 5. RxJS adapter should sit on top of observe, not beside core

Recommended layering:

```text
core -> observe -> rxjs adapter
```

Not:

```text
core -> rxjs internals
```

## Recommendations

### 1. Keep `subscribe()` out of the new core classes

This is the main architectural win. Do not compromise it.

### 2. Preserve the distinction between composition and observation

Compose plain pipelines first:

```ts
const p1 = new Pipeline([stageA, stageB])
const p2 = new Pipeline([stageC])
const p3 = p1.concat(p2)
```

Observe the result second:

```ts
const observed = new ObservablePipeline(p3)
```

### 3. Support path filtering in the observer layer

This is the cleanest place to preserve today’s `subscribeTo()` capability.

### 4. Keep push-mode semantics out of the new core

If push-style processing is still important, model it explicitly as:

- compat behavior
- a stream wrapper
- or a channel abstraction

Do not hide it inside the new core pipeline.

### 5. Define completion and cancellation semantics early

These are where wrapper plans usually get vague. They should be pinned down before implementation.

## Assessment

The addendum identifies one of the most important architecture changes in the whole refactor: execution should no longer depend on reactive plumbing. That part is correct and well justified by the current code. The main improvement needed is sharper scope definition around path subscriptions, completion behavior, and the existing push-style pipeline features. If those are handled explicitly, the wrapper-based design is a strong replacement for the repo’s current RxJS-heavy reactive core.

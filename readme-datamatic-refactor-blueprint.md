# Datamatic Refactor Blueprint

## TL;DR

The core direction is sound: move Datamatic away from Proxy-first mutation tracking and implicit pipeline coercion toward explicit model operations, explicit stage contracts, and optional observability. The current repo shape supports that thesis, but the refactor plan needs to account for the real surface area that exists today:

- `Model` is more than proxy mutation. It also exposes `freeze()`, `fromJSON()`, `subscribeTo()`, schema lookup helpers, and model-to-pipeline bridging.
- `Pipeline` is more than `exec()`. It currently includes `write()`, `promise()`, `pipe()`, `merge()`, `sample()`, `throttle()`, `clone()`, and `yield()`.
- The package still ships as a single JavaScript bundle with `node`, `umd`, and `window` outputs.
- Schema handling includes Ajv options and draft compatibility concerns that should not be treated as incidental.

## Table of Contents

- [Current Repo Snapshot](#current-repo-snapshot)
- [Refactor Goals](#refactor-goals)
- [Keep vs Replace](#keep-vs-replace)
- [Target Architecture](#target-architecture)
- [Old API to New API Mapping](#old-api-to-new-api-mapping)
- [Gaps Against the Current Codebase](#gaps-against-the-current-codebase)
- [Recommendations](#recommendations)
- [Suggested Implementation Order](#suggested-implementation-order)

## Current Repo Snapshot

The repo today is a single-package JavaScript library with bundled distribution targets:

```text
datamatic/
  package.json
  webpack.config.js
  src/
    index.js
    Model/
      index.js
      base-model.js
      propertiesModel.js
      itemsModel.js
      _observerBuilder.js
      ...
    Pipeline/
      Pipeline.js
      Validator.js
      Executor.js
      Properties.js
      ...
  dist/
  integration/
```

The key runtime characteristics are:

- `src/index.js` exports only `Model` and `Pipeline`.
- `src/Pipeline/index.js` separately exports `Pipeline` and `TxValidator`.
- `Model` is implemented as a Proxy-backed tree over `PropertiesModel` and `ItemsModel`.
- `Model` observability is built directly into the core via RxJS `BehaviorSubject`-based helpers.
- `Pipeline` accepts functions, validators, pipelines, and schema-like objects through dynamic coercion in `Pipeline.getExecs()`.
- `Pipeline.write()` drives the observable path, while `Pipeline.exec()` is a direct execution path.
- `Pipeline.yield()` currently builds a generator using `new Function(...)`.
- Runtime state is spread across multiple `WeakMap` stores and helper singletons.

## Refactor Goals

Move from:

- implicit Proxy mutation tracking
- polymorphic pipeline stage coercion
- hidden `WeakMap` runtime state
- execution and observation being tightly coupled
- runtime code generation in `yield()`

Move to:

- explicit model operations
- explicit stage contracts
- plain object and class state
- one async-first execution model
- optional observation as a wrapper
- traceability without code generation

## Keep vs Replace

### Keep

These are real product strengths and should survive the redesign:

- JSON Schema validation as a first-class capability
- model-plus-pipeline as the mental model of the library
- composable transformation steps
- the ability to observe model and pipeline activity
- compatibility paths for existing consumers during migration

### Replace

These are implementation choices, not product requirements:

- Proxy-heavy model mutation semantics
- RxJS being foundational to the core runtime
- `Pipeline.getExecs()` and related duck-typed coercion in the hot path
- `yield()` code generation
- `Properties` acting as a combined config, state, and listener hub

## Target Architecture

The target architecture should separate the core runtime from observation and compatibility:

```text
src/
  index.ts

  schema/
    SchemaRegistry.ts
    DataValidator.ts
    types.ts

  model/
    DataModel.ts
    path.ts
    types.ts

  pipeline/
    Pipeline.ts
    Stage.ts
    adapters.ts
    trace.ts
    types.ts

  observe/
    Emitter.ts
    ObservableModel.ts
    ObservablePipeline.ts

  compat/
    LegacyModelAdapter.ts
    LegacyPipelineAdapter.ts
```

At the API level:

```ts
type StageContext = {
  signal?: AbortSignal
  meta?: Record<string, unknown>
  hooks?: {
    onStageStart?: (index: number, input: unknown) => void
    onStageSuccess?: (index: number, input: unknown, output: unknown) => void
    onStageError?: (index: number, input: unknown, error: unknown) => void
  }
}

type Stage<I, O> = (input: I, ctx: StageContext) => O | Promise<O>
```

```ts
class DataModel<T> {
  get(path?: string): unknown
  set(path: string, value: unknown): this
  update(path: string, fn: (current: unknown) => unknown): this
  replace(next: T): this
  validate(path?: string): ValidationResult
  snapshot(): T
  reset(): this
  freeze?(): this
}
```

```ts
class Pipeline<I, O> {
  constructor(stages: Stage<any, any>[], options?: { name?: string })

  run(input: I, ctx?: StageContext): Promise<O>
  append<N>(stage: Stage<O, N>): Pipeline<I, N>
  concat<N>(next: Pipeline<O, N>): Pipeline<I, N>
}
```

## Old API to New API Mapping

### Model Side

| Current API | Proposed API |
| --- | --- |
| `new Model({ schemas })` | `new DataModel({ schemaId, initial, registry })` |
| `model.foo = "x"` | `model.set("foo", "x")` |
| `model.items.push(item)` | `model.update("items", (items = []) => [...items, item])` |
| `model.validate(path, value)` | `model.validate(path?)` or `validator.validate(schemaId, value)` |
| `model.subscribe(...)` | `new ObservableModel(model).subscribe(...)` |
| `model.subscribeTo(path, ...)` | filtered wrapper subscription or dedicated `subscribeTo(path, ...)` wrapper helper |
| `Model.fromJSON(json)` | explicit factory on core or compat adapter |

### Pipeline Side

| Current API | Proposed API |
| --- | --- |
| `new Pipeline(a, b, c)` | `new Pipeline([stageA, stageB, stageC])` |
| `exec(data)` | `await run(data)` |
| `write(data)` | `await observed.run(data)` or compat push wrapper |
| `pipe(next)` | `concat(next)` |
| `promise(data)` | `run(data)` |
| validator object in constructor | `fromValidator(schemaId, validator)` |
| schema/function/object coercion | explicit adapters only |
| `yield(data)` | `tracePipeline(pipeline, data)` or async iterator wrapper |

## Gaps Against the Current Codebase

The original blueprint was directionally right but incomplete. These gaps should be addressed before implementation starts.

### 1. Public API coverage is broader than the plan currently reflects

Current `Model` behavior includes:

- `freeze()`
- `fromJSON()`
- `getPath()`
- `getModelsInPath()`
- `getSchemaForKey()`
- `getSchemaForPath()`
- `pipeline(...)`
- `subscribeTo(path, observer)`

Current `Pipeline` behavior includes:

- `write()`
- `tap()`
- `promise()`
- `pipe()`
- `link()` and `unlink()`
- `split()`
- `merge()`
- `clone()`
- `close()`
- `sample()`
- `throttle()` and `unthrottle()`

Recommendation: explicitly classify each existing API as one of:

- preserve in core
- move to `observe`
- move to `compat`
- drop after deprecation

### 2. Distribution compatibility needs its own plan

Today the package builds:

- `dist/datamatic.node.js`
- `dist/datamatic.umd.js`
- `dist/datamatic.window.js`

The refactor plan should define whether those survive, and if so, how:

- subpath exports from one package
- a staged monorepo
- separate compatibility bundles

Recommendation: do not let packaging be an afterthought. The integration demos depend on it.

### 3. Schema compatibility needs explicit treatment

The current repo already carries:

- Ajv configuration pass-through
- optional `ajv-draft-04`
- schema lists and schema selection behavior

Recommendation: define the supported schema drafts and migration stance up front. Otherwise validation parity will be the first source of regressions.

### 4. Async semantics are currently partial, not absent

The plan correctly wants one async execution model, but the current pipeline already has partial promise-aware behavior through listeners and output handling.

Recommendation: document the exact semantic change:

- `exec()` today may return sync values and can surface promises indirectly
- `run()` tomorrow should always return `Promise<O>`
- compat should preserve existing expectations long enough for migration

### 5. Observability is not just a root-level concern

Current model observation is path-aware through `subscribeTo(path, observer)`.

Recommendation: preserve path-scoped observation somewhere, even if it moves out of the core. Removing it outright would be a meaningful capability loss.

## Recommendations

### 1. Treat this as a two-step architecture change, not one

First separate concerns inside the current package. Then decide whether the stabilized surfaces should become packages.

### 2. Preserve behavior by intent, not by accident

Write parity tests for:

- schema validation success and failure
- model replace, reset, freeze, and nested updates
- pipeline stage ordering
- pipeline validation plus transform composition
- observable notifications at root and path scope
- async stage behavior
- close and completion behavior

Do not promise parity for:

- proxy quirks
- implicit coercion of arbitrary objects
- codegen-backed generator behavior

### 3. Introduce new names before replacing old ones

Start with names like:

- `SchemaRegistry`
- `DataValidator`
- `DataModel`
- `PipelineV2` or `CorePipeline`

Then collapse naming only after the new surface is proven.

### 4. Keep RxJS out of the new core, but not out of the migration story

RxJS should become an adapter layer, not a hard dependency of the runtime. That said, compat needs to continue serving the current observer contract during transition.

### 5. Replace `yield()` with explicit trace support

Prefer:

```ts
type TraceStep = {
  index: number
  input: unknown
  output?: unknown
  error?: unknown
}

async function tracePipeline<I, O>(
  pipeline: Pipeline<I, O>,
  input: I,
): Promise<TraceStep[]>
```

This is easier to test, easier to reason about, and does not require dynamic code generation.

## Suggested Implementation Order

1. Freeze behavior with parity tests and a feature inventory.
2. Build `SchemaRegistry` and `DataValidator`.
3. Build `PipelineV2` with explicit stages and async-first `run()`.
4. Build `DataModel` with explicit mutation APIs.
5. Add `observe` wrappers.
6. Add compat adapters for legacy `Model` and `Pipeline`.
7. Migrate docs, examples, and integration demos.
8. Deprecate old entry points only after the new path is complete.

## Assessment

The blueprint is strong on direction and weak on migration detail. It correctly identifies the architectural problems in the current repo, and it points toward a cleaner system. The main improvement needed is broader scope accounting: distribution strategy, schema compatibility, path-scoped observation, and the full legacy public API all need to be treated as first-class work items rather than cleanup details.

# Datamatic Package Layout and Migration Sequence

## TL;DR

The target package split is sensible, but going straight from the current single-package JavaScript repo to a full monorepo is riskier than it needs to be. The recommended path is:

1. stabilize the new architecture inside the current package
2. expose subpath exports or internal modules
3. split into packages only after the new seams are proven

That sequence fits the current codebase better and reduces unnecessary migration churn.

## Table of Contents

- [Current Packaging Reality](#current-packaging-reality)
- [Recommended Target Layout](#recommended-target-layout)
- [What Belongs in Each Package](#what-belongs-in-each-package)
- [Migration Sequence](#migration-sequence)
- [Gaps to Close Before Starting](#gaps-to-close-before-starting)
- [Release Strategy](#release-strategy)
- [Documentation Strategy](#documentation-strategy)
- [Assessment and Recommendations](#assessment-and-recommendations)

## Current Packaging Reality

Today the repo is not a workspace. It is a single JavaScript package with:

- one `package.json`
- one `webpack.config.js`
- one top-level `src/` tree
- bundled `node`, `umd`, and `window` outputs
- colocated tests under `src/`
- integration demos that assume the current bundle layout

Current build outputs:

```text
dist/datamatic.node.js
dist/datamatic.umd.js
dist/datamatic.window.js
```

Current source layout:

```text
src/
  Model/
  Pipeline/
  schemas/
  index.js
```

This means the plan is not just a package split. It is also:

- a runtime redesign
- a public API redesign
- a build and publishing redesign
- likely a TypeScript migration

Those should not all land at once unless there is a strong reason.

## Recommended Target Layout

The long-term package layout is reasonable:

```text
datamatic/
  package.json
  pnpm-workspace.yaml
  tsconfig.base.json

  packages/
    core/
      src/
        schema/
        model/
        pipeline/
        index.ts

    observe/
      src/
        Emitter.ts
        ObservableModel.ts
        ObservablePipeline.ts
        index.ts

    rxjs/
      src/
        toModelObservable.ts
        toPipelineObservable.ts
        index.ts

    compat/
      src/
        LegacyModel.ts
        LegacyPipeline.ts
        warnings.ts
        index.ts
```

But the near-term implementation should start like this instead:

```text
src/
  core-v2/
    schema/
    model/
    pipeline/
  observe-v2/
  compat-v2/
  index.js
```

That gives the repo a lower-risk proving ground before package extraction.

## What Belongs in Each Package

### `@datamatic/core`

Owns:

- schema registry
- validation
- explicit model operations
- explicit pipeline execution
- tracing and debug hooks

Does not own:

- subscriptions
- RxJS integration
- legacy API facades
- UMD/window compatibility behavior

### `@datamatic/observe`

Owns:

- minimal event emitter
- `ObservableModel`
- `ObservablePipeline`
- path-filtered observation helpers if path subscriptions are retained

Depends only on `core`.

### `@datamatic/rxjs`

Owns:

- adapters from observe events to RxJS observables

Should contain no business logic and no validation logic.

### `@datamatic/compat`

Owns:

- legacy entry-point facades
- deprecation warnings
- compatibility shims for `exec`, `write`, `promise`, `subscribe`, and similar APIs

This package should be transitional, not strategic.

## Migration Sequence

### Phase 0: inventory and parity lock

Before moving files, define what must remain true.

Preserve:

- schema validation success and failure
- model replace, nested set, reset, and freeze behavior
- pipeline ordering and validation composition
- path-aware and root-aware observation
- async pipeline behavior
- completion and error propagation
- current bundle outputs until replacements exist

Do not preserve blindly:

- proxy-specific mutation tricks
- arbitrary constructor coercion
- `yield()` codegen behavior
- fragile listener edge cases

Deliverables:

- migration inventory
- parity test matrix
- clear preserve/move/drop decision log per public API

### Phase 1: build the new core in-place

Do this inside the current package first.

Deliverables:

- `src/core-v2/schema/SchemaRegistry.ts`
- `src/core-v2/schema/DataValidator.ts`
- `src/core-v2/model/DataModel.ts`
- `src/core-v2/pipeline/Pipeline.ts`
- `src/core-v2/pipeline/adapters.ts`
- `src/core-v2/pipeline/trace.ts`

Exit criteria:

- no RxJS dependency in the new core
- no Proxy dependency in the new core
- no `new Function(...)`
- deterministic async-first `run()`
- tests pass without depending on the legacy runtime

### Phase 2: add observation around the new core

Deliverables:

- `src/observe-v2/Emitter.ts`
- `src/observe-v2/ObservableModel.ts`
- `src/observe-v2/ObservablePipeline.ts`

Exit criteria:

- wrappers emit only around explicit operations
- path-level observation story is defined
- no core behavior depends on the observer layer

### Phase 3: add compatibility shims

Deliverables:

- `src/compat-v2/LegacyModel.ts`
- `src/compat-v2/LegacyPipeline.ts`
- `src/compat-v2/warnings.ts`

Compat should cover the migration-critical parts of today’s surface:

- `Model`
- `Pipeline`
- `TxValidator`
- `exec()`
- `write()`
- `promise()`
- `subscribe()` and `subscribeTo()`
- `freeze()`
- `fromJSON()`

Exit criteria:

- representative legacy examples run
- warnings exist only in compat
- new documentation points users to core and observe first

### Phase 4: expose stable new entry points

Only after Phases 1 through 3 are real should the package structure change.

Possible step:

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./core": "./dist/core/index.js",
    "./observe": "./dist/observe/index.js",
    "./compat": "./dist/compat/index.js"
  }
}
```

This can happen before a full workspace split.

### Phase 5: extract packages if still justified

Once the boundaries are stable:

- move `core`, `observe`, `rxjs`, and `compat` into `packages/`
- preserve the top-level package as a compatibility entry if needed
- keep existing bundle targets until consumers have a replacement path

## Gaps to Close Before Starting

### 1. Build and publishing strategy

The current plan assumes package boundaries but does not specify:

- whether top-level `datamatic` remains the canonical package
- whether subpath exports are enough
- whether UMD and window bundles remain supported
- how demos will consume the new modules

### 2. TypeScript migration scope

The plan uses `.ts` files, but the repo is JavaScript today.

Recommendation: either:

- migrate architecture first and add TypeScript second, or
- use TypeScript only in the new modules with a clear compile boundary

Do not make type migration an accidental blocker.

### 3. Test layout and tooling

Tests are currently colocated in `src/`. The plan should define:

- where new tests live
- whether legacy tests remain as-is
- whether parity tests are separate from new unit tests

### 4. Integration demo continuity

The repo contains integration examples for:

- CommonJS
- UMD React
- UMD Angular
- window globals

Those need an explicit migration path or an explicit deprecation decision.

### 5. Versioning and deprecation timeline

The sequence needs semantic-versioning guidance:

- which release introduces the new core
- which release introduces warnings
- which release removes legacy internals

## Release Strategy

### Release 1

Ship:

- new core
- new observe layer
- no breaking removal

Goal:

- let new adopters use the new API without disturbing old users

### Release 2

Ship:

- compat layer
- RxJS adapters
- updated docs and examples

Goal:

- make migration practical

### Release 3

Ship:

- top-level deprecation notices for legacy entry points

Goal:

- change the documented default without forcing immediate breakage

### Release 4

Ship:

- removal of legacy internals, or freeze them permanently in compat

Goal:

- complete the architecture split cleanly

## Documentation Strategy

Reframe the docs around four tracks:

1. Start here
2. Core concepts
3. Migration from classic Datamatic
4. Legacy and compatibility

Suggested structure:

```text
docs/
  start-here.md
  core-models.md
  core-pipelines.md
  observation.md
  migration-classic-to-v2.md
  legacy-compat.md
```

## Assessment and Recommendations

The package-layout proposal is good as an end state, but too optimistic as a first move. The current repo is still a single-package JavaScript library with legacy bundle targets and a broad legacy API. The most pragmatic improvement is to prove the new boundaries inside the current package first, then extract packages when the architecture is stable. That reduces moving parts, keeps the migration reviewable, and gives the team a cleaner way to preserve compatibility without mixing packaging concerns into every runtime change.

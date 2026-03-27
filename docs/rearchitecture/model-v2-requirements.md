# Model V2 Requirements

This document translates the current `Model` runtime and tests into explicit requirements for:

- `data-model-lifecycle`
- `data-model-path-ops`
- `data-model-parity`

It is based on:

- [src/Model/index.js](/Users/vanschroeder/Workspace/datamatic/src/Model/index.js)
- [src/Model/base-model.js](/Users/vanschroeder/Workspace/datamatic/src/Model/base-model.js)
- [src/Model/propertiesModel.js](/Users/vanschroeder/Workspace/datamatic/src/Model/propertiesModel.js)
- [src/Model/itemsModel.js](/Users/vanschroeder/Workspace/datamatic/src/Model/itemsModel.js)
- [src/Model/index.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/index.test.js)
- [src/Model/base-model.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/base-model.test.js)
- [src/Model/propertiesModel.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/propertiesModel.test.js)
- [src/Model/itemsModel.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/itemsModel.test.js)
- [src/Model/coverage-extra.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/coverage-extra.test.js)
- [src/Model/model-pipes.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/model-pipes.test.js)

## Current Behavioral Shape

Current `Model` behavior is not only "validated state". It combines:

- root object construction and schema selection
- proxy-based object and array mutation
- node-local `$model` owner references
- nested validation with parent context
- lifecycle methods such as `freeze()` and `reset(...)`
- root and path-scoped observation
- defaults and pattern-property behavior through Ajv/options
- model-to-pipeline bridging

That means Phase 3 must separate what becomes explicit `DataModel` core behavior from what remains compat-only proxy-era behavior.

## Core Lifecycle Requirements

These behaviors should be preserved conceptually in `DataModel` core:

1. A model has explicit lifecycle state, including mutable vs frozen behavior.
2. Freeze is explicit and externally observable.
3. Reset is explicit and externally observable.
4. Validation must be available without requiring implicit proxy mutation.
5. Root-level serialization/snapshot behavior must remain stable and deterministic.

## Legacy Behavior That Must Remain Reachable

These do not belong in clean `Core V2`, but must remain reachable through compat or observe:

- proxy-driven property assignment on objects
- proxy-driven index assignment on arrays
- deletion semantics on proxied object/array members
- `$model` references on proxied values
- `owner`, `parent`, `path`, `jsonPath`, `validationPath`, and similar proxy-era accessors
- model-to-pipeline bridge behavior via `pipeline(...)`
- path-based helpers like `getPath(...)` and `getModelsInPath(...)`

## Lifecycle Requirements

Phase 3 lifecycle work should preserve these current facts:

1. Invalid root assignment leaves the model pristine.
2. Invalid nested updates do not silently corrupt the current model.
3. Freeze prevents further mutation.
4. Reset can occur without forced completion behavior.
5. `reset({complete: true})` has stronger descendant-completion/freezing behavior than plain reset.
6. Freezing a model closes model-origin pipelines through the current bridge behavior.

## Path and Mutation Requirements

Phase 3 path-operation work must account for these current semantics:

1. Nested object replacement and nested property updates are both currently supported.
2. Array element replacement and nested object update inside arrays are both currently supported.
3. Required property deletion is currently blocked.
4. Optional property deletion is currently allowed.
5. Pattern-property and default-value behavior are part of current observable semantics where AJV options enable them.
6. Schema lookup by path and by key currently supports both `$id` and legacy `id`.

## Replace-Not-Preserve Behavior

These behaviors should be replaced, not carried into `Core V2` unchanged:

- implicit proxy traps as the primary mutation API
- `$model` as the main node navigation pattern
- hidden `WeakMap` state and trap-specific mutation control
- implicit path traversal helpers standing in for explicit get/set/update APIs

## Path Operation Requirements

If `DataModel` introduces explicit `get/set/update/replace/reset/validate/snapshot` methods, they must be able to represent the current behavior that matters for migration:

1. root replacement
2. nested object replacement
3. nested property set/update
4. array element replacement
5. deletion policy differences between required and optional fields
6. validation without committing invalid state
7. stable serialization of current state

## Parity Coverage Requirements

Before `data-model-parity` can be considered complete, coverage should explicitly pin:

1. Valid root creation vs invalid root creation behavior.
2. Valid nested object updates vs invalid nested updates.
3. Valid array element updates vs invalid array element updates.
4. Freeze preventing further mutation.
5. Reset behavior with and without `complete: true`.
6. Required-vs-optional delete behavior.
7. Schema lookup by key and by path.
8. `fromJSON(...)` compatibility behavior.
9. Model-to-pipeline bridge behavior during normal operation and after freeze.
10. Root and path-scoped observation compatibility assumptions, if Phase 4 depends on them.

## Recommended Phase 3 Split

### `data-model-lifecycle`

Own:

- explicit lifecycle state
- freeze state and transition rules
- reset semantics
- mutable vs frozen invariants

Do not own:

- observation wiring
- proxy compatibility layer
- model-to-pipeline observation side effects beyond defining required hooks

### `data-model-path-ops`

Own:

- explicit read/write/update/replace APIs
- validation-before-commit rules
- explicit snapshot behavior
- explicit path semantics replacing current helper/trap behavior

### `data-model-parity`

Own:

- proof that migration-critical lifecycle and path behaviors remain preserved where intended
- explicit coverage for invalid write protection, delete policy, freeze/reset, and serialization

## Immediate Backlog Impact

This document tightens the acceptance criteria for:

- `data-model-lifecycle`
- `data-model-path-ops`
- `data-model-parity`

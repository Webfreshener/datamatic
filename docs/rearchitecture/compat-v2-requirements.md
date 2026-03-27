# Compat V2 Requirements

This document translates the hardened current-surface decisions into explicit requirements for:

- `legacy-pipeline-adapter`
- `legacy-model-adapter`
- `txvalidator-compat-bridge`

It is based on:

- [preserve-move-drop-matrix.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/preserve-move-drop-matrix.md)
- [current-public-surface-inventory.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/current-public-surface-inventory.md)
- [pipeline-v2-requirements.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/pipeline-v2-requirements.md)
- [model-v2-requirements.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/model-v2-requirements.md)
- [observe-v2-requirements.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/observe-v2-requirements.md)

## Compat Layer Purpose

Compat V2 exists to preserve migration-critical legacy behavior without forcing:

- proxy semantics into `Core V2`
- push/observer behavior into `PipelineV2` core
- RxJS internals into the new observe layer
- legacy constructor coercion into clean V2 APIs

Compat is an adapter boundary, not a second core.

## LegacyPipeline Requirements

Compat for `Pipeline` must keep these surfaces reachable:

- `new Pipeline(...pipesOrVOsOrSchemas)`
- `exec(data)`
- `write(data)`
- `promise(data)`
- `pipe(...)`
- `link(...)` / `unlink(...)`
- `split(...)`
- `merge(...)`
- `throttle(...)` / `unthrottle(...)`
- `sample(n)`
- `subscribe(...)`
- `close()` / `writable`
- `tap()` / `toJSON()` / `toString()`

Compat-specific rules:

1. Legacy push-mode behavior remains outside `PipelineV2` core.
2. Legacy function/schema/validator/iterator coercion remains reachable through compat seams.
3. Direct execution, push execution, and promise-wrapped execution remain distinguishable where compat claims support.
4. `yield()` is a replacement case; compat may map callers to a documented trace path, but must not silently resurrect runtime code generation.
5. Deprecation warnings, if added, appear only in compat surfaces.

## LegacyModel Requirements

Compat for `Model` must keep these surfaces reachable:

- `new Model(schemas, options?)`
- `addSchema(...)`
- `useSchema(...)`
- `model` getter/setter
- `schema`
- `freeze()` / `isFrozen`
- `getSchemaForKey(...)`
- `getSchemaForPath(...)`
- `validate(path, value)`
- `errors`
- `getPath(...)`
- `getModelsInPath(...)`
- `pipeline(...)`
- `subscribe(...)`
- `subscribeTo(...)`
- `toJSON()` / `toString()`
- `Model.fromJSON(...)`

Compat must also preserve the practical proxy-era surface where claimed:

- `$model` access
- node/path/root helper behavior
- model-to-pipeline bridge behavior

Compat-specific rules:

1. Proxy behavior must not re-enter `Core V2`, but compat must preserve migration-critical proxy-era behavior.
2. Root and path-scoped observation must remain available through compat + observe.
3. Invalid-write protection must remain stable where compat exposes mutation semantics.
4. Freeze/reset/model snapshot behavior must remain mappable to the new lifecycle model.
5. Deprecation warnings, if added, appear only in compat surfaces.

## TxValidator Compat Requirements

Compat for `TxValidator` must keep these surfaces reachable:

- `new TxValidator(schemaOrConfig, options?)`
- `validateSchemas(...)`
- `deriveSchema(...)`
- `freeze()` / `isFrozen`
- `errors`
- `subscribe(...)`
- `validate(value)`
- `model` getter/setter
- `toJSON()` / `toString()` / `valueOf()`

Compat-specific rules:

1. Existing constructor/config acceptance must remain stable until migration docs define an explicit replacement path.
2. Validation result mapping must remain explicit and documented.
3. Existing error-channel behavior must remain stable where compat claims support.
4. Draft compatibility and schema normalization behavior inherited from the shared validation layer must remain stable.

## Required Compat Boundaries

Compat implementations should make these boundaries explicit:

1. What is restored from legacy API shape.
2. What is forwarded to `Core V2`.
3. What is forwarded to `Observe V2`.
4. What is intentionally deprecated.
5. What is intentionally not preserved because it was doc drift or explicitly dropped.

## Non-Goals

Compat should not:

- become the primary implementation surface for new features
- hide behavior changes without documentation
- silently reintroduce proxy, RxJS, or codegen into clean V2 core layers
- invent compatibility for README-only doc drift such as `Pipeline.once()`

## Parity Expectations

Before Phase 5 can be considered complete, compat claims should be explicit for:

1. Which legacy methods are preserved exactly.
2. Which legacy methods are behaviorally preserved but implemented through new V2 layers.
3. Which methods emit deprecation warnings.
4. Which methods are intentionally unsupported because they were never actually implemented.

## Immediate Backlog Impact

This document tightens the acceptance criteria for:

- `legacy-pipeline-adapter`
- `legacy-model-adapter`
- `txvalidator-compat-bridge`

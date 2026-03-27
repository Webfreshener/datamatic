# Validation Foundation Requirements

This document translates the current code and tests into explicit preservation requirements for Phase 1:

- `shared-ajv-wrapper`
- `schema-helper-normalization`
- `properties-schema-resolution`

It is based on:

- [src/Model/_ajvWrapper.js](/Users/vanschroeder/Workspace/datamatic/src/Model/_ajvWrapper.js)
- [src/Pipeline/_ajvWrapper.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/_ajvWrapper.js)
- [src/Model/_schemaHelpers.js](/Users/vanschroeder/Workspace/datamatic/src/Model/_schemaHelpers.js)
- [src/Pipeline/Utils.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/Utils.js)
- [src/Pipeline/Properties.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/Properties.js)

## Shared AJV Wrapper Consolidation

## Current Observations

Both Model and Pipeline have their own `AjvWrapper`, but they overlap in several critical behaviors:

- both merge user options over shared default AJV options
- both normalize schema IDs
- both support draft-04 opt-in via `meta` or explicit option
- both lazy-load `ajv-draft-04`
- both distinguish draft-04 from draft-07 handling
- both preserve schema validation and runtime validation error exposure

Important differences that must not be flattened accidentally:

- Model wrapper requires a real `Model` owner and uses owner path reconstruction for nested validation
- Pipeline wrapper has no model owner and returns simpler `false`/string results
- Model wrapper sets and uses a root validation path tied to owner schema state
- Pipeline wrapper tracks added schema IDs internally and exposes `addSchema(...)`

## Required Preservation Rules

1. Draft-04 support must stay opt-in.
2. Draft-04 schemas without opt-in must still fail.
3. Missing `ajv-draft-04` must still fail explicitly when draft-04 is requested.
4. Draft-07 meta handling must remain available where current wrappers rely on it.
5. Schema ID normalization for both `$id` and legacy `id` must remain stable.
6. Model nested validation must still be able to reconstruct ancestor state for partial writes.
7. Current validation result semantics must not be silently unified if callers depend on different shapes.
8. The current strict-types warning path remains compatibility-sensitive, not cleanup-by-default.

## Observed Test Anchors

- [src/Model/_ajvWrapper.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/_ajvWrapper.test.js)
- [src/Pipeline/_ajvWrapper.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/_ajvWrapper.test.js)
- [src/Model/coverage-extra.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/coverage-extra.test.js)
- [src/Pipeline/coverage-extra.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/coverage-extra.test.js)

## Implementation Constraint

Phase 1 may extract common AJV bootstrapping logic, but it must keep distinct adapter layers for:

- model-owned nested validation
- pipeline-only schema/config validation
- current error/result translation

## Schema Helper Normalization

## Current Observations

`SchemaHelpers` currently does more than simple helper work:

- `setObject(obj)` iterates nested assignments through the current model setter path
- `setChildObject(key, value)` creates a child model, wires observers, sets value, and returns the child model payload
- `createSchemaChild(key, value, metaData)` selects `PropertiesModel` vs `ItemsModel` based on runtime value shape, not only schema shape

This means the helper layer is currently responsible for:

- child model class selection
- metadata propagation
- observer creation side effects
- setter-driven validation/error flow

## Required Preservation Rules

1. Child model creation must still preserve metadata chaining to root, parent, and owner.
2. New child models must still register observers before they begin emitting.
3. `setObject(...)` must continue routing through model setters, not bypass validation.
4. Value-shape-driven child class selection must not silently change without an explicit design decision.
5. Current thrown error behavior from nested set failures must remain regression-tested.

## Observed Test Anchors

- [src/Model/_schemaHelpers.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/_schemaHelpers.test.js)
- [src/Model/propertiesModel.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/propertiesModel.test.js)
- [src/Model/itemsModel.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/itemsModel.test.js)
- [src/Model/coverage-extra.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/coverage-extra.test.js)

## Implementation Constraint

Phase 1 can simplify helper branching, but it must not collapse:

- child model creation
- observer registration
- metadata propagation
- setter/validation side effects

into a single opaque helper that hides behavioral seams from tests.

## Properties / Schema Resolution Split

## Current Observations

Pipeline argument intake and runtime wiring are currently coupled across:

- [src/Pipeline/Utils.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/Utils.js)
- [src/Pipeline/Properties.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/Properties.js)

Current behavior includes:

- empty pipeline args default to two pass-through stages
- functions normalize to executable pipe objects
- arrays normalize through `Iterator`
- schema-looking objects normalize into `Validator`
- validators normalize into executable wrappers that throw on validation errors
- `Properties.init(...)` derives input/output schemas from normalized pipeline arguments
- when no explicit schemas exist, default VO schemas are injected

This means schema resolution, callback normalization, validator coercion, listener wiring, and runtime state construction are all entangled today.

## Required Preservation Rules

1. Empty pipeline construction must still produce a valid pass-through pipeline.
2. Function, schema, validator, iterator, and pipeline inputs must keep their current coercion behavior unless explicitly replaced.
3. Schema derivation for input vs output must remain stable for current pipeline construction patterns.
4. Default VO schema injection must remain stable where no explicit schemas are supplied.
5. Validation-wrapped executable stages must continue throwing on validation errors in the current legacy path.
6. Output validator completion must still clean up listeners as it does today.

## Observed Test Anchors

- [src/Pipeline/Utils.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/Utils.test.js)
- [src/Pipeline/Pipe.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/Pipe.test.js)
- [src/Pipeline/Pipe-api.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/Pipe-api.test.js)
- [src/Pipeline/coverage-extra.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/coverage-extra.test.js)

## Implementation Constraint

Phase 1 should split this work into three explicit seams:

- argument normalization
- schema derivation
- runtime/listener wiring

The split is only acceptable if current coercion and default-schema behavior remain pinned by tests.

## Required Phase 1 Regression Coverage

Before Phase 1 is considered complete, coverage should explicitly pin:

1. Draft-04 rejection without opt-in.
2. Draft-04 acceptance with opt-in when dependency is present.
3. Schema ID normalization for both `$id` and `id`.
4. Model nested validation behavior using reconstructed parent state.
5. Helper-driven child model creation and observer registration.
6. Function/schema/validator/iterator coercion in pipeline args.
7. Default input/output schema derivation for pipelines.
8. Validation error propagation shape for Model and Pipeline legacy paths.

## Immediate Backlog Impact

This document tightens the acceptance criteria for:

- `shared-ajv-wrapper`
- `schema-helper-normalization`
- `properties-schema-resolution`

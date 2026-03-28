# Phase 3 Progress

Phase 3 began with the first clean internal model seam defined by:

- [model-v2-requirements.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/model-v2-requirements.md)

## Current Cut

Implemented:

- [src/Model/v2/DataModel.js](/Users/vanschroeder/Workspace/datamatic/src/Model/v2/DataModel.js)
- [src/Model/v2/compat.js](/Users/vanschroeder/Workspace/datamatic/src/Model/v2/compat.js)
- [src/Model/v2/errors.js](/Users/vanschroeder/Workspace/datamatic/src/Model/v2/errors.js)
- [src/Model/v2/json.js](/Users/vanschroeder/Workspace/datamatic/src/Model/v2/json.js)
- [src/Model/v2/path.js](/Users/vanschroeder/Workspace/datamatic/src/Model/v2/path.js)
- [src/Model/v2/schema.js](/Users/vanschroeder/Workspace/datamatic/src/Model/v2/schema.js)
- [src/Model/v2/value.js](/Users/vanschroeder/Workspace/datamatic/src/Model/v2/value.js)
- [src/Model/v2/index.js](/Users/vanschroeder/Workspace/datamatic/src/Model/v2/index.js)
- [src/Model/v2/legacy.js](/Users/vanschroeder/Workspace/datamatic/src/Model/v2/legacy.js)
- [src/Model/v2/DataModel.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/v2/DataModel.test.js)
- [src/Model/v2/compat.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/v2/compat.test.js)
- [src/Model/v2/json.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/v2/json.test.js)
- [src/Model/v2/parity.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/v2/parity.test.js)
- [src/Model/v2/legacy.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/v2/legacy.test.js)
- [src/Model/index.js](/Users/vanschroeder/Workspace/datamatic/src/Model/index.js)
- [src/Model/index.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/index.test.js)

Delivered seam:

- explicit internal `DataModel` core with lifecycle-owned `replace(...)`, `reset(...)`, `freeze()`, `validate(...)`, and `snapshot()` behavior
- validation-before-commit semantics so invalid replacements leave the committed state intact
- explicit frozen-state enforcement through `DataModelStateError` instead of proxy-trap side effects
- explicit validation failure surface through `DataModelValidationError`
- deterministic snapshot serialization for JSON-like values, including `toJSON()` support and own-property-only traversal
- reset semantics that distinguish plain reset from `reset({complete: true})` through an explicit descendant-completion hook
- explicit lifecycle hooks for commit, reset, freeze, and invalid-commit handling so later observe/compat work has stable integration points
- explicit `get(...)`, `set(...)`, `update(...)`, `delete(...)`, and `validateAt(...)` path operations on top of the lifecycle core
- explicit path parsing and traversal rules through a dedicated V2 helper instead of proxy traps or legacy path helpers
- explicit schema lookup at a V2 path through a dedicated schema helper, including object, array, and pattern-property traversal
- whole-model validation-before-commit for nested writes so invalid path mutations still leave committed state intact
- explicit delete-policy hook so required-vs-optional removal behavior is a declared contract instead of hidden trap behavior
- schema-derived default delete policy when `DataModel` is constructed with a schema, so required fields and `minItems` constraints are represented without hardcoded compat logic
- explicit path error surface through `DataModelPathError` for missing or invalid traversal
- parity coverage for valid vs invalid root replacement outcomes between legacy `Model` and `DataModel`
- parity coverage for valid vs invalid nested object and array-element updates between legacy `Model` and `DataModel`
- parity coverage for freeze and reset semantics at the currently supported V2 core boundary
- parity coverage for required-vs-optional delete outcomes through an explicit V2 delete policy
- explicit internal `LegacyModelAdapter` seam that validates root replacement, reset, and freeze through a shadow `DataModel`, then applies the operation to the legacy runtime
- adapter rehydration from the legacy runtime after root replacement and reset so legacy defaults and side effects remain authoritative
- root freeze delegation that keeps the V2 lifecycle view explicit while preserving the current legacy pipeline-closing side effect
- adapter exposure for compat-owned root helpers including schema lookup and `fromJSON(...)`, without remapping those public behaviors onto V2 directly
- explicit V2 compat helpers for root replacement, reset, and freeze so public root-owned `Model` behavior can delegate through a V2-owned seam without remapping proxy mutation
- selective internal call-site migration of public `Model` root replacement and `freeze()` through those compat helpers, while preserving legacy non-throwing invalid-root behavior
- explicit compat bootstrap support for invalid legacy initial state through `DataModel`'s opt-in `validateInitial: false` mode
- shared `parseModelJSON(...)` bootstrap helper so public `Model.fromJSON(...)` and `LegacyModelAdapter.fromJSON(...)` stop carrying duplicated JSON-input parsing logic
- no proxy, RxJS, or legacy `Model` wiring in the V2 core

## Intentionally Deferred

This cut does not yet move or reimplement legacy model behavior.

Still deferred to later Phase 3 / Phase 4 / Phase 5 work:

- proxy compatibility behavior and `$model` navigation
- root and path-scoped observation
- broader public legacy `Model` delegation onto the V2 core beyond root-owned helper seams
- model-to-pipeline bridge migration
- nested proxy-owned mutation delegation onto V2-aware compat seams

## Preserved Constraints

This cut intentionally preserves:

- existing root package exports remain unchanged
- existing `Model` proxy/runtime semantics remain unchanged outside the selective root-owned helper delegation
- invalid writes do not commit partial state
- freeze remains an explicit lifecycle transition
- reset-with-complete remains stronger than plain reset
- public invalid root replacement remains non-throwing even though V2 preflight exists for adapter-owned paths
- legacy `fromJSON(...)` error wording remains unchanged

## Verification

Verified locally after the first Phase 3 cut:

- `npm test -- --runInBand src/Model/v2/DataModel.test.js`
- `npm test -- --runInBand`
- `npm run build`

Observed green baseline after the current Phase 3 cut:

- Jest: `45` suites passing
- Jest: `358` tests passing
- Build outputs produced:
  - `dist/datamatic.node.js`
  - `dist/datamatic.umd.js`
  - `dist/datamatic.window.js`

## Next Move

The next logical Phase 3 cut is:

- decide whether nested proxy-owned mutation should stay fully legacy-owned until Phase 5 compat, or
- start the first selective extraction of nested/root mutation call sites into explicit V2-aware compat helpers without remapping public proxy behavior wholesale

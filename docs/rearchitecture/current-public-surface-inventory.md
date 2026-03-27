# Current Public Surface Inventory

This inventory is the Phase 0 source-of-truth snapshot for Datamatic's current public and quasi-public runtime surface.

It is based on the current code in:

- [src/index.js](/Users/vanschroeder/Workspace/datamatic/src/index.js)
- [src/Model/index.js](/Users/vanschroeder/Workspace/datamatic/src/Model/index.js)
- [src/Model/base-model.js](/Users/vanschroeder/Workspace/datamatic/src/Model/base-model.js)
- [src/Pipeline/index.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/index.js)
- [src/Pipeline/Pipeline.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/Pipeline.js)
- [src/Pipeline/Validator.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/Validator.js)

## Top-Level Exports

Current package entry points export:

- `Model`
- `Pipeline`
- `TxValidator`

Observed from:

- [src/index.js](/Users/vanschroeder/Workspace/datamatic/src/index.js)
- [src/Pipeline/index.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/index.js)

## Model Surface

### Explicit `Model` Methods and Accessors

Observed on [src/Model/index.js](/Users/vanschroeder/Workspace/datamatic/src/Model/index.js):

| Surface | Kind | Notes |
| --- | --- | --- |
| `new Model(schemas, options?)` | constructor | Root model entry point |
| `addSchema(schema)` | method | Adds schema to current Ajv instance |
| `useSchema(id)` | method | Switches active schema in validator |
| `model` | getter/setter | Root proxied model |
| `schema` | getter | Root schema for active validator path |
| `freeze()` | method | Freezes document hierarchy |
| `isFrozen` | getter | Root freeze status |
| `getSchemaForKey(id)` | method | Schema lookup by `$id` or `id` |
| `getSchemaForPath(path)` | method | Schema lookup by JSON-schema path |
| `validate(path, value)` | method | Delegates to Ajv wrapper |
| `errors` | getter | Current Ajv error state |
| `getPath(path)` | method | Reads data path from current model |
| `getModelsInPath(path)` | method | Returns model nodes along a path |
| `pipeline(...pipesOrSchemas)` | method | Builds a pipeline from the model root |
| `subscribe(observer)` | method | Root subscription |
| `subscribeTo(path, observer)` | method | Path-scoped subscription |
| `toString()` | method | Stringifies root model |
| `toJSON()` | method | Serializes root model |
| `Model.fromJSON(json, options?)` | static method | Creates model from JSON string/object |

### Quasi-Public `BaseModel` Surface

The proxied model tree exposes owner instances through `$model`, which makes `BaseModel` behavior part of the effective public surface.

Observed on [src/Model/base-model.js](/Users/vanschroeder/Workspace/datamatic/src/Model/base-model.js):

| Surface | Kind | Notes |
| --- | --- | --- |
| `subscribe(observer)` | method | Alias to `subscribeTo(this.path, ...)` |
| `subscribeTo(path, observer)` | method | Path subscription builder |
| `validate(value)` | method | Validation at current node path |
| `reset(options?)` | method | Reset to empty value; `complete` option freezes descendants |
| `valueOf()` | method | Raw proxied value |
| `toJSON()` | method | Deep serialization |
| `toString()` | method | JSON string |
| `freeze()` | method | Freezes node and emits complete |
| `objectID` | getter | Internal metadata identity |
| `root` | getter | Root model node |
| `path` | getter | JSON-schema path |
| `jsonPath` | getter | Dot-style path |
| `parent` | getter | Parent model node |
| `isDirty` | getter | Dirty-state propagation |
| `owner` | getter | Root `Model` instance |
| `options` | getter | Schema options |
| `isFrozen` | getter | Freeze state with parent propagation |
| `validationPath` | getter | Validation path |
| `schema` | getter | Schema at current node |
| `pipeline(...pipesOrSchemas)` | method | Node-origin pipeline |
| `$model` | object property on proxied values | Owner reference installed by `BaseModel.createRef(...)` |

### Model Runtime Characteristics

Observed runtime shape:

- Model mutation is Proxy-driven, not explicit-operation-driven.
- Path-aware observation exists today and is operational.
- Freeze and reset cascade through the model hierarchy.
- Validation may return `true` or a string error message depending on call path.
- Schema lookup supports both `$id` and legacy `id`.

## Pipeline Surface

### Explicit `Pipeline` Methods and Accessors

Observed on [src/Pipeline/Pipeline.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/Pipeline.js):

| Surface | Kind | Notes |
| --- | --- | --- |
| `new Pipeline(...pipesOrVOsOrSchemas)` | constructor | Main pipeline entry |
| `exec(data)` | method-like instance property | Defined in constructor via `Object.defineProperty` |
| `pipe(...pipesOrSchemas)` | method | Chains a new pipeline |
| `schema` | getter | Input/output schema pair |
| `link(target, ...callbacks)` | method | Connects pipeline output to another pipeline |
| `unlink(target)` | method | Removes linked pipeline |
| `errors` | getter | Validation error state |
| `schemas` | getter | Full schema list |
| `split(schemasOrPipes)` | method | Parallel branch creation |
| `yield(data)` | method | Generator/codegen trace-like path |
| `merge(pipeOrPipes, pipeOrSchema?)` | method | Merge outputs from multiple pipelines |
| `write(data)` | method | Push-mode ingress |
| `clone()` | method | Shallow runtime clone sharing pipe state |
| `close()` | method | Freezes output validator |
| `writable` | getter | Output freeze status inverse |
| `throttle(rate)` | method | Queue-based throttling |
| `unthrottle(discardCacheQueue?)` | method | Throttle cleanup |
| `sample(nth)` | method | Emits every Nth item |
| `subscribe(handler)` | method | Output subscription |
| `tap()` | method | Alias of `toJSON()` |
| `promise(data)` | async method | Promise wrapper around subscription + write |
| `toString()` | method | JSON string |
| `toJSON()` | method | Output serialization |

### `TxValidator` Surface

Observed on [src/Pipeline/Validator.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/Validator.js):

| Surface | Kind | Notes |
| --- | --- | --- |
| `Validator.validateSchemas(...)` | static method | Schema/config acceptance check |
| `Validator.deriveSchema(...)` | static method | Derives schema from config |
| `new TxValidator(schemaOrConfig, options?)` | constructor | Exported as `TxValidator` |
| `freeze()` | method | Freezes validator output and completes observers |
| `isFrozen` | getter | Freeze state |
| `errors` | getter | Validation errors |
| `subscribe(handler)` | method | Observer registration |
| `validate(value)` | method | Validation without assignment |
| `model` | getter/setter | Value channel with validation |
| `toJSON()` | method | Snapshot |
| `toString()` | method | JSON string |
| `valueOf()` | method | Snapshot alias |

## Current Documentation Drift

Observed mismatch between [README.md](/Users/vanschroeder/Workspace/datamatic/README.md) and current source:

| Surface | README State | Source State | Finding |
| --- | --- | --- | --- |
| `Pipeline.once()` | Documented | Not implemented | Doc drift |
| `Pipeline.pipeline()` | Documented | Actual method is `pipe()` | Doc drift |
| `Pipeline.exec(data)` | Documented as normal method | Exists as constructor-defined property | API exists, implementation shape matters for compat |
| `PropertiesModel.get/set` descriptions | Present | Actual behavior is deeper proxy/model semantics | README wording is not a precise contract |

## V2-Relevant Preservation Findings

These findings should constrain the V2 design:

- `Model` has both root-level and path-level subscription semantics today.
- `$model` owner references and BaseModel methods are part of the practical API surface.
- `Pipeline` is currently push-oriented, not only request/response oriented.
- `exec`, `write`, and `promise` are all distinct user-facing entry paths.
- `yield()` relies on `new Function(...)` and should be treated as compatibility-sensitive behavior, not just an internal detail.
- `TxValidator` is a real exported surface and should not be treated as an incidental helper.

## Test Coverage Map For Current Surface

Current tests covering the public/runtime surface include:

- Model behavior:
  - [src/Model/index.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/index.test.js)
  - [src/Model/base-model.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/base-model.test.js)
  - [src/Model/itemsModel.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/itemsModel.test.js)
  - [src/Model/propertiesModel.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/propertiesModel.test.js)
  - [src/Model/observability.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/observability.test.js)
  - [src/Model/model-pipes.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/model-pipes.test.js)
  - [src/Model/coverage-extra.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/coverage-extra.test.js)
- Pipeline behavior:
  - [src/Pipeline/Pipe.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/Pipe.test.js)
  - [src/Pipeline/Pipe-api.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/Pipe-api.test.js)
  - [src/Pipeline/Validator.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/Validator.test.js)
  - [src/Pipeline/coverage-extra.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/coverage-extra.test.js)
  - [src/Pipeline/Iterator.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/Iterator.test.js)
  - [src/Pipeline/vxBehaviorSubject.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/vxBehaviorSubject.test.js)
- Package/build smoke:
  - [src/index.test.js](/Users/vanschroeder/Workspace/datamatic/src/index.test.js)
  - [src/dist.test.js](/Users/vanschroeder/Workspace/datamatic/src/dist.test.js)
  - [src/static-modules.test.js](/Users/vanschroeder/Workspace/datamatic/src/static-modules.test.js)
  - [src/index-polyfill.test.js](/Users/vanschroeder/Workspace/datamatic/src/index-polyfill.test.js)

## Immediate Backlog Impact

This inventory tightens the acceptance criteria for:

- `legacy-api-matrix`
- `baseline-ci-gates`
- `txvalidator-compat-bridge`
- `legacy-model-adapter`
- `legacy-pipeline-adapter`

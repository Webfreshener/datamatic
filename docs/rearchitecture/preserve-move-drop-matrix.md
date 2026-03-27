# Preserve / Move / Drop Matrix

This is the hardened Phase 0 preserve/move/drop decision record for the current Datamatic surface.

It is derived from:

- [current-public-surface-inventory.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/current-public-surface-inventory.md)
- [baseline-parity-gates.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/baseline-parity-gates.md)

## Status Legend

- `Core V2`: required in the new explicit core runtime
- `Observe V2`: required in the wrapper/event layer
- `Compat V2`: preserved for migration, not part of the long-term core contract
- `Drop`: remove after deprecation or replace with a clearer V2 surface
- `Doc drift`: documented today, but not backed by runtime implementation

## Exported Package Surface

| Surface | Observed Today | First V2 Treatment | Rationale |
| --- | --- | --- | --- |
| `Model` export | top-level package export | `Compat V2` | Keep stable top-level package contract while V2 is introduced in parallel |
| `Pipeline` export | top-level package export | `Compat V2` | Keep stable top-level package contract while V2 is introduced in parallel |
| `TxValidator` export | top-level package export | `Compat V2` | Existing integrations may depend on it directly; replacement must be explicit |

## Root Model API

| Surface | Observed Today | First V2 Treatment | Rationale |
| --- | --- | --- | --- |
| `new Model(schemas, options?)` | root public entry point | `Compat V2` | V2 root constructor becomes explicit `DataModel`; preserve current constructor via adapter |
| `addSchema(schema)` | public schema mutation path | `Compat V2` | Replace conceptually with `SchemaRegistry.register()` |
| `useSchema(id)` | public active-schema selector | `Compat V2` | Multi-schema selection rules should be redefined explicitly before core adoption |
| `model` getter/setter | proxied root mutable surface | `Compat V2` | V2 core should use explicit operations instead of proxy assignment |
| `schema` getter | root schema lookup | `Compat V2` | Useful for migration, but not a required V2 core primitive |
| `freeze()` | root lifecycle method | `Core V2` | Freeze semantics are current observable behavior and have direct tests |
| `isFrozen` | lifecycle state getter | `Core V2` | Needed to preserve explicit lifecycle visibility |
| `getSchemaForKey(id)` | public schema lookup | `Compat V2` | Can stay in compat while registry/query APIs mature |
| `getSchemaForPath(path)` | public schema lookup | `Compat V2` | Path-schema lookup is migration useful but not core-defining |
| `validate(path, value)` | public validation path | `Compat V2` | V2 should expose explicit model and validator validation APIs, not path+value on legacy root |
| `errors` getter | validation error exposure | `Compat V2` | Current error shape is compatibility-sensitive |
| `getPath(path)` | public path data read | `Compat V2` | Replace in V2 core with explicit `get(path)` |
| `getModelsInPath(path)` | model tree traversal helper | `Compat V2` | Observation internals depend on it today; keep during migration |
| `pipeline(...pipesOrSchemas)` | model-to-pipeline bridge | `Compat V2` | Useful migration affordance; should not shape V2 core contracts |
| `subscribe(observer)` | root observation | `Observe V2` | Preserve, but move fully out of core |
| `subscribeTo(path, observer)` | path-scoped observation | `Observe V2` | Preserve, but move fully out of core |
| `toJSON()` | root serialization | `Compat V2` | V2 primary shape should likely be `snapshot()` |
| `toString()` | root serialization string | `Compat V2` | Preserve as migration convenience only |
| `Model.fromJSON(json, options?)` | static factory | `Compat V2` | Preserve for first migration cycle, then deprecate if explicit constructors replace it |

## Proxied Model / `$model` Surface

These are not clean top-level exports, but they are practically public because proxied values expose `$model` and tests/docs depend on them.

| Surface | Observed Today | First V2 Treatment | Rationale |
| --- | --- | --- | --- |
| `$model` owner reference | installed on proxied values | `Compat V2` | Real migration surface; removing it early would strand current usage |
| `BaseModel.subscribe(observer)` | node/root observation alias | `Observe V2` | Preserve through observe wrapper, not core |
| `BaseModel.subscribeTo(path, observer)` | node/path observation | `Observe V2` | Preserve through observe wrapper, not core |
| `BaseModel.validate(value)` | node-level validation | `Compat V2` | Replace in V2 with explicit validation on model nodes or selectors |
| `BaseModel.reset(options?)` | lifecycle reset path | `Core V2` | Reset behavior is part of current lifecycle semantics and test surface |
| `BaseModel.freeze()` | lifecycle freeze path | `Core V2` | Required lifecycle behavior |
| `BaseModel.toJSON()` | deep serialization | `Compat V2` | Keep while migrating to snapshot-based surface |
| `BaseModel.toString()` | JSON string serialization | `Compat V2` | Preserve only as convenience |
| `BaseModel.valueOf()` | raw proxied value path | `Compat V2` | Too tied to proxy shape for V2 core |
| `objectID` | internal identity getter | `Compat V2` | Avoid forcing this into V2 core; preserve only if existing consumers need it |
| `root` | root node getter | `Compat V2` | Current tree navigation helper, not essential V2 core primitive |
| `path` | schema path getter | `Compat V2` | Useful in compat/observe layer |
| `jsonPath` | dot-path getter | `Compat V2` | Useful in compat/observe layer |
| `parent` | parent node getter | `Compat V2` | Tree navigation helper, not core-defining |
| `isDirty` | internal sync-state getter | `Compat V2` | Current implementation detail that leaks into runtime shape |
| `owner` | root owner getter | `Compat V2` | Current proxy-era helper |
| `options` | schema options getter | `Compat V2` | Keep only while legacy internals remain exposed |
| `validationPath` | validation lookup helper | `Compat V2` | Mostly internal but currently exposed |
| `schema` | node schema getter | `Compat V2` | Keep for migration, not core |
| `BaseModel.pipeline(...)` | node-origin pipeline bridge | `Compat V2` | Preserve while legacy proxy/node flow exists |

## Pipeline API

| Surface | Observed Today | First V2 Treatment | Rationale |
| --- | --- | --- | --- |
| `new Pipeline(...pipesOrVOsOrSchemas)` | variadic coercing constructor | `Compat V2` | V2 should prefer explicit stage arrays/config |
| `exec(data)` | direct execution path | `Compat V2` | Distinct from `write()` today; keep as legacy adapter path |
| `pipe(...pipesOrSchemas)` | chained pipeline composition | `Compat V2` | Current chaining behavior is not the same as explicit V2 composition |
| `schema` getter | input/output schema pair | `Compat V2` | Preserve while migration needs shape introspection |
| `schemas` getter | full schema list | `Compat V2` | Preserve while migration needs shape introspection |
| `errors` getter | validation error exposure | `Compat V2` | Current error shape is compatibility-sensitive |
| `link(target, ...callbacks)` | observable pipeline wiring | `Compat V2` | Keep out of V2 core |
| `unlink(target)` | observable pipeline wiring | `Compat V2` | Keep out of V2 core |
| `split(schemasOrPipes)` | branch creation | `Compat V2` | Keep out of V2 core |
| `merge(pipeOrPipes, pipeOrSchema?)` | multi-pipe merge | `Compat V2` | Keep out of V2 core |
| `yield(data)` | generator/codegen trace-like path | `Drop` | Replace with explicit trace API; do not preserve `new Function(...)` |
| `write(data)` | push-style ingress | `Compat V2` | Preserve, but keep fully out of V2 core |
| `clone()` | hidden-state clone helper | `Compat V2` | Current clone behavior shares internals and should not be a V2 core design constraint |
| `close()` | completion control | `Compat V2` | Preserve while push/observer compat exists |
| `writable` | completion state getter | `Compat V2` | Preserve while compat exists |
| `throttle(rate)` | queue-based notification shaping | `Compat V2` | Preserve only in compat/observe layer |
| `unthrottle(discardCacheQueue?)` | queue cleanup | `Compat V2` | Preserve only in compat/observe layer |
| `sample(n)` | event-rate shaping | `Compat V2` | Preserve only in compat/observe layer |
| `subscribe(handler)` | output observation | `Observe V2` | Preserve, but move out of core |
| `tap()` | output snapshot alias | `Compat V2` | V2 `run()` should return results directly |
| `promise(data)` | promise wrapper around subscription/write | `Compat V2` | Preserve as adapter to `run()` |
| `toJSON()` | output snapshot | `Compat V2` | Preserve only as migration affordance |
| `toString()` | output snapshot string | `Compat V2` | Preserve only as migration affordance |
| `run(input, ctx)` | not present today | `Core V2` | Explicit async-first execution path for V2 |
| `append(stage)` | not present today | `Core V2` | Explicit stage extension surface for V2 |
| `concat(pipeline)` | not present today | `Core V2` | Explicit composition surface for V2 |
| `tracePipeline(...)` | not present today | `Core V2` | Explicit replacement for `yield()` |

## `TxValidator` API

| Surface | Observed Today | First V2 Treatment | Rationale |
| --- | --- | --- | --- |
| `new TxValidator(schemaOrConfig, options?)` | exported validator entry | `Compat V2` | Keep migration path stable until `DataValidator` exists |
| `validateSchemas(...)` | static schema/config validator | `Compat V2` | Preserve while legacy config coercion remains relevant |
| `deriveSchema(...)` | static schema derivation helper | `Compat V2` | Internal-ish but exposed on class; keep conservatively |
| `freeze()` | lifecycle method | `Compat V2` | Preserve for legacy validator consumers |
| `isFrozen` | lifecycle getter | `Compat V2` | Preserve for legacy validator consumers |
| `errors` | validation errors getter | `Compat V2` | Current error shape is compatibility-sensitive |
| `subscribe(handler)` | observer registration | `Observe V2` | Preserve behavior outside core |
| `validate(value)` | standalone validation | `Compat V2` | New validator API should replace it later |
| `model` getter/setter | value channel with validation | `Compat V2` | Preserve while legacy push semantics exist |
| `toJSON()` | snapshot | `Compat V2` | Preserve during migration |
| `toString()` | snapshot string | `Compat V2` | Preserve during migration |
| `valueOf()` | snapshot alias | `Compat V2` | Preserve during migration |

## Runtime Behaviors

| Current Behavior | Observed Today | First V2 Treatment | Rationale |
| --- | --- | --- | --- |
| Proxy-backed model mutation | core model engine | `Drop` from core, `Compat V2` for legacy | V2 should not inherit proxy semantics, but legacy adapter must preserve behavior initially |
| `$model` on proxied values | effective runtime API | `Compat V2` | Real migration surface |
| Root observation | current runtime behavior | `Observe V2` | Preserve |
| Path-scoped observation | current runtime behavior | `Observe V2` | Preserve |
| RxJS-driven model observation | current runtime behavior | `Compat V2` | Preserve behavior while replacing implementation in observe layer |
| RxJS-driven pipeline observation | current runtime behavior | `Compat V2` | Preserve behavior while replacing implementation in observe layer |
| `WeakMap`-hidden runtime state | pervasive implementation style | `Drop` | V2 should prefer explicit state and boundaries |
| `new Function(...)` in pipeline `yield()` | current runtime behavior | `Drop` | Explicitly out of bounds for V2 |
| AJV wrapper duplication across Model/Pipeline | current implementation duplication | `Drop` | Replace with shared Phase 1 foundation |
| draft-04 + modern schema compatibility | current runtime behavior | `Compat V2` | Preserve until compatibility policy is explicitly narrowed |
| strict-types warning path | current observed warning path | `Compat V2` | Track as compatibility-sensitive, not cleanup-by-default |
| Node/UMD/window bundle trio | current distribution contract | `Compat V2` until Phase 6 | Preserve until replacement packaging is explicit |

## Documentation Drift

| Surface | Observed Today | First V2 Treatment | Rationale |
| --- | --- | --- | --- |
| `Pipeline.once()` | documented in README only | `Doc drift` | No source implementation exists; do not invent compat for it |
| `Pipeline.pipeline()` | documented in README only | `Doc drift` | Actual method is `pipe()`; track as docs cleanup, not API preservation |
| PropertiesModel `get`/`set` table description | imprecise README wording | `Doc drift` | Do not treat README wording as stronger contract than code/tests |

## Hard Constraints For Phase 1+

These constraints now follow from the hardened matrix:

1. `Model`, `Pipeline`, and `TxValidator` must remain package-visible until the compat layer is ready.
2. Path-scoped observation is not optional; it must survive in `Observe V2`.
3. Proxy-based mutation must not enter `Core V2`, but proxy-era behavior must remain accessible through compat during migration.
4. `exec`, `write`, and `promise` must be treated as separate legacy pipeline behaviors.
5. `yield()` is a replace-with-new-surface case, not a preserve-as-is case.
6. README-only APIs must not be silently implemented without explicit product intent.

# Rearchitecture Issue Backlog

This backlog is the canonical medium-grained issue set for the first delivery program.

The machine-readable source of truth is [rearchitecture.config.mjs](/Users/vanschroeder/Workspace/datamatic/scripts/rearchitecture.config.mjs). This document is the human-readable summary.

## Issue Set

| ID | Title | Phase | Area | Type | Depends On | Acceptance Focus |
| --- | --- | --- | --- | --- | --- | --- |
| `program-tracker` | Program tracker and decision log | 0 Baseline | Docs | Discovery | - | Canonical program index and locked defaults exist in-repo |
| `legacy-api-matrix` | Legacy API preserve/move/drop matrix | 0 Baseline | Compat | Decision | `program-tracker` | Every current public/runtime surface is explicitly classified |
| `baseline-ci-gates` | Baseline CI and parity gate definition | 0 Baseline | Packaging | Test | `program-tracker` | Phase gates are pinned to Jest, build, and bundle outputs |
| `shared-ajv-wrapper` | Shared AJV wrapper consolidation | 1 Validation Foundation | Schema | Implementation | `baseline-ci-gates` | Model/Pipeline wrapper duplication is removed without behavior drift |
| `schema-helper-normalization` | Schema helper normalization | 1 Validation Foundation | Schema | Implementation | `baseline-ci-gates` | Helper defaults/fallbacks are explicit and regression-tested |
| `properties-schema-resolution` | Properties/schema resolution split | 1 Validation Foundation | Pipeline | Implementation | `baseline-ci-gates` | Schema resolution is separated from runtime wiring |
| `pipeline-v2-core` | Pipeline V2 stage contract and async runtime | 2 Pipeline V2 | Pipeline | Implementation | `shared-ajv-wrapper`, `schema-helper-normalization`, `properties-schema-resolution` | `PipelineV2.run()` exists with explicit async stage semantics |
| `pipeline-v2-adapters` | Pipeline V2 adapters and trace hooks | 2 Pipeline V2 | Pipeline | Implementation | `pipeline-v2-core` | Explicit adapters and trace replacement for `yield()` exist |
| `pipeline-v2-parity` | Pipeline V2 parity test suite | 2 Pipeline V2 | Pipeline | Test | `pipeline-v2-core`, `pipeline-v2-adapters` | Ordering, validation, async, and trace parity are pinned |
| `data-model-lifecycle` | DataModel lifecycle and state engine | 3 Model V2 | Model | Implementation | `shared-ajv-wrapper`, `schema-helper-normalization` | Explicit state engine replaces proxy lifecycle coupling |
| `data-model-path-ops` | DataModel path operations and validation policy | 3 Model V2 | Model | Implementation | `data-model-lifecycle` | `get/set/update/replace/validate/snapshot/reset` exist and are explicit |
| `data-model-parity` | DataModel parity test suite | 3 Model V2 | Model | Test | `data-model-lifecycle`, `data-model-path-ops` | Lifecycle, nested mutation, invalid write, and freeze parity are pinned |
| `observe-event-model` | Observe V2 event model and emitter | 4 Observe V2 | Observe | Implementation | `pipeline-v2-core`, `data-model-lifecycle` | Shared callback/emitter layer exists without RxJS dependency |
| `observable-model` | ObservableModel with path-scoped subscriptions | 4 Observe V2 | Observe | Implementation | `observe-event-model`, `data-model-path-ops` | Root and path-scoped model observation are preserved outside the core |
| `observable-pipeline` | ObservablePipeline and execution events | 4 Observe V2 | Observe | Implementation | `observe-event-model`, `pipeline-v2-adapters` | Pipeline execution emits explicit wrapper events |
| `legacy-pipeline-adapter` | LegacyPipeline compat adapter | 5 Compat V2 | Compat | Implementation | `observable-pipeline`, `pipeline-v2-parity` | `exec/write/promise/pipe` map cleanly onto V2 plus observe |
| `legacy-model-adapter` | LegacyModel compat adapter | 5 Compat V2 | Compat | Implementation | `observable-model`, `data-model-parity` | `model/subscribe/subscribeTo/fromJSON/freeze` legacy paths are preserved |
| `txvalidator-compat-bridge` | TxValidator compat bridge | 5 Compat V2 | Compat | Implementation | `shared-ajv-wrapper`, `pipeline-v2-adapters` | `TxValidator` migration path is explicit and tested |
| `packaging-subpath-exports` | Packaging and subpath export strategy | 6 Packaging and Docs | Packaging | Implementation | `legacy-pipeline-adapter`, `legacy-model-adapter`, `txvalidator-compat-bridge` | V2 entry points are exposed without breaking legacy bundles |
| `docs-and-migration-guide` | Examples, docs, and migration guide | 6 Packaging and Docs | Docs | Docs | `packaging-subpath-exports`, `observable-model`, `observable-pipeline` | V2 and migration paths are documented clearly |
| `integration-continuity` | Integration demo continuity validation | 6 Packaging and Docs | Packaging | Test | `packaging-subpath-exports`, `docs-and-migration-guide` | CommonJS, window, and current demos still function or have explicit replacements |
| `release-hardening` | Release notes and deprecation messaging | 7 Release | Docs | Release | `integration-continuity`, `docs-and-migration-guide` | Compat-only deprecations and release docs are ready for the first V2 cycle |

## Sequencing Rules

- No Phase 1 implementation starts before the Phase 0 matrix and gate definitions are complete.
- Observe issues do not start before the corresponding V2 core issue is done.
- Compat issues do not start before the corresponding V2 core and observe issues are done.
- Packaging/docs do not start before compat parity work is complete.
- Release hardening starts only after packaging, docs, and integration continuity are complete.

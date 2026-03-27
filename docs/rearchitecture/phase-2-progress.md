# Phase 2 Progress

Phase 2 began with the first clean internal runtime seam defined by:

- [pipeline-v2-requirements.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/pipeline-v2-requirements.md)

## Current Cut

Implemented:

- [src/Pipeline/v2/PipelineV2.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/v2/PipelineV2.js)
- [src/Pipeline/v2/stages.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/v2/stages.js)
- [src/Pipeline/v2/index.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/v2/index.js)
- [src/Pipeline/v2/PipelineV2.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/v2/PipelineV2.test.js)
- [src/Pipeline/v2/adapters.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/v2/adapters.js)
- [src/Pipeline/v2/adapters.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/v2/adapters.test.js)
- [src/Pipeline/v2/trace.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/v2/trace.js)
- [src/Pipeline/v2/trace.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/v2/trace.test.js)
- [src/Pipeline/v2/helpers.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/v2/helpers.js)
- [src/Pipeline/v2/exec.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/v2/exec.js)
- [src/Pipeline/v2/exec.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/v2/exec.test.js)
- [src/Pipeline/v2/parity.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/v2/parity.test.js)
- [src/Pipeline/v2/orchestration.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/v2/orchestration.js)
- [src/Pipeline/v2/orchestration.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/v2/orchestration.test.js)
- [src/Pipeline/v2/rate.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/v2/rate.js)
- [src/Pipeline/v2/rate.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/v2/rate.test.js)
- [src/Pipeline/v2/yield.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/v2/yield.js)
- [src/Pipeline/v2/yield.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/v2/yield.test.js)
- [src/Pipeline/v2/clone.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/v2/clone.js)
- [src/Pipeline/v2/clone.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/v2/clone.test.js)

Delivered seam:

- explicit internal `PipelineV2` core with async-first `run(input, ctx)`
- strict stage contract based on `run(input, ctx)`
- explicit transform-stage and validator-stage constructors
- deterministic sequential execution across mixed sync and async stages
- empty-pipeline pass-through behavior in the V2 core
- explicit adapter seam that maps legacy function, schema, validator, validator-like, and `exec(...)` object inputs into V2 stages
- schema detection kept outside the core so legacy coercion does not re-enter `PipelineV2`
- explicit trace/introspection seam that describes stages and captures per-stage input/output without `new Function(...)`
- partial trace capture on failure so compat has a concrete replacement path for legacy `yield()`
- direct-exec bridge that runs legacy exec-style flows through `PipelineV2` while preserving sync return behavior when all stages are sync
- legacy exec error wrapping restored around the V2 runtime as `{ error, data }`
- V2 stage wrappers made sync-aware so direct execution is not needlessly promoted to promises
- first parity suite that compares legacy direct `exec(...)` and legacy `yield()` values against the V2 exec and trace seams
- parity explicitly pinned for the currently supported direct-exec seam, not the still-deferred iterator/array coercion seam
- first internal compat delegation seam: legacy `Pipeline.exec(...)` now delegates to the V2 exec bridge while `write(...)` and observer-driven behavior remain on the legacy runtime
- deferred iterator/array coercion seam is now implemented in the V2 adapters, including raw array stages, `Iterator` instances, and loop-marked iterable stage objects
- direct-exec parity now also covers raw array-wrapped iterator stages against the V2 exec bridge
- internal promise seam now exists around the V2 exec bridge, with parity coverage for supported direct-exec stages and legacy rejection shape
- internal write-side execution seam now routes push-path execution through the V2 exec bridge while leaving observer wiring, throttling, sampling, and completion behavior on the legacy runtime
- explicit write compat helper now owns legacy write-result application and error forwarding, instead of leaving that logic embedded in `PipeListener.next(...)`
- public legacy `Pipeline.promise(...)` now routes through an explicit observer-backed compat helper instead of leaving subscription/write coupling embedded in the method body
- observer-backed promise behavior is now pinned separately from the direct-exec V2 promise bridge so future remaps cannot silently bypass write-driven output state
- legacy `pipe(...)`, `link(...)`, `unlink(...)`, and `merge(...)` orchestration now routes through an explicit compat helper instead of leaving observer wiring and callback normalization embedded in `Pipeline.js`
- orchestration compat behavior is now pinned directly so future observer-era extraction can distinguish link/merge mechanics from throttling and sampling
- legacy `split(...)`, `throttle(...)`, `unthrottle(...)`, and `sample(...)` now route through explicit compat helpers instead of leaving queue-shaping and fan-out behavior embedded in `Pipeline.js`
- the current `unthrottle(false)` cache-flush quirk is now pinned explicitly as compat behavior: because the queue is mutated during iteration, every queued callback is not guaranteed to flush in one pass
- public legacy `yield(...)` now routes through an explicit compat helper instead of using `new Function(...)`, while preserving generator-style sequencing and fallback behavior
- `Iterator.loop(...)` now consumes the non-codegen `yield(...)` path transparently, so the generator seam is explicit without changing iterator behavior
- public legacy `clone()` now routes through an explicit compat helper instead of leaving shared-state aliasing embedded in `Pipeline.js`
- legacy clone semantics are now pinned directly: clones share underlying pipeline state and writable/closed state with the source, while clone creation replaces the shared listeners array with a shallow copy on the shared pipeline props object

## Intentionally Deferred

This cut does not yet move or reimplement legacy pipeline behavior.

Still deferred to later Phase 2 / Phase 5 work:

- subscriptions and push-mode execution
- any future remap of public `Pipeline.promise(...)` onto the direct-exec V2 promise seam until observer-era semantics are explicitly preserved or intentionally changed
- any behavioral redesign of legacy clone semantics beyond the current shared-state compat contract

## Preserved Constraints

This cut intentionally preserves:

- existing root package exports remain unchanged
- existing `Pipeline` runtime remains unchanged
- no `Proxy`, RxJS, or `new Function(...)` usage in the V2 core
- validator and transform stages remain composable in the V2 core

## Verification

Verified locally after the first Phase 2 cut:

- `npm test -- --runInBand src/Pipeline/v2/PipelineV2.test.js`
- `npm test -- --runInBand src/Pipeline/v2/adapters.test.js src/Pipeline/v2/PipelineV2.test.js`
- `npm test -- --runInBand src/Pipeline/v2/trace.test.js src/Pipeline/v2/adapters.test.js src/Pipeline/v2/PipelineV2.test.js`
- `npm test -- --runInBand src/Pipeline/v2/exec.test.js src/Pipeline/v2/trace.test.js src/Pipeline/v2/adapters.test.js src/Pipeline/v2/PipelineV2.test.js`
- `npm test -- --runInBand src/Pipeline/v2/parity.test.js src/Pipeline/v2/exec.test.js src/Pipeline/v2/trace.test.js src/Pipeline/v2/adapters.test.js src/Pipeline/v2/PipelineV2.test.js src/Pipeline/Pipe-api.test.js`
- `npm test -- --runInBand src/Pipeline/Pipe.test.js src/Pipeline/coverage-extra.test.js src/Pipeline/Pipe-api.test.js src/Pipeline/v2/parity.test.js src/Pipeline/v2/exec.test.js src/Pipeline/v2/trace.test.js src/Pipeline/v2/adapters.test.js src/Pipeline/v2/PipelineV2.test.js src/Pipeline/v2/promise.test.js`
- `npm test -- --runInBand src/Pipeline/v2/write.test.js src/Pipeline/Pipe.test.js src/Pipeline/coverage-extra.test.js src/Pipeline/Pipe-api.test.js src/Pipeline/v2/parity.test.js src/Pipeline/v2/exec.test.js src/Pipeline/v2/trace.test.js src/Pipeline/v2/adapters.test.js src/Pipeline/v2/PipelineV2.test.js src/Pipeline/v2/promise.test.js`
- `npm test -- --runInBand src/Pipeline/v2/promise.test.js src/Pipeline/Pipe.test.js src/Pipeline/coverage-extra.test.js src/Pipeline/Pipe-api.test.js src/Pipeline/v2/parity.test.js src/Pipeline/v2/exec.test.js src/Pipeline/v2/trace.test.js src/Pipeline/v2/adapters.test.js src/Pipeline/v2/PipelineV2.test.js src/Pipeline/v2/write.test.js`
- `npm test -- --runInBand src/Pipeline/v2/orchestration.test.js src/Pipeline/Pipe-api.test.js src/Pipeline/coverage-extra.test.js src/Pipeline/Pipe.test.js src/Pipeline/v2/parity.test.js src/Pipeline/v2/promise.test.js src/Pipeline/v2/write.test.js src/Pipeline/v2/exec.test.js src/Pipeline/v2/trace.test.js src/Pipeline/v2/adapters.test.js src/Pipeline/v2/PipelineV2.test.js`
- `npm test -- --runInBand src/Pipeline/v2/rate.test.js src/Pipeline/v2/orchestration.test.js src/Pipeline/Pipe-api.test.js src/Pipeline/coverage-extra.test.js src/Pipeline/Pipe.test.js src/Pipeline/v2/parity.test.js src/Pipeline/v2/promise.test.js src/Pipeline/v2/write.test.js src/Pipeline/v2/exec.test.js src/Pipeline/v2/trace.test.js src/Pipeline/v2/adapters.test.js src/Pipeline/v2/PipelineV2.test.js`
- `npm test -- --runInBand src/Pipeline/v2/yield.test.js src/Pipeline/Iterator.test.js src/Pipeline/Pipe-api.test.js src/Pipeline/coverage-extra.test.js src/Pipeline/v2/parity.test.js src/Pipeline/v2/rate.test.js src/Pipeline/v2/orchestration.test.js src/Pipeline/v2/promise.test.js src/Pipeline/v2/write.test.js src/Pipeline/v2/exec.test.js src/Pipeline/v2/trace.test.js src/Pipeline/v2/adapters.test.js src/Pipeline/v2/PipelineV2.test.js`
- `npm test -- --runInBand src/Pipeline/v2/clone.test.js src/Pipeline/Pipe-api.test.js src/Pipeline/coverage-extra.test.js src/Pipeline/Pipe.test.js src/Pipeline/v2/yield.test.js src/Pipeline/Iterator.test.js src/Pipeline/v2/rate.test.js src/Pipeline/v2/orchestration.test.js src/Pipeline/v2/parity.test.js src/Pipeline/v2/promise.test.js src/Pipeline/v2/write.test.js src/Pipeline/v2/exec.test.js src/Pipeline/v2/trace.test.js src/Pipeline/v2/adapters.test.js src/Pipeline/v2/PipelineV2.test.js`
- `npm test -- --runInBand`
- `npm run build`

Observed green baseline after the current Phase 2 cut:

- Jest: `35` suites passing
- Jest: `36` suites passing
- Jest: `37` suites passing
- Jest: `38` suites passing
- Jest: `39` suites passing
- Jest: `40` suites passing
- Jest: `320` tests passing
- Build outputs produced:
  - `dist/datamatic.node.js`
  - `dist/datamatic.umd.js`
  - `dist/datamatic.window.js`

## Next Move

The next logical move after this cut is:

- perform Phase 2 operational closeout, or
- begin Phase 3 `DataModel` implementation work if you want to keep momentum on the runtime buildout

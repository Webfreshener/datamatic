# Phase 2 Closeout

Phase 2 focused on the pipeline seams identified in:

- [pipeline-v2-requirements.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/pipeline-v2-requirements.md)

## Delivered Changes

### Core and Adapter Foundations

Implemented through:

- [src/Pipeline/v2/PipelineV2.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/v2/PipelineV2.js)
- [src/Pipeline/v2/stages.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/v2/stages.js)
- [src/Pipeline/v2/adapters.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/v2/adapters.js)
- [src/Pipeline/v2/helpers.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/v2/helpers.js)

Delivered seam:

- explicit internal `PipelineV2.run(input, ctx)` core
- deterministic mixed sync/async stage execution
- explicit transform and validator stage wrappers
- adapter-owned coercion for legacy function, schema, validator, iterator, and array-wrapped stage inputs

### Trace and Direct Execution Seams

Implemented through:

- [src/Pipeline/v2/trace.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/v2/trace.js)
- [src/Pipeline/v2/exec.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/v2/exec.js)
- [src/Pipeline/v2/parity.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/v2/parity.test.js)

Delivered seam:

- explicit trace replacement for legacy `yield()` introspection
- direct-exec bridge from legacy `Pipeline.exec(...)` into V2
- preserved legacy `{ error, data }` failure wrapping for the supported direct-exec seam
- parity coverage for sync, async, validator, and iterator-backed direct execution

### Observer-Era Compat Seams

Implemented through:

- [src/Pipeline/v2/promise.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/v2/promise.js)
- [src/Pipeline/v2/write.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/v2/write.js)
- [src/Pipeline/v2/orchestration.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/v2/orchestration.js)
- [src/Pipeline/v2/rate.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/v2/rate.js)
- [src/Pipeline/v2/yield.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/v2/yield.js)
- [src/Pipeline/v2/clone.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/v2/clone.js)
- [src/Pipeline/Pipeline.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/Pipeline.js)

Delivered seam:

- legacy `promise(...)` remains observer-backed through an explicit compat helper
- push-path execution routes through the V2 exec seam while observer wiring stays legacy-owned
- `pipe`, `link`, `unlink`, `merge`, and `split` now use explicit compat helpers
- `throttle`, `unthrottle`, and `sample` now use explicit compat helpers
- public legacy `yield(...)` no longer depends on `new Function(...)`
- legacy `clone()` semantics are explicit and pinned as shared-state compat behavior

## Preserved Constraints

Phase 2 intentionally preserved:

- existing root exports remain `Model`, `Pipeline`, and `TxValidator`
- existing `Pipeline` constructor surface remains package-visible
- subscriptions, push-mode ownership, and observable delivery remain outside `PipelineV2` core
- no `Proxy`, RxJS, or runtime code generation in the V2 core
- current queue-shaping quirks and clone aliasing semantics remain compat behavior, not silent cleanup targets

## Verification

Verified locally after the final Phase 2 cut:

- `npm test -- --runInBand`
- `npm run build`

Observed green baseline after Phase 2:

- Jest: `40` suites passing
- Jest: `320` tests passing
- Build outputs produced:
  - `dist/datamatic.node.js`
  - `dist/datamatic.umd.js`
  - `dist/datamatic.window.js`

## Exit Condition

Phase 2 is considered complete because:

1. the planned `PipelineV2` core, adapter, trace, parity, and compat seams now exist in code
2. the obvious legacy pipeline compat edges have been extracted and pinned explicitly
3. the repo remains green against the Phase 0 parity gates

## Next Phase

The next implementation phase is:

- [model-v2-requirements.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/model-v2-requirements.md)

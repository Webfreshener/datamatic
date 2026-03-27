# Baseline CI And Parity Gates

This document defines the Phase 0 executable baseline for the current repo.

It is intentionally conservative. No Phase 1+ work should loosen these gates without an explicit replacement plan.

## Primary Gate Commands

Run from repo root:

```bash
npm test -- --runInBand
npm run build
```

## Current Expected Baseline

The currently observed baseline for this repo is:

- Jest: `29` test suites passing
- Jest: `249` tests passing
- Build outputs produced:
  - `dist/datamatic.node.js`
  - `dist/datamatic.umd.js`
  - `dist/datamatic.window.js`

Related repo references:

- [package.json](/Users/vanschroeder/Workspace/datamatic/package.json)
- [webpack.config.js](/Users/vanschroeder/Workspace/datamatic/webpack.config.js)
- [docs/rearchitecture/decision-log.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/decision-log.md)

## Compatibility-Sensitive Gate Areas

### Distribution Targets

These outputs are active compatibility targets and should remain green until an explicit replacement exists:

- Node/CommonJS bundle: `dist/datamatic.node.js`
- UMD bundle: `dist/datamatic.umd.js`
- Window bundle: `dist/datamatic.window.js`

### Public Entry Surface

These exports are compatibility gates:

- `Model`
- `Pipeline`
- `TxValidator`

Observed in:

- [src/index.js](/Users/vanschroeder/Workspace/datamatic/src/index.js)
- [src/Pipeline/index.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/index.js)

### Integration Continuity

Current repo integration touchpoints that should not silently break:

- [integration/commonjs-node/index.js](/Users/vanschroeder/Workspace/datamatic/integration/commonjs-node/index.js)
- [integration/window-html/index.html](/Users/vanschroeder/Workspace/datamatic/integration/window-html/index.html)
- [integration/umd-react/index.html](/Users/vanschroeder/Workspace/datamatic/integration/umd-react/index.html)
- [integration/umd-angular](/Users/vanschroeder/Workspace/datamatic/integration/umd-angular)

### Current Warning Path

The current Ajv strict-types warning path is tracked as compatibility-sensitive behavior, not automatic cleanup.

Reference:

- [decision-log.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/decision-log.md)

## Phase 0 Test Inventory

Current test files under `src/`:

### Model

- [src/Model/_ajvWrapper-mock.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/_ajvWrapper-mock.test.js)
- [src/Model/_ajvWrapper.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/_ajvWrapper.test.js)
- [src/Model/_metadata.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/_metadata.test.js)
- [src/Model/_observerBuilder.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/_observerBuilder.test.js)
- [src/Model/_references.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/_references.test.js)
- [src/Model/_schemaHelpers.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/_schemaHelpers.test.js)
- [src/Model/base-model.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/base-model.test.js)
- [src/Model/coverage-extra.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/coverage-extra.test.js)
- [src/Model/index.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/index.test.js)
- [src/Model/itemsModel.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/itemsModel.test.js)
- [src/Model/model-pipes.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/model-pipes.test.js)
- [src/Model/model-rxjs.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/model-rxjs.test.js)
- [src/Model/observability.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/observability.test.js)
- [src/Model/propertiesModel.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/propertiesModel.test.js)
- [src/Model/utils.test.js](/Users/vanschroeder/Workspace/datamatic/src/Model/utils.test.js)

### Pipeline

- [src/Pipeline/Iterator.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/Iterator.test.js)
- [src/Pipeline/Pipe-api.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/Pipe-api.test.js)
- [src/Pipeline/Pipe.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/Pipe.test.js)
- [src/Pipeline/Utils.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/Utils.test.js)
- [src/Pipeline/Validator.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/Validator.test.js)
- [src/Pipeline/_ajvWrapper-mock.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/_ajvWrapper-mock.test.js)
- [src/Pipeline/_ajvWrapper.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/_ajvWrapper.test.js)
- [src/Pipeline/coverage-extra.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/coverage-extra.test.js)
- [src/Pipeline/vxBehaviorSubject.test.js](/Users/vanschroeder/Workspace/datamatic/src/Pipeline/vxBehaviorSubject.test.js)

### Package/Distribution

- [src/complex-schema.test.js](/Users/vanschroeder/Workspace/datamatic/src/complex-schema.test.js)
- [src/dist.test.js](/Users/vanschroeder/Workspace/datamatic/src/dist.test.js)
- [src/index-polyfill.test.js](/Users/vanschroeder/Workspace/datamatic/src/index-polyfill.test.js)
- [src/index.test.js](/Users/vanschroeder/Workspace/datamatic/src/index.test.js)
- [src/static-modules.test.js](/Users/vanschroeder/Workspace/datamatic/src/static-modules.test.js)

## Required Phase Gates

Every phase gate should enforce:

1. `npm test -- --runInBand` passes.
2. `npm run build` passes.
3. Existing `dist/` bundle targets are still produced unless the phase explicitly owns a replacement.
4. No current public export disappears without an approved compat or packaging issue covering it.
5. Any behavior change to validation, observation, freeze, push-mode pipeline flow, or path access is explicitly documented.

## High-Risk Areas To Watch

- Proxy-driven model mutation and `$model` owner exposure
- Path-scoped observation semantics
- `Pipeline.exec`, `write`, and `promise` behavior drift
- `yield()` behavior and any `new Function(...)` replacement
- `TxValidator` constructor/config acceptance and error shape
- Integration examples that consume `dist/datamatic.window.js`

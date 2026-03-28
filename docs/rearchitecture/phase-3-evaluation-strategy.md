# Phase 3 Evaluation Strategy

This document defines the decision framework for the remaining Phase 3 model work.

It is intentionally `compat-first`. A Phase 3 seam should not move simply because it can be extracted cleanly. It should move only when the extraction preserves the current caller-visible legacy `Model` behavior and keeps proxy/observe concerns out of `DataModel` core.

It is based on:

- [model-v2-requirements.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/model-v2-requirements.md)
- [compat-v2-requirements.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/compat-v2-requirements.md)
- [baseline-parity-gates.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/baseline-parity-gates.md)
- [phase-3-progress.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/phase-3-progress.md)

## Decision Loop

Every remaining Phase 3 decision must be evaluated in this order:

1. Classify the seam as one of:
   - `Core-safe`
   - `Compat-safe`
   - `Observe-owned`
   - `Defer`
2. Collect truth from current source and tests:
   - whether the behavior is root-owned, proxy-owned, observe-owned, or bridge-owned
   - whether the current public/runtime behavior throws, no-ops, mutates, emits errors, or notifies observers
3. Score the seam:
   - behavior preservation
   - core contamination risk
   - compat clarity
   - proof cost
   - rollback simplicity
4. Choose one outcome:
   - `Implement now`
   - `Implement as compat seam only`
   - `Defer`

## Acceptance Rule

A remaining Phase 3 cut is accepted only if all of the following are true:

1. It is not primarily observe-owned.
2. It does not require proxy semantics inside `DataModel`.
3. It preserves legacy behavior at the public boundary.
4. It can be proven with focused tests plus the repo baseline.
5. It leaves the next phase cleaner instead of relocating complexity.

If any of those fail, the seam is deferred to Phase 4 observe work or Phase 5 compat work.

## Required Evidence

Every accepted Phase 3 decision must produce:

- a short decision note in [phase-3-progress.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/phase-3-progress.md)
- focused tests that pin the migrated behavior directly
- parity test extension only when the seam is migration-critical
- full baseline verification:
  - `npm test -- --runInBand`
  - `npm run build`

Riskier seams also require:

- a dedicated side-by-side parity check between legacy behavior and the new V2/compat seam

## Seam Gates

### Nested proxy-owned mutation

Default outcome: `Defer`

Do not move this seam in Phase 3 unless the extraction can preserve:

- non-throwing vs throwing behavior
- dirty/clean behavior
- required vs optional delete behavior
- array mutation behavior
- observer side effects

### Root-owned helper migration

Default outcome: `Compat-safe`

Minimum evidence:

- same public return/throw behavior
- same freeze/reset side effects
- same `fromJSON(...)` acceptance and error wording
- no public API surface change

### Model-to-pipeline bridge

Default outcome: `Defer unless narrowly isolated`

Minimum evidence:

- pipeline closes correctly after freeze
- normal bridge behavior still works
- no observe coupling leaks into `DataModel` core

### Observation-related behavior

Default outcome: `Observe-owned`

Do not move this seam in Phase 3 unless the change is limited to hook-shaping with zero behavior change.

## Current Application

Current evaluated Phase 3 seam positions:

- Root-owned helper migration: `Compat-safe`, accepted
  - already applied to root replacement, `freeze()`, and shared `fromJSON(...)` parsing
- Nested proxy-owned mutation: `Defer`
  - still too coupled to proxy behavior, dirty/clean tracking, and observer effects
- Model-to-pipeline bridge: `Defer unless narrowly isolated`
  - only current freeze-driven pipeline closure remains in scope as a preserved side effect
- Observation-related behavior: `Observe-owned`
  - deferred to Phase 4 by default

## Defaults

- optimization priority is `Compat First`
- full baseline verification remains mandatory after every accepted cut
- public behavior preservation matters more than internal unification speed
- explicit compat helpers are preferred over broad public remaps
- anything strongly coupled to subscriptions or path observers defaults to Phase 4 or Phase 5

# Datamatic Rearchitecture Program

This directory is the canonical workspace for the Datamatic rearchitecture program.

## Status

- Current package remains the supported surface.
- V2 is planned as an in-repo parallel track.
- The GitHub project, issue backlog, fields, labels, milestones, and saved views now exist remotely.
- Phase 0 is complete.
- Phase 1 validation-foundation work is complete and verified green.
- Phase 2 pipeline work is complete and verified green.
- Phase 3 model work is in progress.

## Baseline

The current repo baseline was verified before these artifacts were created:

- Jest: `29` suites passing, `249` tests passing
- Build: `datamatic.node.js`, `datamatic.umd.js`, and `datamatic.window.js` build successfully
- Existing root exports remain `Model` and `Pipeline`

Current verified baseline after Phase 1 implementation:

- Jest: `29` suites passing, `254` tests passing
- Build: `datamatic.node.js`, `datamatic.umd.js`, and `datamatic.window.js` build successfully
- Existing root exports remain `Model`, `Pipeline`, and `TxValidator`

Current verified baseline after the current Phase 2 cut:

- Jest: `40` suites passing, `320` tests passing
- Build: `datamatic.node.js`, `datamatic.umd.js`, and `datamatic.window.js` build successfully
- Existing root exports remain `Model`, `Pipeline`, and `TxValidator`

Current verified baseline after the current Phase 3 cut:

- Jest: `46` suites passing, `360` tests passing
- Build: `datamatic.node.js`, `datamatic.umd.js`, and `datamatic.window.js` build successfully
- Existing root exports remain `Model`, `Pipeline`, and `TxValidator`

## Artifacts

- [decision-log.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/decision-log.md)
  Locked program decisions and observed repo facts.
- [preserve-move-drop-matrix.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/preserve-move-drop-matrix.md)
  Current public/runtime surface classified into `Core V2`, `Observe V2`, `Compat V2`, `Drop`, or `Doc drift`.
- [current-public-surface-inventory.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/current-public-surface-inventory.md)
  Source-based inventory of the current exported and effectively public runtime surface.
- [baseline-parity-gates.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/baseline-parity-gates.md)
  Executable Phase 0 gates for tests, builds, bundles, and compatibility-sensitive behavior.
- [validation-foundation-requirements.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/validation-foundation-requirements.md)
  Explicit preservation requirements for the Phase 1 AJV, schema-helper, and schema-resolution refactors.
- [phase-1-closeout.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/phase-1-closeout.md)
  Delivered Phase 1 changes, preserved constraints, and verified post-implementation baseline.
- [pipeline-v2-requirements.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/pipeline-v2-requirements.md)
  Explicit preservation and parity requirements for the Phase 2 pipeline redesign.
- [phase-2-progress.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/phase-2-progress.md)
  Current Phase 2 implementation state for the internal `PipelineV2` core, adapter, and compat seams.
- [phase-2-closeout.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/phase-2-closeout.md)
  Delivered Phase 2 changes, preserved constraints, and verified post-implementation baseline.
- [model-v2-requirements.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/model-v2-requirements.md)
  Explicit lifecycle, mutation, and parity requirements for the Phase 3 model redesign.
- [phase-3-evaluation-strategy.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/phase-3-evaluation-strategy.md)
  Compat-first decision framework and evidence standard for remaining Phase 3 model cuts.
- [phase-3-progress.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/phase-3-progress.md)
  Current Phase 3 implementation state for the internal `DataModel` core, compat seams, and selective legacy-model delegation.
- [observe-v2-requirements.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/observe-v2-requirements.md)
  Explicit subscription, event-channel, and parity requirements for the Phase 4 observation redesign.
- [compat-v2-requirements.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/compat-v2-requirements.md)
  Explicit legacy-surface preservation requirements for the Phase 5 compatibility layer.
- [packaging-docs-requirements.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/packaging-docs-requirements.md)
  Explicit distribution, docs, and integration continuity requirements for the Phase 6 packaging and migration work.
- [release-hardening-requirements.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/release-hardening-requirements.md)
  Explicit first-release boundary, deprecation, and release-note requirements for the Phase 7 release hardening work.
- [issue-backlog.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/issue-backlog.md)
  Medium-grained backlog aligned to the phased delivery plan.
- [github-project-v2.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/github-project-v2.md)
  GitHub Projects V2 board definition and setup procedure.

## Seed Automation

The canonical machine-readable seed is:

- [rearchitecture.config.mjs](/Users/vanschroeder/Workspace/datamatic/scripts/rearchitecture.config.mjs)

The GitHub bootstrap entry point is:

- [bootstrap-github-rearchitecture.mjs](/Users/vanschroeder/Workspace/datamatic/scripts/bootstrap-github-rearchitecture.mjs)

The bootstrap script is intentionally conservative:

- It supports dry-run output by default.
- It can create labels, milestones, issues, project fields, and project item field values when `gh` auth is available.
- Saved project views are validated through the REST API, but are not yet folded into the script because duplicate-safe CRUD behavior has not been fully normalized.

## Supporting Inputs

The existing narrow refactor notes under `docs/refactor-plans/` remain active inputs to the larger program:

- AJV wrappers
- schema helpers
- properties orchestration
- pipeline internals
- model base

Those workstreams are folded into the phased backlog rather than replaced.

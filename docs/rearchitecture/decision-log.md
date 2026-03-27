# Rearchitecture Decision Log

## Locked Defaults

### DL-0001: Delivery posture is strict parallel

The current package stays green and shippable while V2 is built beside it.

### DL-0002: V2 starts in-repo

The program starts inside the existing single-package repo. No immediate monorepo or workspace split is allowed.

### DL-0003: V2 core excludes three current implementation pillars

The V2 core must not depend on:

- Proxy-backed mutation semantics
- RxJS runtime wiring
- `new Function(...)` code generation

### DL-0004: Path-scoped observation is preserved

Current `subscribeTo(path, ...)` behavior is not treated as disposable. It moves out of the core and into the V2 observe layer.

### DL-0005: Legacy top-level exports remain during the buildout

`Model` and `Pipeline` remain the supported top-level exports until V2 parity gates pass and compat is in place.

### DL-0006: Existing distribution targets remain until explicitly replaced

The current build outputs remain required during Phases 0 through 6:

- `dist/datamatic.node.js`
- `dist/datamatic.umd.js`
- `dist/datamatic.window.js`

### DL-0007: GitHub is the tracking system

Program tracking is defined against GitHub Projects V2, milestones, labels, and issues.

## Observed Repo Facts

### OF-0001: Test and build baseline are green

Verified locally:

- `npm test -- --runInBand`
- `npm run build`

Observed baseline after Phase 1 implementation closeout:

- Jest: `29` suites passing
- Jest: `254` tests passing
- Build outputs: `datamatic.node.js`, `datamatic.umd.js`, and `datamatic.window.js`

Observed baseline after the first Phase 2 implementation cut:

- Jest: `35` suites passing
- Jest: `36` suites passing
- Jest: `37` suites passing
- Jest: `38` suites passing
- Jest: `39` suites passing
- Jest: `40` suites passing
- Jest: `320` tests passing
- Build outputs: `datamatic.node.js`, `datamatic.umd.js`, and `datamatic.window.js`

### OF-0002: Current repo tracking conventions started minimal

The repo started this program with:

- no issue templates
- no PR templates
- no existing project-board definitions
- no existing label taxonomy stored in-repo

The rearchitecture program has since added its own GitHub project, labels, milestones, and issue taxonomy.

### OF-0003: GitHub CLI is available and authenticated for the program board

Verified locally:

- `gh` is installed
- `gh auth status` succeeds for `webfreshener-agent`
- the GitHub project and seeded backlog exist remotely

### OF-0004: Existing refactor notes already exist

Current supporting workstreams are already documented under `docs/refactor-plans/`.

### OF-0005: Current README has at least one API drift item

`README.md` documents `Pipeline.once`, but no runtime implementation exists for `once` in `src/Pipeline/`.

### OF-0006: Current AJV behavior includes a strict-types warning path

The current test suite emits an Ajv strict-types warning in at least one path. This is treated as a compatibility finding, not an automatic cleanup target.

## Program Constraints

### PC-0001: Remote GitHub mutations must remain explicit and auditable

Remote GitHub setup and backlog updates are allowed from this environment, but they must stay scriptable, reviewable, and consistent with the in-repo program docs.

### PC-0002: No hidden migration decisions

Current public/runtime surfaces must be classified explicitly as:

- `Core V2`
- `Observe V2`
- `Compat V2`
- `Drop`
- `Doc drift`

### PC-0003: Existing refactor notes are not discarded

The narrower notes are treated as subordinate backlog inputs within the broader rearchitecture program.

### PC-0004: Pipeline V2 starts as a strict internal core

The first Phase 2 implementation cut introduces `PipelineV2` as an internal async-first stage runner under `src/Pipeline/v2/` without changing the public package surface or legacy `Pipeline` constructor semantics.

### PC-0005: V2 stage wrappers must remain sync-aware

Phase 2 adapter and exec work requires stage wrappers to preserve direct sync return behavior when the adapted stage flow is synchronous, even though `PipelineV2.run(...)` remains async-first.

### PC-0006: Legacy `Pipeline.exec(...)` may delegate before push-mode migration

Phase 2 is allowed to route direct legacy `exec(...)` through the V2 exec bridge before any `write(...)`, subscription, throttling, or other observer-driven behavior is migrated, as long as the direct-exec surface remains parity-tested.

### PC-0007: Iterator-style coercion belongs in adapters, not core

Array-wrapped stage flows, `Iterator` instances, and loop-marked iterable stage sources are compatibility concerns that may target `PipelineV2`, but their record-wise iteration semantics must stay outside the V2 core contract itself.

### PC-0008: Promise compatibility may be proven before public remap

Phase 2 may introduce a V2-backed promise bridge and parity coverage before the public legacy `Pipeline.promise(...)` method is redirected, so the promise surface can be validated independently from the push/subscription runtime.

### PC-0009: Push-path execution may delegate before observer migration

Phase 2 is allowed to route internal write-path execution through the V2 exec bridge before subscriptions, throttling, sampling, and other observer-era mechanics are migrated, as long as those observer mechanics remain behaviorally unchanged and regression-tested.

### PC-0010: Observer-era write application should have an explicit compat seam

As Phase 2 progresses into push-mode behavior, the logic that applies execution results to legacy observers and output validators should move into explicit compat helpers instead of remaining embedded in listener methods.

### PC-0011: Public `Pipeline.promise(...)` stays observer-backed until that behavior is intentionally redesigned

Phase 2 may extract the public promise pathway into an explicit compat helper, but it must remain tied to legacy `subscribe(...)` and `write(...)` behavior until throttling, sampling, state updates, and error-channel semantics are either preserved deliberately or redesigned explicitly.

### PC-0012: Observer-era pipeline orchestration should move out of `Pipeline.js` before behavior changes

Phase 2 may extract `pipe(...)`, `link(...)`, `unlink(...)`, and `merge(...)` into explicit compat helpers before redesigning any of those surfaces, so callback normalization, link bookkeeping, and observer wiring become testable seams without entering the V2 core.

### PC-0013: Queue-shaping behavior is compat-owned, including current flush quirks

Phase 2 may extract `split(...)`, `throttle(...)`, `unthrottle(...)`, and `sample(...)` into explicit compat helpers, but it must preserve current queue-shaping behavior as observed today, including the fact that `unthrottle(false)` mutates the cache while iterating and therefore does not guarantee a full single-pass flush of queued callbacks.

### PC-0014: Public legacy `yield(...)` must no longer depend on runtime code generation

Phase 2 may keep the legacy generator surface reachable, but it should do so through an explicit compat helper rather than `new Function(...)`. Generator-style sequencing and iterator compatibility must remain stable while the code-generation dependency is removed.

### PC-0015: Legacy `clone()` semantics are compat-owned shared-state behavior

Phase 2 may extract `clone()` into an explicit compat helper, but it must preserve the current semantics: the clone aliases the same underlying pipeline state and writable/closed state as the source, and clone creation replaces the shared listeners array with a shallow copy on the shared pipeline props object.

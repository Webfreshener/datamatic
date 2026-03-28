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

Observed baseline after Phase 3 closeout:

- Jest: `47` suites passing
- Jest: `363` tests passing
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

### PC-0016: DataModel starts as an explicit lifecycle core, not a proxy replacement

The first Phase 3 implementation cut may introduce `DataModel` under `src/Model/v2/`, but it must begin as an explicit state engine with lifecycle methods and validation-before-commit semantics. Proxy traps, path-scoped observation, `$model` navigation, and legacy `Model` delegation remain outside this first seam.

### PC-0017: DataModel path operations validate whole-candidate state and keep delete policy explicit

As Phase 3 expands beyond lifecycle, `DataModel` path operations may add `get`, `set`, `update`, `delete`, and `validateAt`, but nested mutations must still validate the full candidate root before commit. Required-vs-optional deletion is not inferred implicitly inside the core; it remains an explicit policy hook until schema-aware compat or path-policy work binds that decision to legacy behavior.

### PC-0018: Phase 3 parity covers core-preserved behavior first, not compat-owned surfaces by implication

The initial Phase 3 parity suite may prove root replacement, nested mutation, invalid-write protection, freeze, reset, and explicit delete-policy behavior against the legacy runtime, but schema lookup helpers, `fromJSON(...)`, path-scoped observation, and model-to-pipeline bridging remain outside parity scope until the relevant compat or observe seams exist.

### PC-0019: Schema-aware path policy belongs in the V2 model seam before compat

Phase 3 may teach `DataModel` how to resolve schemas at explicit paths and derive a default delete policy from those schemas, including required-field and `minItems` behavior. This belongs in the V2 model seam so later compat work does not need to hardcode required-vs-optional path policy outside the model boundary.

### PC-0020: Legacy root-model delegation starts as an internal adapter seam, not a public remap

Phase 3 may introduce an internal `LegacyModelAdapter` that validates root replacement, reset, and freeze through `DataModel` and then applies those operations to the current legacy runtime. This seam is allowed to support later migration work, but it does not by itself authorize remapping the public `Model` API or proxy behavior onto the V2 core.

### PC-0021: Public root-owned model helpers may delegate through V2 compat seams before proxy migration

Phase 3 may route public root replacement and `Model.freeze()` through explicit V2 compat helpers, as long as the current legacy surface still behaves the same from the caller's point of view. In particular, invalid public root replacement must remain non-throwing even if adapter-owned paths use stricter V2 preflight semantics.

### PC-0022: JSON bootstrap parsing is a shared compat concern

Phase 3 may centralize `fromJSON(...)` parsing into a V2-owned helper so public `Model.fromJSON(...)` and adapter/bootstrap code stop duplicating the same string/object gate and legacy error wording. This does not, by itself, change the public return types or authorize broader public V2 exposure.

### PC-0023: Remaining Phase 3 model decisions use a compat-first evaluation loop

After the initial root-owned helper delegation, the remaining Phase 3 decisions must be screened explicitly before implementation. A seam should move only when it preserves public legacy behavior, keeps proxy/observe concerns out of `DataModel` core, reduces compat complexity instead of relocating it, and can be proven with focused tests plus the full repo baseline. If that evidence is not available, the seam is deferred to Phase 4 observe work or Phase 5 compat work.

### PC-0024: The model-to-pipeline bridge may move only as a narrow compat helper seam in Phase 3

Phase 3 may extract `BaseModel.pipeline(...)` wiring into an explicit compat helper when the move is narrowly isolated and preserves the current behavior exactly: model emissions still write into the created pipeline, model completion still closes that pipeline, and no observe or proxy semantics are moved into `DataModel` core. Broader bridge redesign remains deferred.

### PC-0025: Root-owned schema/path reads may move as explicit compat helpers in Phase 3

Phase 3 may extract read-only root helpers such as schema lookup by key, schema lookup by path, and `getPath(...)` into explicit compat helpers when the move is behavior-preserving and does not alter observer fanout. `getModelsInPath(...)` is not covered by this allowance because it is still part of notifier dispatch behavior.

### PC-0026: Phase 3 ends at explicit compat foundations, not proxy or observe remapping

Phase 3 is considered complete once lifecycle, path, parity, root-owned compat helpers, and narrowly isolated bridge/read seams are implemented and verified green. Remaining proxy-owned mutation extraction and observation behavior are explicit deferrals, not Phase 3 omissions.

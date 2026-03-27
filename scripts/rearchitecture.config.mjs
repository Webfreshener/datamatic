export const projectConfig = {
  name: "Datamatic Rearchitecture",
  repoDefault: "Webfreshener/datamatic",
  fields: [
    {
      name: "Workflow Status",
      dataType: "SINGLE_SELECT",
      options: ["Backlog", "Ready", "In Progress", "In Review", "Blocked", "Done"],
    },
    {
      name: "Phase",
      dataType: "SINGLE_SELECT",
      options: [
        "0 Baseline",
        "1 Validation Foundation",
        "2 Pipeline V2",
        "3 Model V2",
        "4 Observe V2",
        "5 Compat V2",
        "6 Packaging and Docs",
        "7 Release",
      ],
    },
    {
      name: "Work Type",
      dataType: "SINGLE_SELECT",
      options: ["Discovery", "Decision", "Implementation", "Test", "Docs", "Release"],
    },
    {
      name: "Area",
      dataType: "SINGLE_SELECT",
      options: ["Schema", "Model", "Pipeline", "Observe", "Compat", "Packaging", "Docs"],
    },
    {
      name: "Size",
      dataType: "SINGLE_SELECT",
      options: ["S", "M", "L"],
    },
    {
      name: "Risk",
      dataType: "SINGLE_SELECT",
      options: ["Low", "Medium", "High"],
    },
  ],
  views: [
    {
      name: "Execution Board",
      layout: "board",
      groupBy: "Workflow Status",
      filter: "open items",
    },
    {
      name: "Roadmap",
      layout: "roadmap",
      groupBy: "Phase",
      filter: "all items",
    },
    {
      name: "Discovery",
      layout: "table",
      filter: "Work Type is Discovery or Decision",
    },
    {
      name: "Implementation",
      layout: "table",
      filter: "Work Type is Implementation or Test",
    },
    {
      name: "Docs and Release",
      layout: "table",
      filter: "Area is Docs or Work Type is Release",
    },
  ],
  labels: [
    { name: "area:schema", color: "0e8a16", description: "Schema, validator, and AJV foundation work" },
    { name: "area:model", color: "1d76db", description: "Model runtime and lifecycle work" },
    { name: "area:pipeline", color: "fbca04", description: "Pipeline runtime and execution work" },
    { name: "area:observe", color: "5319e7", description: "Observation and event layer work" },
    { name: "area:compat", color: "bfd4f2", description: "Compatibility and legacy migration work" },
    { name: "area:packaging", color: "cfd3d7", description: "Build, bundle, export, and integration work" },
    { name: "area:docs", color: "0075ca", description: "Docs, planning, and migration guidance work" },
    { name: "type:discovery", color: "d4c5f9", description: "Discovery work item" },
    { name: "type:decision", color: "7057ff", description: "Decision and policy work item" },
    { name: "type:implementation", color: "0e8a16", description: "Implementation work item" },
    { name: "type:test", color: "fbca04", description: "Test and parity work item" },
    { name: "type:docs", color: "0075ca", description: "Documentation work item" },
    { name: "type:release", color: "b60205", description: "Release and rollout work item" },
    { name: "priority:p0", color: "b60205", description: "Highest priority" },
    { name: "priority:p1", color: "d93f0b", description: "Important follow-on priority" },
    { name: "priority:p2", color: "fbca04", description: "Standard priority" },
  ],
  milestones: [
    {
      title: "Phase 0 - Baseline and Inventory",
      description: "Program setup, decision log, preserve/move/drop matrix, and CI parity gates.",
    },
    {
      title: "Phase 1 - Validation Foundation",
      description: "Shared AJV wrapper, schema helper normalization, and properties/schema resolution cleanup.",
    },
    {
      title: "Phase 2 - Pipeline V2",
      description: "Explicit stage-based Pipeline V2 runtime, adapters, tracing, and parity tests.",
    },
    {
      title: "Phase 3 - Model V2",
      description: "Explicit DataModel runtime, path operations, lifecycle semantics, and parity tests.",
    },
    {
      title: "Phase 4 - Observe V2",
      description: "Emitter-based observe layer, ObservableModel, and ObservablePipeline.",
    },
    {
      title: "Phase 5 - Compat V2",
      description: "Legacy adapters for Model, Pipeline, and TxValidator behavior.",
    },
    {
      title: "Phase 6 - Packaging and Docs",
      description: "Subpath exports, docs, examples, and integration continuity validation.",
    },
    {
      title: "Phase 7 - Release and Deprecation",
      description: "Release notes, deprecation messaging, and rollout hardening.",
    },
  ],
};

const issue = (overrides) => ({
  workflowStatus: "Backlog",
  size: "M",
  risk: "Medium",
  priority: "priority:p1",
  dependencies: [],
  relatedPlans: [],
  ...overrides,
});

export const issues = [
  issue({
    slug: "program-tracker",
    title: "Program tracker and decision log",
    phase: "0 Baseline",
    area: "Docs",
    type: "Discovery",
    milestone: "Phase 0 - Baseline and Inventory",
    priority: "priority:p0",
    summary:
      "Create the canonical in-repo program tracker and locked decision log for the Datamatic rearchitecture.",
    acceptance: [
      "The program workspace exists under docs/rearchitecture.",
      "Locked defaults and observed repo facts are recorded explicitly.",
      "Baseline build/test facts are captured and referenced by later work.",
    ],
  }),
  issue({
    slug: "legacy-api-matrix",
    title: "Legacy API preserve/move/drop matrix",
    phase: "0 Baseline",
    area: "Compat",
    type: "Decision",
    milestone: "Phase 0 - Baseline and Inventory",
    priority: "priority:p0",
    dependencies: ["program-tracker"],
    summary:
      "Classify every current public API and major runtime behavior into Core V2, Observe V2, Compat V2, Drop, or Doc drift.",
    acceptance: [
      "Current Model public surface is fully classified.",
      "Current Pipeline public surface is fully classified.",
      "Documented-but-missing runtime surfaces are called out explicitly.",
    ],
  }),
  issue({
    slug: "baseline-ci-gates",
    title: "Baseline CI and parity gate definition",
    phase: "0 Baseline",
    area: "Packaging",
    type: "Test",
    milestone: "Phase 0 - Baseline and Inventory",
    priority: "priority:p0",
    dependencies: ["program-tracker"],
    summary:
      "Pin the program gate to the current Jest suite, production build, and existing bundle outputs.",
    acceptance: [
      "Phase gate commands are documented and reproducible.",
      "Existing bundle outputs are listed as required compatibility gates.",
      "Later issues can reference one common definition of green baseline behavior.",
    ],
  }),
  issue({
    slug: "shared-ajv-wrapper",
    title: "Shared AJV wrapper consolidation",
    phase: "1 Validation Foundation",
    area: "Schema",
    type: "Implementation",
    milestone: "Phase 1 - Validation Foundation",
    dependencies: ["baseline-ci-gates"],
    relatedPlans: ["docs/refactor-plans/readme-ajv-wrappers.md"],
    summary:
      "Unify duplicate AJV wrapper setup paths used by Model and Pipeline without changing external validation behavior.",
    acceptance: [
      "Model and Pipeline no longer maintain duplicated wrapper logic.",
      "Schema ID handling and error shape remain regression-tested.",
      "Current strict-types warning path is preserved or explicitly documented if behavior changes.",
    ],
  }),
  issue({
    slug: "schema-helper-normalization",
    title: "Schema helper normalization",
    phase: "1 Validation Foundation",
    area: "Schema",
    type: "Implementation",
    milestone: "Phase 1 - Validation Foundation",
    dependencies: ["baseline-ci-gates"],
    relatedPlans: ["docs/refactor-plans/readme-schema-helpers.md"],
    summary:
      "Make schema helper defaults, fallbacks, and guard clauses explicit and easier to test.",
    acceptance: [
      "Implicit helper fallbacks are replaced with named explicit branches.",
      "Helper inputs and outputs are pinned by focused regression tests.",
      "Downstream callers stop depending on hidden side effects where practical.",
    ],
  }),
  issue({
    slug: "properties-schema-resolution",
    title: "Properties/schema resolution split",
    phase: "1 Validation Foundation",
    area: "Pipeline",
    type: "Implementation",
    milestone: "Phase 1 - Validation Foundation",
    dependencies: ["baseline-ci-gates"],
    relatedPlans: ["docs/refactor-plans/readme-properties-orchistration.md"],
    summary:
      "Separate schema selection and default pipe resolution from runtime pipeline wiring.",
    acceptance: [
      "Schema resolution is isolated from observer and callback wiring.",
      "Default input/output schema selection remains regression-tested.",
      "Init-time error behavior remains explicit and stable.",
    ],
  }),
  issue({
    slug: "pipeline-v2-core",
    title: "Pipeline V2 stage contract and async runtime",
    phase: "2 Pipeline V2",
    area: "Pipeline",
    type: "Implementation",
    milestone: "Phase 2 - Pipeline V2",
    priority: "priority:p0",
    dependencies: ["shared-ajv-wrapper", "schema-helper-normalization", "properties-schema-resolution"],
    relatedPlans: ["docs/refactor-plans/readme-pipeline-internals.md"],
    summary:
      "Build Pipeline V2 around explicit stage contracts and an async-first run model with no listener wiring in the core.",
    acceptance: [
      "Pipeline V2 accepts explicit stage arrays only.",
      "run(input, ctx) is async-first and deterministic.",
      "No Proxy, RxJS, or runtime code generation is introduced into V2 core.",
    ],
  }),
  issue({
    slug: "pipeline-v2-adapters",
    title: "Pipeline V2 adapters and trace hooks",
    phase: "2 Pipeline V2",
    area: "Pipeline",
    type: "Implementation",
    milestone: "Phase 2 - Pipeline V2",
    dependencies: ["pipeline-v2-core"],
    summary:
      "Add explicit adapters for transforms and validation plus trace support to replace yield/codegen behavior.",
    acceptance: [
      "Explicit adapters exist for transform and validator stages.",
      "Trace support exists as a first-class V2 API.",
      "yield() replacement behavior is testable without new Function.",
    ],
  }),
  issue({
    slug: "pipeline-v2-parity",
    title: "Pipeline V2 parity test suite",
    phase: "2 Pipeline V2",
    area: "Pipeline",
    type: "Test",
    milestone: "Phase 2 - Pipeline V2",
    dependencies: ["pipeline-v2-core", "pipeline-v2-adapters"],
    summary:
      "Pin execution ordering, validation composition, async stages, and trace semantics for Pipeline V2.",
    acceptance: [
      "Stage ordering is covered for sync and async execution.",
      "Validation plus transform composition is covered.",
      "Trace behavior is covered as the supported replacement for yield().",
    ],
  }),
  issue({
    slug: "data-model-lifecycle",
    title: "DataModel lifecycle and state engine",
    phase: "3 Model V2",
    area: "Model",
    type: "Implementation",
    milestone: "Phase 3 - Model V2",
    priority: "priority:p0",
    dependencies: ["shared-ajv-wrapper", "schema-helper-normalization"],
    relatedPlans: ["docs/refactor-plans/readme-model-base.md"],
    summary:
      "Build DataModel lifecycle, state, and mutability guards explicitly rather than through proxy side effects.",
    acceptance: [
      "Lifecycle transitions are explicit and testable.",
      "freeze and reset semantics are represented without proxy mutation channels.",
      "State invariants are readable without hidden listener coupling.",
    ],
  }),
  issue({
    slug: "data-model-path-ops",
    title: "DataModel path operations and validation policy",
    phase: "3 Model V2",
    area: "Model",
    type: "Implementation",
    milestone: "Phase 3 - Model V2",
    dependencies: ["data-model-lifecycle"],
    summary:
      "Add explicit path-based get/set/update/replace/validate/snapshot behavior for DataModel.",
    acceptance: [
      "The V2 model supports explicit get/set/update/replace operations.",
      "Validation entry points are explicit and testable.",
      "Snapshot behavior is stable and serializable.",
    ],
  }),
  issue({
    slug: "data-model-parity",
    title: "DataModel parity test suite",
    phase: "3 Model V2",
    area: "Model",
    type: "Test",
    milestone: "Phase 3 - Model V2",
    dependencies: ["data-model-lifecycle", "data-model-path-ops"],
    summary:
      "Pin lifecycle, nested update, invalid write, and freeze behavior for DataModel.",
    acceptance: [
      "Nested set and update paths are covered.",
      "Invalid write and validation failure behavior are covered.",
      "Freeze and reset semantics are covered.",
    ],
  }),
  issue({
    slug: "observe-event-model",
    title: "Observe V2 event model and emitter",
    phase: "4 Observe V2",
    area: "Observe",
    type: "Implementation",
    milestone: "Phase 4 - Observe V2",
    dependencies: ["pipeline-v2-core", "data-model-lifecycle"],
    summary:
      "Create the shared callback/emitter observation primitive and event taxonomy for V2 wrappers.",
    acceptance: [
      "Observe V2 has no RxJS dependency.",
      "Model and pipeline event taxonomies are explicit.",
      "Emitter behavior is isolated and unit-testable.",
    ],
  }),
  issue({
    slug: "observable-model",
    title: "ObservableModel with path-scoped subscriptions",
    phase: "4 Observe V2",
    area: "Observe",
    type: "Implementation",
    milestone: "Phase 4 - Observe V2",
    dependencies: ["observe-event-model", "data-model-path-ops"],
    summary:
      "Wrap DataModel with root and path-scoped observation while keeping subscriptions out of the core.",
    acceptance: [
      "ObservableModel supports root-level subscriptions.",
      "ObservableModel preserves path-scoped observation.",
      "Observation is triggered only by explicit operations.",
    ],
  }),
  issue({
    slug: "observable-pipeline",
    title: "ObservablePipeline and execution events",
    phase: "4 Observe V2",
    area: "Observe",
    type: "Implementation",
    milestone: "Phase 4 - Observe V2",
    dependencies: ["observe-event-model", "pipeline-v2-adapters"],
    summary:
      "Wrap Pipeline V2 execution with explicit run and stage event emission.",
    acceptance: [
      "ObservablePipeline emits run and stage lifecycle events.",
      "Execution remains plain in Pipeline V2 and observable only in the wrapper.",
      "Error and cancellation paths are explicit in the wrapper contract.",
    ],
  }),
  issue({
    slug: "legacy-pipeline-adapter",
    title: "LegacyPipeline compat adapter",
    phase: "5 Compat V2",
    area: "Compat",
    type: "Implementation",
    milestone: "Phase 5 - Compat V2",
    dependencies: ["observable-pipeline", "pipeline-v2-parity"],
    summary:
      "Map legacy pipeline usage onto Pipeline V2 plus observe without reintroducing core coupling.",
    acceptance: [
      "Legacy exec, write, promise, and pipe flows are preserved through compat.",
      "Push-style behavior remains outside the V2 core.",
      "Compat-only warnings are available for deprecated legacy paths.",
    ],
  }),
  issue({
    slug: "legacy-model-adapter",
    title: "LegacyModel compat adapter",
    phase: "5 Compat V2",
    area: "Compat",
    type: "Implementation",
    milestone: "Phase 5 - Compat V2",
    dependencies: ["observable-model", "data-model-parity"],
    summary:
      "Map legacy model usage onto DataModel plus observe, preserving the migration-critical surface first.",
    acceptance: [
      "Legacy subscribe and subscribeTo remain available via compat.",
      "Legacy fromJSON, freeze, and root model flows are preserved through compat.",
      "Proxy behavior is not reintroduced into V2 core.",
    ],
  }),
  issue({
    slug: "txvalidator-compat-bridge",
    title: "TxValidator compat bridge",
    phase: "5 Compat V2",
    area: "Compat",
    type: "Implementation",
    milestone: "Phase 5 - Compat V2",
    dependencies: ["shared-ajv-wrapper", "pipeline-v2-adapters"],
    summary:
      "Provide a migration path from TxValidator to SchemaRegistry/DataValidator without breaking current callers early.",
    acceptance: [
      "TxValidator remains usable through compat.",
      "Validation result mapping is explicit.",
      "Migration docs can point from TxValidator to V2 validation primitives.",
    ],
  }),
  issue({
    slug: "packaging-subpath-exports",
    title: "Packaging and subpath export strategy",
    phase: "6 Packaging and Docs",
    area: "Packaging",
    type: "Implementation",
    milestone: "Phase 6 - Packaging and Docs",
    dependencies: ["legacy-pipeline-adapter", "legacy-model-adapter", "txvalidator-compat-bridge"],
    summary:
      "Expose stable V2 entry points while keeping legacy bundles and top-level exports intact during the transition.",
    acceptance: [
      "V2 entry points are exposed without removing legacy top-level exports.",
      "Node, UMD, and window bundles remain available until explicit replacements exist.",
      "Packaging behavior is covered by smoke validation.",
    ],
  }),
  issue({
    slug: "docs-and-migration-guide",
    title: "Examples, docs, and migration guide",
    phase: "6 Packaging and Docs",
    area: "Docs",
    type: "Docs",
    milestone: "Phase 6 - Packaging and Docs",
    dependencies: ["packaging-subpath-exports", "observable-model", "observable-pipeline"],
    summary:
      "Rewrite examples and docs around V2 core, observe, and compat migration paths.",
    acceptance: [
      "Docs explain Core V2, Observe V2, and Compat V2 clearly.",
      "Migration guidance maps old APIs to new APIs explicitly.",
      "Examples demonstrate V2 and migration-safe legacy paths.",
    ],
  }),
  issue({
    slug: "integration-continuity",
    title: "Integration demo continuity validation",
    phase: "6 Packaging and Docs",
    area: "Packaging",
    type: "Test",
    milestone: "Phase 6 - Packaging and Docs",
    dependencies: ["packaging-subpath-exports", "docs-and-migration-guide"],
    summary:
      "Validate current CommonJS, window, and bundled integration demos against the packaging strategy.",
    acceptance: [
      "Existing integration demos still function or have explicit replacement guidance.",
      "Bundle-level smoke validation exists for CommonJS and window consumers.",
      "No distribution target is dropped silently.",
    ],
  }),
  issue({
    slug: "release-hardening",
    title: "Release notes and deprecation messaging",
    phase: "7 Release",
    area: "Docs",
    type: "Release",
    milestone: "Phase 7 - Release and Deprecation",
    dependencies: ["integration-continuity", "docs-and-migration-guide"],
    summary:
      "Prepare the first V2 release cycle with compat-only deprecations and explicit migration messaging.",
    acceptance: [
      "Release notes cover V2, compat, and migration expectations.",
      "Deprecation messaging appears only in compat surfaces.",
      "Removal timing is deferred beyond the first V2 release cycle.",
    ],
  }),
];

export const renderIssueBody = (issueSpec) => {
  const lines = [];
  lines.push(`## Summary`);
  lines.push("");
  lines.push(issueSpec.summary);
  lines.push("");
  lines.push("## Classification");
  lines.push("");
  lines.push(`- Phase: \`${issueSpec.phase}\``);
  lines.push(`- Area: \`${issueSpec.area}\``);
  lines.push(`- Type: \`${issueSpec.type}\``);
  lines.push(`- Size: \`${issueSpec.size}\``);
  lines.push(`- Risk: \`${issueSpec.risk}\``);
  lines.push("");
  if (issueSpec.dependencies.length) {
    lines.push("## Dependencies");
    lines.push("");
    issueSpec.dependencies.forEach((dep) => {
      lines.push(`- \`${dep}\``);
    });
    lines.push("");
  }
  if (issueSpec.relatedPlans.length) {
    lines.push("## Related Notes");
    lines.push("");
    issueSpec.relatedPlans.forEach((plan) => {
      lines.push(`- \`${plan}\``);
    });
    lines.push("");
  }
  lines.push("## Acceptance Criteria");
  lines.push("");
  issueSpec.acceptance.forEach((criterion) => {
    lines.push(`- ${criterion}`);
  });
  lines.push("");
  lines.push("## Global Gate Reminder");
  lines.push("");
  lines.push("- Full Jest suite remains green.");
  lines.push("- Production build remains green.");
  lines.push("- Existing bundle outputs remain green unless this issue explicitly owns a replacement.");
  return lines.join("\n");
};

export const labelsForIssue = (issueSpec) => [
  `area:${issueSpec.area.toLowerCase()}`,
  `type:${issueSpec.type.toLowerCase()}`,
  issueSpec.priority,
];

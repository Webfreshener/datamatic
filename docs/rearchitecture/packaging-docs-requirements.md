# Packaging And Docs Requirements

This document translates the current package, bundle, docs, and integration continuity constraints into explicit requirements for:

- `packaging-subpath-exports`
- `docs-and-migration-guide`
- `integration-continuity`

It is based on:

- [package.json](/Users/vanschroeder/Workspace/datamatic/package.json)
- [webpack.config.js](/Users/vanschroeder/Workspace/datamatic/webpack.config.js)
- [README.md](/Users/vanschroeder/Workspace/datamatic/README.md)
- [integration/README.md](/Users/vanschroeder/Workspace/datamatic/integration/README.md)
- [src/dist.test.js](/Users/vanschroeder/Workspace/datamatic/src/dist.test.js)
- [src/static-modules.test.js](/Users/vanschroeder/Workspace/datamatic/src/static-modules.test.js)

## Current Distribution Contract

The current repo publishes and relies on three distribution targets:

- `dist/datamatic.node.js`
- `dist/datamatic.umd.js`
- `dist/datamatic.window.js`

Current package metadata also exposes:

- `main: ./dist/datamatic.node.js`
- `module: ./dist/datamatic.umd.js`
- `files: ["index.js", "dist/*"]`

Top-level package usage in current docs/examples assumes:

- CommonJS import of `Model`, `Pipeline`, and package-root behavior that continues to expose `TxValidator`
- browser global usage via `window.datamatic`
- local repo linking via `file:../../` in integration examples
- repo-root demo commands through:
  - `npm run demo:window-html`
  - `npm run demo:umd-react`
  - `npm run demo:umd-angular`
  - `npm run demo:commonjs`

## Packaging Requirements

Phase 6 packaging work must preserve these constraints until an explicit replacement is shipped:

1. Existing top-level exports remain available.
2. Existing bundle outputs remain available.
3. CommonJS consumers remain functional.
4. Browser/window consumers remain functional.
5. Any V2 subpath exports are additive first, not replacement-first.
6. Repo-root demo commands remain valid until explicit replacements are documented and shipped.

If new subpath exports are introduced, they should be explicit and non-breaking, for example:

- `datamatic/core`
- `datamatic/observe`
- `datamatic/compat`

But they must not silently remove or narrow:

- `require("datamatic")`
- browser global usage through `window.datamatic`
- current root-distribution assumptions in `package.json`

## Docs And Migration Requirements

Current docs have two important characteristics:

1. They still describe the legacy/public surface as the primary user-facing contract.
2. They contain documented drift that should not be copied forward blindly.

Phase 6 docs work must therefore:

1. Explain `Core V2`, `Observe V2`, and `Compat V2` explicitly.
2. Map current legacy APIs to intended V2 APIs explicitly.
3. Preserve working usage examples for current stable surfaces until the V2 release transition is actually in place.
4. Correct known doc drift instead of codifying it as contract.
5. Keep migration guidance concrete enough that an existing consumer can identify their path with minimal guesswork.

## Integration Continuity Requirements

Current integration surfaces in-repo include:

- CommonJS node example
- browser `window` example
- React UMD/browser build example
- Angular local-package example

Important current facts:

- `integration/commonjs-node` depends on `"datamatic": "file:../../"`
- `integration/umd-react` depends on `"datamatic": "file:../../"` and also ships a copied `public/datamatic.window.js`
- `integration/window-html` loads `../../dist/datamatic.window.js` directly
- `integration/umd-angular` depends on `"datamatic": "file:../../"` and consumes the package entry from a framework build
- docs instruct users to rebuild root bundles and re-copy `dist/datamatic.window.js` for some flows

This means Phase 6 cannot treat integration continuity as abstract smoke testing. It must explicitly account for:

1. local package linking behavior
2. direct `dist/` consumption behavior
3. copied browser bundle behavior
4. package entry compatibility for `require("datamatic")`
5. framework-consumer behavior that installs the local repo package without a publish step

## Replace-Not-Preserve Behavior

These should not be preserved uncritically:

- README drift such as legacy-doc-only APIs
- unclear or outdated wording about runtime internals when it conflicts with current source/tests

These should be preserved until replacement exists:

- bundle presence
- legacy package entry points
- documented demo commands that currently work from repo root

## Parity Coverage Requirements

Before Phase 6 can be considered complete, coverage or smoke validation should explicitly pin:

1. `require("datamatic")` still yielding the expected legacy top-level exports.
2. `dist/datamatic.window.js` remaining usable in browser/window flows.
3. Current Node bundle availability.
4. Current UMD/browser bundle availability.
5. Local-link integration examples still functioning or having explicit replacement guidance.
6. Docs and migration guidance not claiming unsupported APIs as real contract.
7. Repo-root demo scripts and integration README instructions staying aligned with the actual supported distribution path.

## Recommended Phase 6 Split

### `packaging-subpath-exports`

Own:

- additive V2 export strategy
- package entry compatibility
- bundle continuity rules
- explicit decision record for when legacy distribution targets can be retired

### `docs-and-migration-guide`

Own:

- V2 docs structure
- legacy-to-V2 migration mapping
- doc drift cleanup
- example updates that reflect the actual supported transition path

### `integration-continuity`

Own:

- smoke validation of current integration surfaces
- explicit continuity or replacement statements for CommonJS, window, React UMD, and Angular flows

## Immediate Backlog Impact

This document tightens the acceptance criteria for:

- `packaging-subpath-exports`
- `docs-and-migration-guide`
- `integration-continuity`

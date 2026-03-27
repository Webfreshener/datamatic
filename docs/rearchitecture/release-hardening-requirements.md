# Release Hardening Requirements

This document translates the current program decisions, compat boundaries, and packaging constraints into explicit requirements for:

- `release-notes-and-deprecation-messaging`

It is based on:

- [decision-log.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/decision-log.md)
- [preserve-move-drop-matrix.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/preserve-move-drop-matrix.md)
- [compat-v2-requirements.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/compat-v2-requirements.md)
- [packaging-docs-requirements.md](/Users/vanschroeder/Workspace/datamatic/docs/rearchitecture/packaging-docs-requirements.md)

## First-Release Boundary

The first V2 release cycle is not a legacy-removal release.

Its purpose is to:

1. introduce the V2 surfaces cleanly
2. preserve the agreed legacy paths through compat
3. make migration paths explicit
4. defer removals until after at least one full release cycle with compat available

That means the first V2 release line must not silently collapse the package into:

- V2-only docs
- V2-only imports
- V2-only runtime paths

## Deprecation Rules

Deprecation policy for the first V2 release cycle must follow these constraints:

1. Deprecation messaging appears only in compat-owned surfaces.
2. `Core V2` and `Observe V2` should not emit legacy deprecation messaging for APIs they do not own.
3. Deprecation messaging must identify the legacy surface being deprecated and the intended migration path.
4. Deprecation messaging must not claim a removal date or release boundary that the program has not explicitly decided.
5. README drift and never-implemented APIs should be documented as drift or unsupported behavior, not announced as deprecations.

## Release Notes Requirements

Phase 7 release notes must explicitly cover:

1. what V2 surfaces are newly available
2. what legacy top-level exports remain available
3. what compat surfaces exist and why
4. which migration paths are recommended now
5. which removals are explicitly deferred
6. any known limitations or gaps that remain outside the first V2 release boundary

Release notes must be concrete enough for existing consumers to answer:

- can I stay on the legacy entry point for now?
- do I need compat to migrate?
- what is the preferred V2 path for my use case?
- what has not been removed yet?

## Migration Boundary Requirements

Before Phase 7 can be considered complete, the program should make these first-release boundaries explicit:

1. `Model`, `Pipeline`, and `TxValidator` remain package-visible through the first V2 cycle.
2. current dist targets remain available until a later explicit retirement decision.
3. compat is the only allowed home for deprecation warnings on legacy runtime paths.
4. removals are not implied by new docs, new exports, or new examples.
5. unsupported README-only drift is called out as such instead of being treated as a supported legacy promise.

## Non-Goals

Phase 7 should not:

- invent a removal schedule that has not been agreed
- imply that compat is temporary enough to skip documentation
- bury migration-critical caveats inside implementation issues only
- let release messaging outrun actual package, compat, or integration support

## Completion Signals

Before `release-notes-and-deprecation-messaging` can be considered complete, it should produce:

1. release notes language that names the new V2 surfaces and the preserved legacy surfaces
2. deprecation wording that is scoped to compat only
3. an explicit statement that removals are deferred beyond the first V2 release cycle
4. migration guidance that agrees with the package/export/docs/integration reality locked in earlier phases

## Immediate Backlog Impact

This document tightens the acceptance criteria for:

- `release-notes-and-deprecation-messaging`

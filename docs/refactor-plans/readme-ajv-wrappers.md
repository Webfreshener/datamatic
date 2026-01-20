# AJV Wrappers Refactor Plan

## Target
Unify and simplify AJV wrapper logic in `src/Model/_ajvWrapper.js` and `src/Pipeline/_ajvWrapper.js`.

## Goals
- Eliminate duplicate validation setup paths.
- Normalize error formatting and return behavior.
- Make validator creation deterministic and easier to test.

## Non-Goals
- No change to schema semantics or supported draft versions.
- No change to public validation APIs.

## Task list
- Add tests that pin current wrapper behaviors and error shapes.
- Create a shared helper (e.g., `src/shared/ajv-wrapper.js`) for AJV creation, schema compilation, and error normalization.
- Update Model and Pipeline wrappers to delegate to the shared helper.
- Remove duplicated options logic and align defaults in one place.
- Keep compatibility shims for any legacy options in use.

## Risks
- Differences in AJV option defaults across current wrappers.
- Changes in error object identity or formatting.

## Validation
- Run existing Model/Pipeline tests plus new wrapper-level tests.
- Add regression tests for legacy schema id handling and error formatting.

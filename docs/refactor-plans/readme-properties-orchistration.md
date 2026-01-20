# Properties Orchestration Refactor Plan

## Target
Separate schema resolution from runtime wiring in `src/Pipeline/Properties.js`.

## Goals
- Make init flow deterministic and easier to read.
- Decouple schema selection from observer/subscription wiring.
- Make error handling explicit and testable.

## Non-Goals
- No behavior changes to external Properties API.
- No changes to schema format or validation rules.

## Task list
- Add tests to lock in current init behavior and error paths.
- Extract schema resolution into a pure function (input schema, output resolved schema).
- Extract runtime wiring into a separate module (subscriptions, observers, callbacks).
- Simplify `init` to orchestrate the two phases with clear error handling.
- Add module-level tests for schema resolution and wiring logic.

## Risks
- Subtle differences in how default pipe schema is chosen.
- Changes in init order affecting side effects.

## Validation
- Run full Pipeline test suite with new Properties module tests.
- Add regression tests for default schema selection and observer wiring.

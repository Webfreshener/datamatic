# Schema Helpers Refactor Plan

## Target
Simplify schema helper logic in `src/Model/_schemaHelpers.js` and `src/Pipeline/Utils.js`.

## Goals
- Make defaults and fallbacks explicit and consistent.
- Reduce magic behavior (implicit type handling, silent fallbacks).
- Improve unit test coverage for helper inputs.

## Non-Goals
- No change to schema formats or supported drafts.
- No changes to high-level model or pipeline APIs.

## Task list
- Add unit tests that document current helper inputs/outputs.
- Extract explicit defaults into named constants (e.g., default type, default array fill).
- Replace implicit fallbacks with explicit conditional branches.
- Add guard clauses for invalid input shapes and document behavior.
- Update callers to rely on explicit return values, not side effects.

## Risks
- Downstream code relying on implicit helper behavior.
- Hidden coupling with schema defaults elsewhere.

## Validation
- Run full test suite with targeted helper tests.
- Add regression tests for schema edge cases (empty, missing id, default arrays).

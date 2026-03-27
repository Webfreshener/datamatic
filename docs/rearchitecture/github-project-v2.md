# GitHub Projects V2 Board Definition

## Current Remote Status

The remote GitHub project exists at `https://github.com/orgs/Webfreshener/projects/1`.

Completed from this environment:

- project fields
- labels
- milestones
- seeded issues
- seeded project item custom field values
- saved project views via REST API

Still manual:

- no required manual board setup remains for the initial board shape

Known limitation:

- GitHub's REST documentation and verified endpoints exposed view creation, but not a working list/delete route for project views in this environment. A duplicate `Execution Board` view was created during API verification and could not be removed programmatically with the documented paths tested.
- GitHub's REST view-creation endpoint accepted `layout`, `filter`, and `visible_fields`, but rejected `group_by_field_id` and returned empty `group_by` metadata on the created view. The canonical execution-board URL therefore points at the API-created workflow view, while the desired board grouping remains a documented target rather than an API-controlled property in this environment.

## Project

- Name: `Datamatic Rearchitecture`
- Platform: GitHub Projects V2
- Repo linkage target: `Webfreshener/datamatic`

## Project Fields

### `Workflow Status`

Single select:

- `Backlog`
- `Ready`
- `In Progress`
- `In Review`
- `Blocked`
- `Done`

The live project also keeps GitHub's built-in `Status` field (`Todo`, `In Progress`, `Done`).
The program's canonical workflow taxonomy is the custom `Workflow Status` field.

### `Phase`

Single select:

- `0 Baseline`
- `1 Validation Foundation`
- `2 Pipeline V2`
- `3 Model V2`
- `4 Observe V2`
- `5 Compat V2`
- `6 Packaging and Docs`
- `7 Release`

### `Work Type`

Single select:

- `Discovery`
- `Decision`
- `Implementation`
- `Test`
- `Docs`
- `Release`

### `Area`

Single select:

- `Schema`
- `Model`
- `Pipeline`
- `Observe`
- `Compat`
- `Packaging`
- `Docs`

### `Size`

Single select:

- `S`
- `M`
- `L`

### `Risk`

Single select:

- `Low`
- `Medium`
- `High`

## Labels

Required labels are defined in the seed config and bootstrap script:

- `area:schema`
- `area:model`
- `area:pipeline`
- `area:observe`
- `area:compat`
- `area:packaging`
- `area:docs`
- `type:discovery`
- `type:decision`
- `type:implementation`
- `type:test`
- `type:release`
- `priority:p0`
- `priority:p1`
- `priority:p2`

## Milestones

- `Phase 0 - Baseline and Inventory`
- `Phase 1 - Validation Foundation`
- `Phase 2 - Pipeline V2`
- `Phase 3 - Model V2`
- `Phase 4 - Observe V2`
- `Phase 5 - Compat V2`
- `Phase 6 - Packaging and Docs`
- `Phase 7 - Release and Deprecation`

## Required Views

These are the target saved views for the project.

### `Execution Board`

- Layout: board
- Group by: `Workflow Status`
- Filter: open items
- Live view URLs:
  - canonical workflow view: `https://github.com/orgs/Webfreshener/projects/1/views/8`
  - original board created before workflow taxonomy fix: `https://github.com/orgs/Webfreshener/projects/1/views/2`
  - duplicate created during API verification: `https://github.com/orgs/Webfreshener/projects/1/views/3`

### `Roadmap`

- Layout: roadmap or table
- Group by: `Phase`
- Live view URL: `https://github.com/orgs/Webfreshener/projects/1/views/7`

### `Discovery`

- Filter: `Work Type` is `Discovery` or `Decision`
- Live view URL: `https://github.com/orgs/Webfreshener/projects/1/views/6`

### `Implementation`

- Filter: `Work Type` is `Implementation` or `Test`
- Live view URL: `https://github.com/orgs/Webfreshener/projects/1/views/5`

### `Docs and Release`

- Filter: `Area` is `Docs` or `Work Type` is `Release`
- Live view URL: `https://github.com/orgs/Webfreshener/projects/1/views/4`

## Bootstrap Procedure

### 1. Authenticate GitHub CLI

```bash
gh auth login
gh auth refresh -s project
```

### 2. Create the GitHub project

```bash
gh project create --owner Webfreshener --title "Datamatic Rearchitecture"
```

### 3. Find the project number

```bash
gh project list --owner Webfreshener
```

### 4. Dry-run the repo seed

```bash
node scripts/bootstrap-github-rearchitecture.mjs --owner Webfreshener --project-number <NUMBER>
```

### 5. Apply the repo seed

```bash
node scripts/bootstrap-github-rearchitecture.mjs --apply --owner Webfreshener --project-number <NUMBER>
```

## Automation Scope

The bootstrap script is intentionally conservative.

Automated:

- labels
- milestones
- issues
- project field creation
- project view creation

Manual by design:

- project creation

Project item custom field assignment is automated by the bootstrap script. Project view creation has been validated through the REST API, but is not yet folded into the repo bootstrap because the currently verified API surface is not safely idempotent for reruns.

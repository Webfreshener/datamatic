#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { projectConfig, issues, renderIssueBody, labelsForIssue } from "./rearchitecture.config.mjs";

const args = parseArgs(process.argv.slice(2));
const apply = args.apply === true;
const repo = args.repo || deriveRepoFromOrigin() || projectConfig.repoDefault;
const [repoOwner] = repo.split("/");
const owner = args.owner || repoOwner;
const projectNumber = args["project-number"] || null;

if (!repo || !owner) {
  fail("Unable to determine repository owner/repo. Pass --repo OWNER/REPO and --owner OWNER.");
}

if (apply) {
  ensureGhAuthenticated();
}

logHeader(`Datamatic GitHub bootstrap (${apply ? "apply" : "dry-run"})`);
log(`Repository: ${repo}`);
log(`Project owner: ${owner}`);
log(`Project title: ${projectConfig.name}`);
log(`Project number: ${projectNumber || "(not provided)"}`);
log("");

ensureLabels(repo, apply);
ensureMilestones(repo, apply);

if (projectNumber) {
  ensureProjectFields(owner, projectNumber, apply);
}

ensureIssues(repo, projectNumber ? projectConfig.name : null, apply);

if (projectNumber) {
  ensureProjectItemFields(owner, projectNumber, apply);
}

if (!projectNumber) {
  log("");
  log("Project fields were skipped because --project-number was not provided.");
  log(`Create the project first: gh project create --owner ${owner} --title "${projectConfig.name}"`);
}

log("");
log("Manual follow-up remains required for:");
projectConfig.views.forEach((view) => {
  log(`- project view: ${view.name}`);
});

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      continue;
    }
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
      continue;
    }
    parsed[key] = next;
    i += 1;
  }
  return parsed;
}

function deriveRepoFromOrigin() {
  try {
    const origin = exec("git", ["config", "--get", "remote.origin.url"]).trim();
    const sshMatch = origin.match(/^git@github\.com:([^/]+)\/(.+?)(?:\.git)?$/);
    if (sshMatch) {
      return `${sshMatch[1]}/${sshMatch[2]}`;
    }
    const httpsMatch = origin.match(/^https:\/\/github\.com\/([^/]+)\/(.+?)(?:\.git)?$/);
    if (httpsMatch) {
      return `${httpsMatch[1]}/${httpsMatch[2]}`;
    }
    return null;
  } catch {
    return null;
  }
}

function ensureGhAuthenticated() {
  try {
    exec("gh", ["auth", "status"]);
  } catch {
    fail("gh is not authenticated. Run `gh auth login` and `gh auth refresh -s project`, or rerun in dry-run mode.");
  }
}

function ensureLabels(targetRepo, shouldApply) {
  logHeader("Labels");
  const existing = shouldApply ? listRepoLabels(targetRepo) : new Set();
  projectConfig.labels.forEach((label) => {
    if (existing.has(label.name)) {
      log(`skip label ${label.name}`);
      return;
    }
    run(
      "gh",
      ["label", "create", label.name, "-R", targetRepo, "--color", label.color, "--description", label.description],
      shouldApply,
    );
  });
}

function ensureMilestones(targetRepo, shouldApply) {
  logHeader("Milestones");
  const existing = shouldApply ? listRepoMilestones(targetRepo) : new Set();
  projectConfig.milestones.forEach((milestone) => {
    if (existing.has(milestone.title)) {
      log(`skip milestone ${milestone.title}`);
      return;
    }
    run(
      "gh",
      ["api", `repos/${targetRepo}/milestones`, "-f", `title=${milestone.title}`, "-f", `description=${milestone.description}`],
      shouldApply,
    );
  });
}

function ensureProjectFields(projectOwner, number, shouldApply) {
  logHeader("Project Fields");
  const existing = shouldApply ? listProjectFields(projectOwner, number) : new Set();
  projectConfig.fields.forEach((field) => {
    if (existing.has(field.name)) {
      log(`skip project field ${field.name}`);
      return;
    }
    if (isReservedProjectField(field.name)) {
      log(`skip reserved project field ${field.name}`);
      return;
    }
    const argsForField = [
      "project",
      "field-create",
      `${number}`,
      "--owner",
      projectOwner,
      "--name",
      field.name,
      "--data-type",
      field.dataType,
    ];
    if (field.dataType === "SINGLE_SELECT") {
      argsForField.push("--single-select-options", field.options.join(","));
    }
    try {
      run("gh", argsForField, shouldApply);
    } catch (error) {
      if (isProjectFieldConflict(error)) {
        log(`skip taken project field ${field.name}`);
        return;
      }
      throw error;
    }
  });
}

function isReservedProjectField(fieldName) {
  return new Set([
    "Title",
    "Assignees",
    "Status",
    "Labels",
    "Linked pull requests",
    "Milestone",
    "Repository",
    "Reviewers",
    "Parent issue",
    "Sub-issues progress",
  ]).has(fieldName);
}

function isProjectFieldConflict(error) {
  const stderr = `${error?.stderr || ""}`;
  return (
    stderr.includes("Name cannot have a reserved value") ||
    stderr.includes("Name has already been taken")
  );
}

function ensureIssues(targetRepo, projectTitle, shouldApply) {
  logHeader("Issues");
  const existing = shouldApply ? listRepoIssueTitles(targetRepo) : new Set();
  issues.forEach((issueSpec) => {
    if (existing.has(issueSpec.title)) {
      log(`skip issue ${issueSpec.title}`);
      return;
    }
    const body = renderIssueBody(issueSpec);
    const command = [
      "issue",
      "create",
      "-R",
      targetRepo,
      "--title",
      issueSpec.title,
      "--body",
      body,
      "--milestone",
      issueSpec.milestone,
    ];
    labelsForIssue(issueSpec).forEach((label) => {
      command.push("--label", label);
    });
    if (projectTitle) {
      command.push("--project", projectTitle);
    }
    run("gh", command, shouldApply);
  });
}

function ensureProjectItemFields(projectOwner, number, shouldApply) {
  logHeader("Project Item Fields");
  if (!shouldApply) {
    issues.forEach((issueSpec) => {
      renderProjectFieldAssignments(issueSpec).forEach(({ fieldName, optionName }) => {
        log(`dry-run set ${issueSpec.title}: ${fieldName}=${optionName}`);
      });
    });
    return;
  }

  const project = getProject(projectOwner, number);
  const fieldMap = listProjectFieldMap(projectOwner, number);
  const itemMap = listProjectItemMap(projectOwner, number);

  issues.forEach((issueSpec) => {
    const itemId = itemMap.get(issueSpec.title);
    if (!itemId) {
      log(`skip project item fields for ${issueSpec.title} (project item not found)`);
      return;
    }

    renderProjectFieldAssignments(issueSpec).forEach(({ fieldName, optionName }) => {
      const field = fieldMap.get(fieldName);
      if (!field) {
        log(`skip missing project field ${fieldName}`);
        return;
      }
      const option = (field.options || []).find((entry) => entry.name === optionName);
      if (!option) {
        log(`skip missing project option ${fieldName}=${optionName}`);
        return;
      }
      run("gh", [
        "project",
        "item-edit",
        "--id",
        itemId,
        "--project-id",
        project.id,
        "--field-id",
        field.id,
        "--single-select-option-id",
        option.id,
      ], shouldApply);
    });
  });
}

function listRepoLabels(targetRepo) {
  const pages = runJson("gh", ["api", `repos/${targetRepo}/labels?per_page=100`, "--paginate", "--slurp"]);
  return new Set(flattenPages(pages).map((entry) => entry.name));
}

function listRepoMilestones(targetRepo) {
  const pages = runJson(
    "gh",
    ["api", `repos/${targetRepo}/milestones?state=all&per_page=100`, "--paginate", "--slurp"],
  );
  return new Set(flattenPages(pages).map((entry) => entry.title));
}

function listRepoIssueTitles(targetRepo) {
  const repoIssues = runJson("gh", [
    "issue",
    "list",
    "-R",
    targetRepo,
    "--state",
    "all",
    "--limit",
    "500",
    "--json",
    "title",
  ]);
  return new Set((Array.isArray(repoIssues) ? repoIssues : []).map((entry) => entry.title));
}

function listProjectFields(projectOwner, number) {
  const fields = runJson("gh", ["project", "field-list", `${number}`, "--owner", projectOwner, "--format", "json"]);
  return new Set((Array.isArray(fields) ? fields : []).map((entry) => entry.name));
}

function listProjectFieldMap(projectOwner, number) {
  const payload = runJson("gh", ["project", "field-list", `${number}`, "--owner", projectOwner, "--format", "json"]);
  const fields = Array.isArray(payload?.fields) ? payload.fields : Array.isArray(payload) ? payload : [];
  return new Map(fields.map((field) => [field.name, field]));
}

function listProjectItemMap(projectOwner, number) {
  const payload = runJson("gh", ["project", "item-list", `${number}`, "--owner", projectOwner, "--format", "json"]);
  const items = Array.isArray(payload?.items) ? payload.items : [];
  return new Map(items.map((item) => [item.title, item.id]));
}

function getProject(projectOwner, number) {
  const payload = runJson("gh", ["project", "list", "--owner", projectOwner, "--format", "json"]);
  const projects = Array.isArray(payload?.projects) ? payload.projects : [];
  const project = projects.find((entry) => Number(entry.number) === Number(number));
  if (!project) {
    fail(`Unable to find project ${number} for owner ${projectOwner}.`);
  }
  return project;
}

function renderProjectFieldAssignments(issueSpec) {
  return [
    { fieldName: "Workflow Status", optionName: issueSpec.workflowStatus },
    { fieldName: "Phase", optionName: issueSpec.phase },
    { fieldName: "Work Type", optionName: issueSpec.type },
    { fieldName: "Area", optionName: issueSpec.area },
    { fieldName: "Size", optionName: issueSpec.size },
    { fieldName: "Risk", optionName: issueSpec.risk },
  ];
}

function flattenPages(pages) {
  if (!Array.isArray(pages)) {
    return [];
  }
  return pages.flatMap((page) => (Array.isArray(page) ? page : []));
}

function run(command, commandArgs, shouldApply) {
  const rendered = [command, ...commandArgs].join(" ");
  if (!shouldApply) {
    log(`dry-run ${rendered}`);
    return "";
  }
  log(`run ${rendered}`);
  return exec(command, commandArgs);
}

function runJson(command, commandArgs) {
  return JSON.parse(exec(command, commandArgs));
}

function exec(command, commandArgs) {
  return execFileSync(command, commandArgs, {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function logHeader(title) {
  log(title);
}

function log(message) {
  process.stdout.write(`${message}\n`);
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

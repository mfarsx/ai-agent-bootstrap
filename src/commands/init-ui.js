const chalk = require("chalk");
const { getProvider, getReadyProviderNames } = require("../providers");

const QUICK_DOC_GROUPS = [
  { label: "Memory", commands: ["/init-memory", "/update-memory"] },
  { label: "Workflow", commands: ["/plan", "/review", "/commit"] },
  {
    label: "Utility",
    commands: ["/status", "/checkpoint", "/cleanup", "/stuck"],
  },
];

const WORKFLOW_COMMAND_ORDER = QUICK_DOC_GROUPS.flatMap(
  (group) => group.commands,
);

function orderByQuickDocGroups(left, right) {
  const leftIndex = WORKFLOW_COMMAND_ORDER.indexOf(left);
  const rightIndex = WORKFLOW_COMMAND_ORDER.indexOf(right);
  const leftRank = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
  const rightRank = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;
  if (leftRank !== rightRank) return leftRank - rightRank;
  return left.localeCompare(right);
}

function isFreshMemoryBank(provider, fileResults) {
  const contextPrefix = provider.contextPath + "/";
  const contextResults = fileResults.filter((r) =>
    r.target.startsWith(contextPrefix),
  );
  if (contextResults.length === 0) return true;
  return contextResults.every((r) => r.status === "created");
}

function buildMemoryStep(provider, fileResults) {
  const workflows = provider.workflows || {};
  const fresh = isFreshMemoryBank(provider, fileResults);

  if (fresh && workflows.initMemory) {
    return `Run ${chalk.bold.cyan(workflows.initMemory.command)} ${workflows.initMemory.hint} now to populate ${provider.contextPath} before your next task`;
  }

  if (!fresh && workflows.updateMemory) {
    return `Run ${chalk.bold.cyan(workflows.updateMemory.command)} ${workflows.updateMemory.hint} now to sync ${provider.contextPath} with the latest project state`;
  }

  if (fresh) {
    return `Fill in ${provider.contextPath}/ with project details before your next coding task`;
  }

  return `Review and update ${provider.contextPath}/ files to reflect the current project state`;
}

function collectWorkflowCommands(provider) {
  const slugs = provider.workflowSlugs || [];
  return slugs.map((slug) => `/${slug}`).sort(orderByQuickDocGroups);
}

function getQuickDocHint(provider) {
  const memoryWorkflow =
    provider.workflows &&
    (provider.workflows.updateMemory || provider.workflows.initMemory);
  return (memoryWorkflow && memoryWorkflow.hint) || "in your provider chat";
}

function buildQuickDocGroups(provider) {
  const available = new Set(collectWorkflowCommands(provider));
  if (available.size === 0) {
    return [];
  }

  return QUICK_DOC_GROUPS.map((group) => ({
    label: group.label,
    commands: group.commands.filter((command) => available.has(command)),
  })).filter((group) => group.commands.length > 0);
}

function printQuickDoc(provider) {
  const groups = buildQuickDocGroups(provider);
  if (groups.length === 0) {
    return;
  }

  const hint = getQuickDocHint(provider);
  console.log(chalk.bold.cyan("Quick Doc") + chalk.gray(` (${hint}):`));

  const labelWidth = Math.max(...groups.map((group) => group.label.length)) + 2;
  const commandCellWidth =
    Math.max(
      0,
      ...groups.flatMap((group) =>
        group.commands.map((command) => command.length),
      ),
    ) + 2;

  for (const group of groups) {
    const paddedLabel = chalk.gray(group.label.padEnd(labelWidth, " "));
    const paddedCommands = group.commands
      .map((command) => chalk.bold.cyan(command.padEnd(commandCellWidth, " ")))
      .join("");
    console.log(`  ${paddedLabel}${paddedCommands.trimEnd()}`);
  }
}

function printNextSteps(provider, scaffoldResult) {
  const steps = [buildMemoryStep(provider, scaffoldResult.fileResults)];

  if (provider.rulesPath) {
    steps.push(`Review ${provider.rulesPath} and adjust to your workflow`);
  }

  steps.push("Start your AI agent — it will read these files automatically");

  console.log(chalk.bold.cyan("Next steps:"));
  steps.forEach((step, index) => {
    console.log(chalk.gray(`  ${index + 1}. `) + step);
  });

  if (buildQuickDocGroups(provider).length > 0) {
    console.log();
    printQuickDoc(provider);
  }

  console.log();
}

function printAlreadyInitialized(_targetDir, analysis) {
  console.log(
    chalk.gray(
      `ℹ This directory is already initialized for ${analysis.provider.label} (${analysis.presentCount}/${analysis.totalCount} files present).\n`,
    ),
  );
  console.log(chalk.gray("Nothing to do. You might want:"));
  console.log(
    chalk.gray("  • ai-agent-bootstrap status          — audit file coverage"),
  );
  console.log(
    chalk.gray(
      "  • ai-agent-bootstrap reset           — re-render from templates (with diff preview)",
    ),
  );
  console.log(
    chalk.gray(
      "  • ai-agent-bootstrap init --force    — re-prompt and re-check anyway\n",
    ),
  );
}

function printPartialDetected(analysis) {
  console.log(
    chalk.gray(
      `ℹ ${analysis.provider.label} is partially initialized (${analysis.presentCount}/${analysis.totalCount} files present).`,
    ),
  );
  console.log(
    chalk.gray(
      `  Creating ${analysis.missingFiles.length} missing files with defaults...\n`,
    ),
  );
}

function printProviderActionSuggestions(installedProviderNames) {
  const installedSet = new Set(installedProviderNames);
  const installedLabels = installedProviderNames.map(
    (providerName) => getProvider(providerName).label,
  );

  console.log(chalk.gray("ℹ Detected installed providers in this directory:"));
  installedLabels.forEach((label) => {
    console.log(chalk.gray(`  • ${label}`));
  });
  console.log();

  console.log(chalk.gray("You can:"));
  for (const providerName of getReadyProviderNames()) {
    const provider = getProvider(providerName);
    if (installedSet.has(providerName)) {
      console.log(
        chalk.gray(
          `  • ai-agent-bootstrap init -p ${providerName} --force   — modify ${provider.label} setup`,
        ),
      );
      continue;
    }

    console.log(
      chalk.gray(
        `  • ai-agent-bootstrap init -p ${providerName}           — install ${provider.label} setup`,
      ),
    );
  }
  console.log();
}

module.exports = {
  QUICK_DOC_GROUPS,
  WORKFLOW_COMMAND_ORDER,
  collectWorkflowCommands,
  buildQuickDocGroups,
  buildMemoryStep,
  getQuickDocHint,
  printQuickDoc,
  printNextSteps,
  printAlreadyInitialized,
  printPartialDetected,
  printProviderActionSuggestions,
};

const path = require("path");
const chalk = require("chalk");
const fs = require("../core/fs-helpers");
const { createTwoFilesPatch } = require("diff");
const prompts = require("prompts");
const { collectInitData } = require("./init");
const { buildProviderRenderPlan } = require("../core/scaffold");
const { applyRenderPlan } = require("../core/apply-plan");
const {
  getGitignoreMergePlan,
  mergeGitignoreEntries,
} = require("../gitignore");
const { printHeader } = require("./ui");

function assertConfirmableOrYes(yes) {
  if (yes || process.stdin.isTTY) {
    return;
  }

  const error = new Error(
    "Not a TTY: pass --yes to apply reset changes without a confirmation prompt.",
  );
  error.code = "RESET_CONFIRM_NEEDS_YES";
  throw error;
}

async function confirmReset({ fileChangeCount, gitignoreWillChange }) {
  const pieces = [];
  if (fileChangeCount > 0) {
    pieces.push(`${fileChangeCount} file(s)`);
  }
  if (gitignoreWillChange) {
    pieces.push(".gitignore merge");
  }

  const detail = pieces.length ? ` (${pieces.join(", ")})` : "";
  const { confirmed } = await prompts({
    type: "confirm",
    name: "confirmed",
    initial: false,
    message: `Reset files from templates${detail}?`,
  });

  return Boolean(confirmed);
}

function printDiffs(fileChanges, gitignoreBefore, gitignoreNext) {
  let printed = false;

  for (const change of fileChanges) {
    const patch = createTwoFilesPatch(
      change.target,
      change.target,
      change.before,
      change.after,
      "",
      "",
    );
    console.log(patch);
    printed = true;
  }

  if (gitignoreNext) {
    const patch = createTwoFilesPatch(
      ".gitignore",
      ".gitignore",
      gitignoreBefore,
      gitignoreNext,
      "",
      "",
    );
    console.log(patch);
    printed = true;
  }

  return printed;
}

async function resetProject(options = {}) {
  const targetDir = path.resolve(options.dir || ".");
  const dryRun = Boolean(options.dryRun);
  const yes = Boolean(options.yes);
  const interactive = Boolean(options.prompt);

  printHeader(targetDir, "reset");

  if (!interactive && !options.config && !options.loadedConfig) {
    console.log(
      chalk.gray(
        "ℹ reset uses defaults; pass --prompt to re-answer questions or --config <file> to load values from a config.\n",
      ),
    );
  }

  const { provider, answers } = await collectInitData(targetDir, {
    ...options,
    interactive,
  });
  const planItems = await buildProviderRenderPlan(targetDir, provider, answers);

  const fileChanges = [];
  for (const item of planItems) {
    const before = item.exists ? item.currentContent : "";
    const after = item.rendered;
    if (before === after) {
      continue;
    }
    fileChanges.push({ target: item.target, before, after });
  }

  const gitPlan = await getGitignoreMergePlan(
    targetDir,
    provider.gitignoreEntries,
  );
  const gitignorePath = path.join(targetDir, ".gitignore");
  const gitignoreExists = await fs.pathExists(gitignorePath);
  const gitignoreBefore = gitignoreExists
    ? await fs.readFile(gitignorePath, "utf-8")
    : "";
  const gitignoreWillChange = Boolean(gitPlan.nextContent);

  const printed = printDiffs(fileChanges, gitignoreBefore, gitPlan.nextContent);
  const needsAnyWrite = fileChanges.length > 0 || gitignoreWillChange;

  if (dryRun) {
    if (!printed) {
      console.log(chalk.green("No template changes.\n"));
    } else {
      console.log(chalk.gray("Dry run only. No files were written.\n"));
    }
    return;
  }

  if (!needsAnyWrite) {
    console.log(chalk.green("Nothing to reset — tree matches templates.\n"));
    return;
  }

  assertConfirmableOrYes(yes);

  if (!yes) {
    const ok = await confirmReset({
      fileChangeCount: fileChanges.length,
      gitignoreWillChange,
    });
    if (!ok) {
      console.log(chalk.yellow("Aborted.\n"));
      return;
    }
  }

  const { created, overwritten, unchanged } = await applyRenderPlan(planItems, {
    overwrite: true,
  });

  await mergeGitignoreEntries(targetDir, provider.gitignoreEntries);

  console.log(
    chalk.cyan(
      `\n✨ Reset complete: ${created} created, ${overwritten} overwritten, ${unchanged} unchanged.\n`,
    ),
  );
}

module.exports = {
  resetProject,
};

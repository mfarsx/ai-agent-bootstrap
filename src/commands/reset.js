const path = require("path");
const chalk = require("chalk");
const fs = require("fs-extra");
const { createTwoFilesPatch } = require("diff");
const inquirer = require("inquirer");
const { collectInitData } = require("./init");
const { buildProviderRenderPlan } = require("../core/scaffold");
const { getGitignoreMergePlan, mergeGitignoreEntries } = require("../gitignore");

function printHeader(targetDir) {
  console.log(chalk.cyan("\n🤖 AI Agent Bootstrap — reset\n"));
  console.log(chalk.gray(`Target: ${targetDir}\n`));
}

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
  const { confirmed } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmed",
      default: false,
      message: `Reset files from templates${detail}?`,
    },
  ]);

  return confirmed;
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

  printHeader(targetDir);

  const { provider, answers } = await collectInitData(targetDir, options);
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

  const gitPlan = await getGitignoreMergePlan(targetDir, provider.gitignoreEntries);
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

  let created = 0;
  let overwritten = 0;
  let unchanged = 0;
  for (const item of planItems) {
    if (item.exists && item.currentContent === item.rendered) {
      unchanged++;
      continue;
    }

    if (!item.exists) {
      created++;
    } else {
      overwritten++;
    }

    await fs.ensureDir(path.dirname(item.targetFile));
    await fs.writeFile(item.targetFile, item.rendered, "utf-8");
  }

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

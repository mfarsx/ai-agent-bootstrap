const chalk = require("chalk");

function printHeader(targetDir, subtitle) {
  const title = subtitle
    ? `🤖 AI Agent Bootstrap — ${subtitle}`
    : "🤖 AI Agent Bootstrap";
  console.log(chalk.cyan(`\n${title}\n`));
  console.log(chalk.gray(`Target: ${targetDir}\n`));
}

function printFileResults(fileResults, options = {}) {
  const dryRun = Boolean(options.dryRun);

  for (const entry of fileResults) {
    if (entry.status === "created") {
      console.log(chalk.green(`  ✔  ${entry.target}`));
      continue;
    }

    if (entry.status === "would_create") {
      console.log(chalk.cyan(`  ◆  ${entry.target} (would create)`));
      continue;
    }

    console.log(chalk.yellow(`  ⏭  ${entry.target} (already exists)`));
  }
}

function printGitignoreResult(gitignoreResult, options = {}) {
  const dryRun = Boolean(options.dryRun);

  if (gitignoreResult.added > 0) {
    const verb = dryRun ? "would be added" : "added";
    const color = dryRun ? chalk.cyan : chalk.green;
    const icon = dryRun ? "◆" : "✔";
    console.log(color(`  ${icon}  .gitignore (${gitignoreResult.added} entries ${verb})`));
    return;
  }

  console.log(chalk.yellow("  ⏭  .gitignore (already up to date)"));
}

module.exports = {
  printHeader,
  printFileResults,
  printGitignoreResult,
};

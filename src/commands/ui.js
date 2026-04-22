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
  const verbose = Boolean(options.verbose);
  let skippedCount = 0;

  for (const entry of fileResults) {
    if (entry.status === "created") {
      console.log(chalk.green(`  ✔  ${entry.target}`));
      continue;
    }

    if (entry.status === "would_create") {
      console.log(chalk.cyan(`  ◆  ${entry.target} (would create)`));
      continue;
    }

    skippedCount += 1;
    if (verbose) {
      console.log(chalk.gray.dim(`  ⏭  ${entry.target} (already exists)`));
    }
  }

  if (!verbose && skippedCount > 0) {
    const skipLabel = skippedCount === 1 ? "file" : "files";
    const statusLabel = dryRun ? "already present" : "unchanged";
    console.log(
      chalk.gray.dim(`  ⏭  ${skippedCount} ${skipLabel} ${statusLabel}`),
    );
  }
}

function printGitignoreResult(gitignoreResult, options = {}) {
  const dryRun = Boolean(options.dryRun);

  if (gitignoreResult.added > 0) {
    const verb = dryRun ? "would be added" : "added";
    const color = dryRun ? chalk.cyan : chalk.green;
    const icon = dryRun ? "◆" : "✔";
    console.log(
      color(`  ${icon}  .gitignore (${gitignoreResult.added} entries ${verb})`),
    );
    return;
  }

  console.log(chalk.gray.dim("  ⏭  .gitignore (already up to date)"));
}

module.exports = {
  printHeader,
  printFileResults,
  printGitignoreResult,
};

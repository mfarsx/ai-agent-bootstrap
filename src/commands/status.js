const chalk = require("chalk");
const { buildStatusReport } = require("../core/status-report");

function printStatusHeader(report) {
  console.log(chalk.cyan("\n🤖 AI Agent Bootstrap — Status\n"));
  console.log(chalk.gray(`Directory: ${report.targetDir}\n`));
  console.log(chalk.gray(`Provider: ${report.provider.label}\n`));
}

function printStatusEntries(entries) {
  for (const entry of entries) {
    if (entry.exists) {
      console.log(chalk.green(`  ✔  ${entry.file}`));
      continue;
    }
    console.log(chalk.red(`  ✖  ${entry.file}`));
  }
}

function printStatusSummary(report) {
  console.log(chalk.cyan(`\n📊 ${report.found}/${report.expectedFiles.length} files found.`));

  if (report.missing > 0) {
    console.log(
      chalk.yellow(
        `   Run ${chalk.bold("ai-bootstrap init")} to create missing files.\n`,
      ),
    );
    return;
  }

  console.log(chalk.green("   All files in place! ✨\n"));
}

function checkStatus(options = {}) {
  const report = buildStatusReport(options);
  printStatusHeader(report);
  printStatusEntries(report.entries);
  printStatusSummary(report);
  return report;
}

module.exports = {
  checkStatus,
  printStatusEntries,
  printStatusHeader,
  printStatusSummary,
};

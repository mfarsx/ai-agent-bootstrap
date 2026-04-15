#!/usr/bin/env node

const { program } = require("commander");
const { version, description } = require("../package.json");

program.name("ai-bootstrap").description(description).version(version);

program
  .command("init")
  .description("Initialize AI agent base files in the current project")
  .option("-d, --dir <path>", "Target directory", ".")
  .option(
    "-p, --provider <name>",
    "Provider/interface (cline, cursor, openclaw, windsurf, claude-code)",
    "cline",
  )
  .option("-y, --yes", "Skip prompts and use defaults")
  .action(async (options) => {
    try {
      const { initProject } = require("../src/init");
      await initProject(options);
    } catch (err) {
      const chalk = require("chalk");
      console.error(chalk.red(`\n✖ Error: ${err.message}`));
      process.exit(1);
    }
  });

program
  .command("status")
  .description("Check which AI agent files exist in the current project")
  .option("-d, --dir <path>", "Target directory", ".")
  .option(
    "-p, --provider <name>",
    "Provider/interface (cline, cursor, openclaw, windsurf, claude-code)",
    "cline",
  )
  .action((options) => {
    try {
      const { checkStatus } = require("../src/status");
      checkStatus(options);
    } catch (err) {
      const chalk = require("chalk");
      console.error(chalk.red(`\n✖ Error: ${err.message}`));
      process.exit(1);
    }
  });

program.parse();

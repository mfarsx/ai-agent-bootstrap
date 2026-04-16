#!/usr/bin/env node

const { program } = require("commander");
const chalk = require("chalk");
const { version, description } = require("../package.json");
const { getProvider, getProviderNames } = require("../src/providers");

program.name("ai-bootstrap").description(description).version(version);

const providerNames = getProviderNames();
const providerHelpText = `Provider/interface (${providerNames.join(", ")})`;

function collectTemplateVariable(value, previous) {
  const output = Array.isArray(previous) ? previous : [];
  output.push(value);
  return output;
}

function normalizeOptions(options = {}) {
  const normalized = { ...options };

  if (typeof normalized.dir !== "string" || normalized.dir.trim() === "") {
    const error = new Error("Invalid target dir. Use a non-empty directory path.");
    error.code = "INVALID_TARGET_DIR";
    throw error;
  }

  const provider = getProvider(normalized.provider || "cline");
  normalized.provider = provider.name;

  if (Array.isArray(normalized.var) && normalized.var.length > 0) {
    normalized.templateVariables = normalized.var;
  }

  return normalized;
}

function classifyError(error) {
  if (!error || typeof error.message !== "string") {
    return "runtime error";
  }

  if (error.code === "INVALID_TARGET_DIR" || /invalid target dir/i.test(error.message)) {
    return "invalid target dir";
  }
  if (
    String(error.code || "").startsWith("CONFIG_") ||
    /config file|config "context"|config "templateVariables"/i.test(error.message)
  ) {
    return "config error";
  }
  if (/Unknown provider/i.test(error.message)) {
    return "unknown provider";
  }
  if (/templates are not ready/i.test(error.message)) {
    return "provider not ready";
  }
  if (
    /missing template source/i.test(error.message) ||
    /ENOENT/i.test(error.message)
  ) {
    return "missing template file";
  }
  if (/EACCES|EPERM/i.test(error.message) || /permission denied/i.test(error.message)) {
    return "permission denied";
  }
  if (error.code === "RESET_CONFIRM_NEEDS_YES") {
    return "reset error";
  }

  return "runtime error";
}

function formatCliError(error) {
  const category = classifyError(error);
  const message = error && error.message ? error.message : "Unexpected error";
  return `\n✖ ${category}: ${message}`;
}

function runCommand(handler) {
  return async (options) => {
    try {
      const normalizedOptions = normalizeOptions(options);
      await handler(normalizedOptions);
    } catch (error) {
      console.error(chalk.red(formatCliError(error)));
      process.exit(1);
    }
  };
}

program
  .command("init")
  .description("Initialize AI agent base files in the current project")
  .option("-d, --dir <path>", "Target directory", ".")
  .option("-p, --provider <name>", providerHelpText, "cline")
  .option("-y, --yes", "Skip prompts and use defaults")
  .option("--dry-run", "List files that would be created without writing")
  .option("--config <path>", "Path to JSON config file")
  .option(
    "--var <key=value>",
    "Template variable override (repeatable)",
    collectTemplateVariable,
    [],
  )
  .action(
    runCommand(async (options) => {
      const { initProject } = require("../src/init");
      await initProject(options);
    }),
  );

program
  .command("status")
  .description("Check which AI agent files exist in the current project")
  .option("-d, --dir <path>", "Target directory", ".")
  .option("-p, --provider <name>", providerHelpText, "cline")
  .action(
    runCommand((options) => {
      const { checkStatus } = require("../src/status");
      checkStatus(options);
    }),
  );

program
  .command("reset")
  .description("Reset provider files from templates (writes by default)")
  .option("-d, --dir <path>", "Target directory", ".")
  .option("-p, --provider <name>", providerHelpText, "cline")
  .option("-y, --yes", "Skip confirmation prompt")
  .option("--dry-run", "Preview diff without writing")
  .option("--config <path>", "Path to JSON config file")
  .option(
    "--var <key=value>",
    "Template variable override (repeatable)",
    collectTemplateVariable,
    [],
  )
  .action(
    runCommand(async (options) => {
      const { resetProject } = require("../src/reset");
      await resetProject(options);
    }),
  );

program.parse();

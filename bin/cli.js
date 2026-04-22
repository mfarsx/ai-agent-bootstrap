#!/usr/bin/env node

const [nodeMajorVersion] = process.versions.node.split(".").map(Number);
if (nodeMajorVersion < 18) {
  console.error(
    `ai-agent-bootstrap requires Node.js 18 or later. You have ${process.versions.node}.`,
  );
  process.exit(1);
}

const { program } = require("commander");
const chalk = require("chalk");
const { version, description } = require("../package.json");
const { CancelledError } = require("../src/core/cli-errors");
const {
  DEFAULT_PROVIDER,
  getProvider,
  getProviderNames,
} = require("../src/providers");

program.name("ai-agent-bootstrap").description(description).version(version);

const providerNames = getProviderNames();
const providerHelpText = `Provider/interface (${providerNames.join(", ")})`;

function normalizeOptions(options = {}) {
  const normalized = { ...options };

  if (normalized.dir === undefined) {
    normalized.dir = ".";
  }

  if (typeof normalized.dir !== "string" || normalized.dir.trim() === "") {
    const error = new Error(
      "Invalid target dir. Use a non-empty directory path.",
    );
    error.code = "INVALID_TARGET_DIR";
    throw error;
  }

  if (normalized.provider) {
    const provider = getProvider(normalized.provider);
    normalized.provider = provider.name;
  }

  return normalized;
}

const ERROR_CODE_MAP = {
  INVALID_TARGET_DIR: "invalid target dir",
  UNKNOWN_PROVIDER: "unknown provider",
  AMBIGUOUS_PROVIDER: "ambiguous provider",
  PROVIDER_NOT_READY: "provider not ready",
  MISSING_TEMPLATE_SOURCE: "missing template file",
  RESET_CONFIRM_NEEDS_YES: "reset error",
  CANCELLED: null,
  EACCES: "permission denied",
  EPERM: "permission denied",
};

function classifyError(error) {
  if (!error) {
    return "runtime error";
  }

  const code = error.code;

  if (code && ERROR_CODE_MAP[code]) {
    return ERROR_CODE_MAP[code];
  }

  if (code === "ENOENT") {
    return "missing file";
  }

  if (code === "EACCES" || code === "EPERM") {
    return "permission denied";
  }

  if (typeof code === "string" && code.startsWith("CONFIG_")) {
    return "config error";
  }

  return "runtime error";
}

function formatCliError(error) {
  const category = classifyError(error);
  const message = error && error.message ? error.message : "Unexpected error";
  return `\n✖ ${category}: ${message}`;
}

function runCommand(handler) {
  return async (...args) => {
    try {
      const command = args[args.length - 1];
      const options = command.opts();
      const positionalArgs = args.slice(0, -2);
      const normalizedOptions = normalizeOptions(options);
      await handler(...positionalArgs, normalizedOptions);
    } catch (error) {
      if (error instanceof CancelledError || error.code === "CANCELLED") {
        process.exit(0);
      }

      console.error(chalk.red(formatCliError(error)));
      process.exit(1);
    }
  };
}

program
  .command("init [provider]")
  .description("Initialize AI agent base files in the current project")
  .option("-d, --dir <path>", "Target directory", ".")
  .option("-p, --provider <name>", providerHelpText)
  .option("-y, --yes", "Skip prompts and use defaults")
  .option("--force", "Bypass initialized-directory checks and re-run prompts")
  .option("--verbose", "Show full file-level output, including skipped files")
  .option("--quiet", "Print compact output when nothing changed")
  .option("--dry-run", "List files that would be created without writing")
  .option("--config <path>", "Path to JSON config file")
  .action(
    runCommand(async (provider, options) => {
      if (provider) options.provider = provider;
      const { initProject } = require("../src/commands/init");
      await initProject(options);
    }),
  );

program
  .command("status [provider]")
  .description("Check which AI agent files exist in the current project")
  .option("-d, --dir <path>", "Target directory", ".")
  .option("-p, --provider <name>", providerHelpText, DEFAULT_PROVIDER)
  .action(
    runCommand(async (provider, options) => {
      if (provider) options.provider = provider;
      const { checkStatus } = require("../src/commands/status");
      await checkStatus(options);
    }),
  );

program
  .command("reset [provider]")
  .description("Reset provider files from templates (writes by default)")
  .option("-d, --dir <path>", "Target directory", ".")
  .option("-p, --provider <name>", providerHelpText, DEFAULT_PROVIDER)
  .option("-y, --yes", "Skip confirmation prompt")
  .option("--dry-run", "Preview diff without writing")
  .option("--config <path>", "Path to JSON config file")
  .option("--prompt", "Re-ask project questions before resetting")
  .action(
    runCommand(async (provider, options) => {
      if (provider) options.provider = provider;
      const { resetProject } = require("../src/commands/reset");
      await resetProject(options);
    }),
  );

program.parse();

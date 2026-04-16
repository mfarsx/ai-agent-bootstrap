#!/usr/bin/env node

const { program } = require("commander");
const chalk = require("chalk");
const { version, description } = require("../package.json");
const { DEFAULT_PROVIDER, getProvider, getProviderNames } = require("../src/providers");

program.name("ai-bootstrap").description(description).version(version);

const providerNames = getProviderNames();
const providerHelpText = `Provider/interface (${providerNames.join(", ")})`;

function normalizeOptions(options = {}) {
  const normalized = { ...options };

  if (normalized.dir === undefined) {
    normalized.dir = ".";
  }

  if (typeof normalized.dir !== "string" || normalized.dir.trim() === "") {
    const error = new Error("Invalid target dir. Use a non-empty directory path.");
    error.code = "INVALID_TARGET_DIR";
    throw error;
  }

  const provider = getProvider(normalized.provider || DEFAULT_PROVIDER);
  normalized.provider = provider.name;

  return normalized;
}

const ERROR_CODE_MAP = {
  INVALID_TARGET_DIR: "invalid target dir",
  UNKNOWN_PROVIDER: "unknown provider",
  PROVIDER_NOT_READY: "provider not ready",
  MISSING_TEMPLATE_SOURCE: "missing template file",
  RESET_CONFIRM_NEEDS_YES: "reset error",
  EACCES: "permission denied",
  EPERM: "permission denied",
};

function classifyError(error) {
  if (!error || typeof error.message !== "string") {
    return "runtime error";
  }

  const code = error.code || "";

  if (ERROR_CODE_MAP[code]) {
    return ERROR_CODE_MAP[code];
  }

  if (String(code).startsWith("CONFIG_")) {
    return "config error";
  }

  if (/Unknown provider/i.test(error.message)) {
    return "unknown provider";
  }
  if (/templates are not ready/i.test(error.message)) {
    return "provider not ready";
  }
  if (/ENOENT/i.test(error.message) || /missing template source/i.test(error.message)) {
    return "missing template file";
  }
  if (/EACCES|EPERM/i.test(error.message) || /permission denied/i.test(error.message)) {
    return "permission denied";
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
      console.error(chalk.red(formatCliError(error)));
      process.exit(1);
    }
  };
}

program
  .command("init [provider]")
  .description("Initialize AI agent base files in the current project")
  .option("-d, --dir <path>", "Target directory", ".")
  .option("-p, --provider <name>", providerHelpText, DEFAULT_PROVIDER)
  .option("-y, --yes", "Skip prompts and use defaults")
  .option("--dry-run", "List files that would be created without writing")
  .option("--config <path>", "Path to JSON config file")
  .option("--var <keyvalue...>", "Template variable overrides (KEY=VALUE)")
  .action(
    runCommand(async (provider, options) => {
      if (provider) options.provider = provider;
      if (options.var) {
        options.templateVariables = options.var;
      }
      const { initProject } = require("../src/init");
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
      const { checkStatus } = require("../src/status");
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
  .action(
    runCommand(async (provider, options) => {
      if (provider) options.provider = provider;
      const { resetProject } = require("../src/reset");
      await resetProject(options);
    }),
  );

program.parse();

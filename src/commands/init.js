const path = require("path");
const chalk = require("chalk");
const { askQuestions, getDefaults } = require("../prompts");
const { assertProviderReady } = require("../providers");
const { mergeGitignoreEntries, previewGitignoreMerge } = require("../gitignore");
const { scaffoldProviderFiles } = require("../core/scaffold");
const { loadInitConfig, resolveInitConfigPath } = require("../core/config");
const { buildTemplateContext, mergeTemplateVariables } = require("../core/template-context");

function printHeader(targetDir) {
  console.log(chalk.cyan("\n🤖 AI Agent Bootstrap\n"));
  console.log(chalk.gray(`Target: ${targetDir}\n`));
}

function printFileResults(fileResults) {
  for (const entry of fileResults) {
    if (entry.status === "created") {
      console.log(chalk.green(`  ✔  ${entry.target}`));
      continue;
    }

    console.log(chalk.yellow(`  ⏭  ${entry.target} (already exists)`));
  }
}

function printDryRunFileResults(fileResults) {
  for (const entry of fileResults) {
    if (entry.status === "would_create") {
      console.log(chalk.cyan(`  ◆  ${entry.target} (would create)`));
      continue;
    }

    console.log(chalk.yellow(`  ⏭  ${entry.target} (already exists)`));
  }
}

function printGitignoreResult(gitignoreResult) {
  if (gitignoreResult.added > 0) {
    console.log(
      chalk.green(`  ✔  .gitignore (${gitignoreResult.added} entries added)`),
    );
    return;
  }

  console.log(chalk.yellow("  ⏭  .gitignore (already up to date)"));
}

function printDryRunGitignoreResult(gitignoreResult) {
  if (gitignoreResult.added > 0) {
    console.log(
      chalk.cyan(
        `  ◆  .gitignore (${gitignoreResult.added} entries would be added)`,
      ),
    );
    return;
  }

  console.log(chalk.yellow("  ⏭  .gitignore (already up to date)"));
}

function printNextSteps(provider) {
  const steps = [
    `Fill in the ${provider.contextPath} files with your project details`,
  ];

  if (provider.rulesPath) {
    steps.push(`Review ${provider.rulesPath} and adjust to your workflow`);
  }

  steps.push(
    `In ${provider.label} chat/interface, run: plan>"prompt for init memory-bank"`,
  );
  steps.push("Start your AI agent — it will read these files automatically");

  console.log(chalk.gray("Next steps:"));
  steps.forEach((step, index) => {
    console.log(chalk.gray(`  ${index + 1}. ${step}`));
  });
  console.log();
}

async function collectInitData(targetDir, options) {
  const configPath = await resolveInitConfigPath(targetDir, options.config);
  const loadedConfig = await loadInitConfig(configPath);
  const selectedProvider = assertProviderReady(options.provider || "cline", {
    checkTemplateSources: true,
  });
  const defaultContext = {
    ...getDefaults(targetDir),
    provider: selectedProvider.name,
  };
  const usePromptDefaults = Boolean(options.yes) || !process.stdin.isTTY;
  const promptContext = usePromptDefaults
    ? defaultContext
    : await askQuestions(targetDir, defaultContext);

  // Precedence seam for future customization:
  // defaults < prompt/config < --var/cli
  const configContext = {
    ...loadedConfig.context,
    ...(options.configContext || {}),
  };
  const configTemplateVariables = mergeTemplateVariables({
    defaults: loadedConfig.templateVariables,
    cli: options.configVariables,
  });

  const context = buildTemplateContext({
    baseContext: defaultContext,
    promptContext,
    configContext,
    cliContext: options.contextOverrides,
    defaultTemplateVariables: defaultContext.templateVariables,
    configTemplateVariables,
    cliTemplateVariables: options.templateVariables,
  });

  const provider = assertProviderReady(context.provider || selectedProvider.name, {
    checkTemplateSources: true,
  });

  return { provider, answers: context };
}

async function initProject(options = {}) {
  const targetDir = path.resolve(options.dir || ".");
  const dryRun = Boolean(options.dryRun);
  printHeader(targetDir);

  if (dryRun) {
    console.log(chalk.gray("Dry run — no files will be written.\n"));
  }

  const { provider, answers } = await collectInitData(targetDir, options);
  const scaffoldResult = await scaffoldProviderFiles(targetDir, provider, answers, {
    dryRun,
  });

  if (dryRun) {
    printDryRunFileResults(scaffoldResult.fileResults);
  } else {
    printFileResults(scaffoldResult.fileResults);
  }

  const gitignoreResult = dryRun
    ? await previewGitignoreMerge(targetDir, provider.gitignoreEntries)
    : await mergeGitignoreEntries(targetDir, provider.gitignoreEntries);

  if (dryRun) {
    printDryRunGitignoreResult(gitignoreResult);
  } else {
    printGitignoreResult(gitignoreResult);
  }

  if (dryRun) {
    console.log(
      chalk.cyan(
        `\n✨ Dry run: ${scaffoldResult.wouldCreate} files would be created, ${scaffoldResult.skipped} skipped.\n`,
      ),
    );
    return;
  }

  console.log(
    chalk.cyan(
      `\n✨ Done! ${scaffoldResult.created} files created, ${scaffoldResult.skipped} skipped.\n`,
    ),
  );

  if (scaffoldResult.created > 0) {
    printNextSteps(provider);
  }
}

module.exports = {
  initProject,
  collectInitData,
};

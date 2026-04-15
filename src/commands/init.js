const path = require("path");
const chalk = require("chalk");
const { askQuestions, getDefaults } = require("../prompts");
const { assertProviderReady } = require("../providers");
const { mergeGitignoreEntries } = require("../gitignore");
const { scaffoldProviderFiles } = require("../core/scaffold");
const { loadInitConfig } = require("../core/config");
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

function printGitignoreResult(gitignoreResult) {
  if (gitignoreResult.added > 0) {
    console.log(
      chalk.green(`  ✔  .gitignore (${gitignoreResult.added} entries added)`),
    );
    return;
  }

  console.log(chalk.yellow("  ⏭  .gitignore (already up to date)"));
}

function printNextSteps(provider) {
  console.log(chalk.gray("Next steps:"));
  console.log(
    chalk.gray(`  1. Fill in the ${provider.contextPath} files with your project details`),
  );
  if (provider.rulesPath) {
    console.log(
      chalk.gray(`  2. Review ${provider.rulesPath} and adjust to your workflow`),
    );
  }
  console.log(
    chalk.gray("  3. Start your AI agent — it will read these files automatically\n"),
  );
}

async function collectInitData(targetDir, options) {
  const loadedConfig = await loadInitConfig(options.config);
  const selectedProvider = assertProviderReady(options.provider || "cline", {
    checkTemplateSources: true,
  });
  const defaultContext = {
    ...getDefaults(targetDir),
    provider: selectedProvider.name,
  };
  const promptContext = options.yes
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
  printHeader(targetDir);

  const { provider, answers } = await collectInitData(targetDir, options);
  const scaffoldResult = await scaffoldProviderFiles(targetDir, provider, answers);
  printFileResults(scaffoldResult.fileResults);

  const gitignoreResult = await mergeGitignoreEntries(
    targetDir,
    provider.gitignoreEntries,
  );
  printGitignoreResult(gitignoreResult);

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

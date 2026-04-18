const path = require("path");
const chalk = require("chalk");
const { askQuestions, getDefaults, applyStackDerivedDefaults } = require("../prompts");
const { DEFAULT_PROVIDER, assertProviderReady } = require("../providers");
const { mergeGitignoreEntries, previewGitignoreMerge } = require("../gitignore");
const { scaffoldProviderFiles } = require("../core/scaffold");
const { loadInitConfig, resolveInitConfigPath } = require("../core/config");
const { buildTemplateContext } = require("../core/template-context");
const { printHeader, printFileResults, printGitignoreResult } = require("./ui");

function isFreshMemoryBank(provider, fileResults) {
  const contextPrefix = provider.contextPath + "/";
  const contextResults = fileResults.filter((r) => r.target.startsWith(contextPrefix));
  if (contextResults.length === 0) return true;
  return contextResults.every((r) => r.status === "created");
}

function buildMemoryStep(provider, fileResults) {
  const workflows = provider.workflows || {};
  const fresh = isFreshMemoryBank(provider, fileResults);

  if (fresh && workflows.initMemory) {
    return `Run ${chalk.bold(workflows.initMemory.command)} ${workflows.initMemory.hint} to populate ${provider.contextPath}`;
  }

  if (!fresh && workflows.updateMemory) {
    return `Run ${chalk.bold(workflows.updateMemory.command)} ${workflows.updateMemory.hint} to sync ${provider.contextPath} with current project state`;
  }

  if (fresh) {
    return `Fill in the ${provider.contextPath}/ files with your project details`;
  }

  return `Review and update ${provider.contextPath}/ files to reflect current project state`;
}

function printNextSteps(provider, scaffoldResult) {
  const steps = [buildMemoryStep(provider, scaffoldResult.fileResults)];

  if (provider.rulesPath) {
    steps.push(`Review ${provider.rulesPath} and adjust to your workflow`);
  }

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
  const mergedConfigContext = { ...loadedConfig.context, ...options.configContext };
  const mergedConfigVars = options.configVariables || loadedConfig.templateVariables;
  const selectedProvider = assertProviderReady(options.provider || DEFAULT_PROVIDER, {
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

  const context = buildTemplateContext({
    baseContext: defaultContext,
    promptContext,
    configContext: mergedConfigContext,
    cliContext: options.contextOverrides || {},
    defaultTemplateVariables: defaultContext.templateVariables,
    configTemplateVariables: mergedConfigVars,
    cliTemplateVariables: options.templateVariables || {},
  });

  applyStackDerivedDefaults(context);

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

  printFileResults(scaffoldResult.fileResults, { dryRun });

  const gitignoreResult = dryRun
    ? await previewGitignoreMerge(targetDir, provider.gitignoreEntries)
    : await mergeGitignoreEntries(targetDir, provider.gitignoreEntries);

  printGitignoreResult(gitignoreResult, { dryRun });

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

  printNextSteps(provider, scaffoldResult);
}

module.exports = {
  initProject,
  collectInitData,
};

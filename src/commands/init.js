const path = require("path");
const chalk = require("chalk");
const {
  askQuestions,
  getDefaults,
  applyStackDerivedDefaults,
} = require("../prompts");
const { DEFAULT_PROVIDER, assertProviderReady } = require("../providers");
const {
  mergeGitignoreEntries,
  previewGitignoreMerge,
} = require("../gitignore");
const { scaffoldProviderFiles } = require("../core/scaffold");
const {
  analyzeTargetDir,
  analyzeProviderStates,
} = require("../core/init-analyzer");
const { loadInitConfig, resolveInitConfigPath } = require("../core/config");
const { buildTemplateContext } = require("../core/template-context");
const { printHeader, printFileResults, printGitignoreResult } = require("./ui");
const {
  printAlreadyInitialized,
  printPartialDetected,
  printProviderActionSuggestions,
  printNextSteps,
  collectWorkflowCommands,
  buildQuickDocGroups,
} = require("./init-ui");
const {
  getInstalledFlowActionChoices,
  getInitNewProviderChoices,
  promptForAmbiguousProvider,
  promptForInstalledProviderFlow,
} = require("./init-flow");

async function collectInitData(targetDir, options) {
  const configPath =
    options.configPath ||
    (await resolveInitConfigPath(targetDir, options.config));
  const loadedConfig =
    options.loadedConfig || (await loadInitConfig(configPath));
  const mergedConfigContext = {
    ...loadedConfig.context,
    ...options.configContext,
  };
  const mergedConfigVars =
    options.configVariables || loadedConfig.templateVariables;
  const selectedProvider = assertProviderReady(
    options.provider || mergedConfigContext.provider || DEFAULT_PROVIDER,
    {
      checkTemplateSources: true,
    },
  );
  const interactive =
    options.interactive !== undefined
      ? Boolean(options.interactive)
      : !options.yes && process.stdin.isTTY;

  const defaultContext = {
    ...getDefaults(targetDir),
    provider: selectedProvider.name,
  };

  let promptContext = defaultContext;
  let touchedByPrompt = new Set();
  if (interactive) {
    const { answers, touched } = await askQuestions(targetDir, defaultContext);
    promptContext = answers;
    touchedByPrompt = touched;
  }

  const cliContext = options.contextOverrides || {};
  const customFields = new Set([
    ...touchedByPrompt,
    ...Object.keys(mergedConfigContext),
    ...Object.keys(cliContext),
  ]);

  const context = buildTemplateContext({
    baseContext: defaultContext,
    promptContext,
    configContext: mergedConfigContext,
    cliContext,
    defaultTemplateVariables: defaultContext.templateVariables,
    configTemplateVariables: mergedConfigVars,
    cliTemplateVariables: options.templateVariables || {},
  });

  applyStackDerivedDefaults(context, { customFields });

  const provider = assertProviderReady(
    context.provider || selectedProvider.name,
    {
      checkTemplateSources: true,
    },
  );

  return { provider, answers: context };
}

async function initProject(options = {}) {
  const targetDir = path.resolve(options.dir || ".");
  const dryRun = Boolean(options.dryRun);
  const verbose = Boolean(options.verbose);
  const force = Boolean(options.force);
  const quiet = Boolean(options.quiet);
  let bypassFullEarlyExit = false;
  let providerChosenFromInstalledFlow = false;
  let prebuiltStates = null;

  printHeader(targetDir);

  if (dryRun) {
    console.log(chalk.gray("Dry run — no files will be written.\n"));
  }

  const configPath = await resolveInitConfigPath(targetDir, options.config);
  const loadedConfig = await loadInitConfig(configPath);
  const explicitProvider = Boolean(
    options.provider || loadedConfig.context.provider,
  );
  let selectedProvider =
    options.provider || loadedConfig.context.provider || null;

  if (!explicitProvider && !force) {
    const providerState = await analyzeProviderStates(targetDir);
    prebuiltStates = providerState.states;
    if (providerState.installedProviderNames.length > 0) {
      if (!options.yes && process.stdin.isTTY) {
        const selection = await promptForInstalledProviderFlow(
          providerState.installedProviderNames,
        );

        if (selection.action === "exit") {
          console.log(chalk.gray("\nℹ Exited without changes.\n"));
          return;
        }

        selectedProvider = selection.provider;
        providerChosenFromInstalledFlow = true;
        const installedSet = new Set(providerState.installedProviderNames);
        if (selection.action === "update-existing") {
          bypassFullEarlyExit = true;
        } else if (selection.action === "init-new") {
          bypassFullEarlyExit = installedSet.has(selection.provider);
        }
      } else {
        printProviderActionSuggestions(providerState.installedProviderNames);
        return;
      }
    }
  }

  let analysis = await analyzeTargetDir(targetDir, {
    providerHint: selectedProvider,
    prebuiltStates,
  });

  if (!force && analysis.status === "ambiguous") {
    if (options.yes || !process.stdin.isTTY) {
      const error = new Error(
        `Multiple provider footprints detected (${analysis.candidates.join(
          ", ",
        )}). Re-run with -p <provider>.`,
      );
      error.code = "AMBIGUOUS_PROVIDER";
      throw error;
    }

    selectedProvider = await promptForAmbiguousProvider(analysis.candidates);
    analysis = await analyzeTargetDir(targetDir, {
      providerHint: selectedProvider,
      prebuiltStates,
    });
  }

  if (!force && !bypassFullEarlyExit && analysis.status === "full") {
    printAlreadyInitialized(targetDir, analysis);
    return;
  }

  if (!force && analysis.status === "partial") {
    printPartialDetected(analysis);
  }

  const shouldUsePrompts =
    !providerChosenFromInstalledFlow &&
    (force || analysis.status === "fresh" || analysis.status === "ambiguous");

  const { provider, answers } = await collectInitData(targetDir, {
    ...options,
    provider: selectedProvider || (analysis.provider && analysis.provider.name),
    configPath,
    loadedConfig,
    interactive: shouldUsePrompts && !options.yes && process.stdin.isTTY,
  });
  const scaffoldResult = await scaffoldProviderFiles(
    targetDir,
    provider,
    answers,
    {
      dryRun,
    },
  );

  printFileResults(scaffoldResult.fileResults, { dryRun, verbose });

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

  const nothingChanged =
    scaffoldResult.created === 0 && gitignoreResult.added === 0;

  if (quiet && nothingChanged) {
    console.log(chalk.cyan("\n✨ In sync. No changes applied.\n"));
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
  printAlreadyInitialized,
  printPartialDetected,
  printProviderActionSuggestions,
  getInstalledFlowActionChoices,
  getInitNewProviderChoices,
  collectWorkflowCommands,
  buildQuickDocGroups,
};

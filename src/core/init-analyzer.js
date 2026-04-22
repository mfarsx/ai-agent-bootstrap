const path = require("path");
const fs = require("./fs-helpers");
const { getGitignoreMergePlan } = require("../gitignore");
const { assertProviderReady, getReadyProviders } = require("../providers");

async function findDetectedCandidates(targetDir, providers) {
  const perProvider = await Promise.all(
    providers.map(async (provider) => {
      const targets = provider.detectionTargets || [];
      if (targets.length === 0) {
        return null;
      }

      const matches = await Promise.all(
        targets.map((target) => fs.pathExists(path.join(targetDir, target))),
      );
      const matched = matches.filter(Boolean).length;
      const coverage = matched / targets.length;
      if (coverage < 0.5) {
        return null;
      }

      return { provider, matched, total: targets.length };
    }),
  );

  return perProvider.filter(Boolean);
}

function findDetectedCandidatesFromStates(providers, states) {
  return providers
    .map((provider) => {
      const targets = provider.detectionTargets || [];
      if (targets.length === 0) {
        return null;
      }

      const state = states[provider.name];
      if (!state || !Array.isArray(state.presentFiles)) {
        return null;
      }

      const presentSet = new Set(state.presentFiles);
      const matched = targets.filter((target) => presentSet.has(target)).length;
      const coverage = matched / targets.length;

      if (coverage < 0.5) {
        return null;
      }

      return { provider, matched, total: targets.length };
    })
    .filter(Boolean);
}

async function buildProviderAnalysis(targetDir, provider) {
  const [existsFlags, gitignorePlan] = await Promise.all([
    Promise.all(
      provider.files.map((file) =>
        fs.pathExists(path.join(targetDir, file.target)),
      ),
    ),
    getGitignoreMergePlan(targetDir, provider.gitignoreEntries),
  ]);

  const presentFiles = [];
  const missingFiles = [];
  for (let index = 0; index < provider.files.length; index++) {
    const file = provider.files[index];
    if (existsFlags[index]) {
      presentFiles.push(file.target);
    } else {
      missingFiles.push(file.target);
    }
  }

  const status =
    missingFiles.length === 0 && gitignorePlan.added === 0
      ? "full"
      : presentFiles.length === 0
        ? "fresh"
        : "partial";

  return {
    status,
    provider,
    candidates: [provider.name],
    presentFiles,
    missingFiles,
    presentCount: presentFiles.length,
    totalCount: provider.files.length,
    gitignore: {
      missingEntries: gitignorePlan.added,
      added: gitignorePlan.added,
    },
  };
}

async function analyzeTargetDir(targetDir, options = {}) {
  const providerHint = options.providerHint
    ? assertProviderReady(options.providerHint)
    : null;
  const prebuiltStates = options.prebuiltStates || null;

  if (providerHint) {
    if (prebuiltStates && prebuiltStates[providerHint.name]) {
      return prebuiltStates[providerHint.name];
    }
    return buildProviderAnalysis(targetDir, providerHint);
  }

  const providers = getReadyProviders();
  const detected = prebuiltStates
    ? findDetectedCandidatesFromStates(providers, prebuiltStates)
    : await findDetectedCandidates(targetDir, providers);

  if (detected.length === 0) {
    return {
      status: "fresh",
      provider: null,
      candidates: [],
      presentFiles: [],
      missingFiles: [],
      presentCount: 0,
      totalCount: 0,
      gitignore: {
        missingEntries: 0,
        added: 0,
      },
    };
  }

  if (detected.length > 1) {
    return {
      status: "ambiguous",
      provider: null,
      candidates: detected.map((entry) => entry.provider.name),
      presentFiles: [],
      missingFiles: [],
      presentCount: 0,
      totalCount: 0,
      gitignore: {
        missingEntries: 0,
        added: 0,
      },
    };
  }

  const detectedProvider = detected[0].provider;
  if (prebuiltStates && prebuiltStates[detectedProvider.name]) {
    return prebuiltStates[detectedProvider.name];
  }

  return buildProviderAnalysis(targetDir, detectedProvider);
}

async function analyzeProviderStates(targetDir) {
  const providers = getReadyProviders();
  const analyses = await Promise.all(
    providers.map((provider) => buildProviderAnalysis(targetDir, provider)),
  );

  const states = {};
  for (let index = 0; index < providers.length; index++) {
    states[providers[index].name] = analyses[index];
  }

  const installedProviderNames = providers
    .filter((provider) => {
      const targets = provider.detectionTargets || [];
      if (targets.length === 0) return false;
      const presentSet = new Set(states[provider.name].presentFiles);
      const matched = targets.filter((target) => presentSet.has(target)).length;
      return matched / targets.length >= 0.5;
    })
    .map((provider) => provider.name);

  return {
    installedProviderNames,
    states,
  };
}

module.exports = {
  analyzeTargetDir,
  analyzeProviderStates,
};

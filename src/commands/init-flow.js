const prompts = require("prompts");
const { getProvider, getReadyProviderNames } = require("../providers");
const { CancelledError } = require("../core/cli-errors");

const BACK_CHOICE = "__back";

function getInstalledFlowActionChoices(installedProviderNames) {
  const installedSet = new Set(installedProviderNames);
  const canInitNew = getReadyProviderNames().some(
    (providerName) => !installedSet.has(providerName),
  );
  const actionChoices = [
    {
      title: "Update existing setup",
      value: "update-existing",
    },
  ];

  if (canInitNew) {
    actionChoices.push({
      title: "Init new setup",
      value: "init-new",
    });
  }

  actionChoices.push({
    title: "Exit",
    value: "exit",
  });

  return actionChoices;
}

function getInitNewProviderChoices(installedProviderNames) {
  const installedSet = new Set(installedProviderNames);
  return getReadyProviderNames()
    .filter((providerName) => !installedSet.has(providerName))
    .map((providerName) => ({
      title: getProvider(providerName).label,
      value: providerName,
    }));
}

async function promptForAmbiguousProvider(candidates) {
  const choices = candidates.map((name) => ({ title: name, value: name }));
  const response = await prompts(
    {
      type: "select",
      name: "provider",
      message: "Multiple provider footprints detected. Choose provider:",
      choices,
      initial: 0,
    },
    {
      onCancel: () => {
        throw new CancelledError();
      },
    },
  );

  return response.provider;
}

async function promptForInstalledProviderFlow(installedProviderNames) {
  const installedChoices = installedProviderNames.map((providerName) => ({
    title: getProvider(providerName).label,
    value: providerName,
  }));
  const initNewChoices = getInitNewProviderChoices(installedProviderNames);

  while (true) {
    const response = await prompts(
      {
        type: "select",
        name: "action",
        message: "Detected existing setup. What would you like to do?",
        choices: getInstalledFlowActionChoices(installedProviderNames),
        initial: 0,
      },
      {
        onCancel: () => {
          throw new CancelledError();
        },
      },
    );

    if (response.action === "update-existing") {
      const providerResponse = await prompts(
        {
          type: "select",
          name: "provider",
          message: "Choose provider to update:",
          choices: [
            ...installedChoices,
            {
              title: "Back",
              value: BACK_CHOICE,
            },
          ],
          initial: 0,
        },
        {
          onCancel: () => {
            throw new CancelledError();
          },
        },
      );

      if (providerResponse.provider === BACK_CHOICE) {
        continue;
      }

      return {
        action: response.action,
        provider: providerResponse.provider,
      };
    }

    if (response.action === "init-new") {
      const providerResponse = await prompts(
        {
          type: "select",
          name: "provider",
          message: "Choose provider to initialize:",
          choices: [
            ...initNewChoices,
            {
              title: "Back",
              value: BACK_CHOICE,
            },
          ],
          initial: 0,
        },
        {
          onCancel: () => {
            throw new CancelledError();
          },
        },
      );

      if (providerResponse.provider === BACK_CHOICE) {
        continue;
      }

      return {
        action: response.action,
        provider: providerResponse.provider,
      };
    }

    return {
      action: response.action,
      provider: null,
    };
  }
}

module.exports = {
  BACK_CHOICE,
  getInstalledFlowActionChoices,
  getInitNewProviderChoices,
  promptForAmbiguousProvider,
  promptForInstalledProviderFlow,
};

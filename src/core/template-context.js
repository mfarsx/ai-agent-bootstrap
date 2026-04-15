function normalizeTemplateVariableKey(key) {
  return String(key || "")
    .trim()
    .replace(/\s+/g, "_")
    .toUpperCase();
}

function normalizeTemplateVariables(input) {
  if (!input) {
    return {};
  }

  if (Array.isArray(input)) {
    return normalizeTemplateVariablesFromArray(input);
  }

  if (typeof input !== "object") {
    return {};
  }

  const output = {};

  for (const [rawKey, rawValue] of Object.entries(input)) {
    const key = normalizeTemplateVariableKey(rawKey);
    if (!key) {
      continue;
    }
    output[key] = rawValue == null ? "" : String(rawValue);
  }

  return output;
}

function normalizeTemplateVariablesFromArray(entries) {
  const output = {};

  for (const entry of entries) {
    const text = String(entry || "");
    const separatorIndex = text.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const rawKey = text.slice(0, separatorIndex);
    const rawValue = text.slice(separatorIndex + 1);
    const key = normalizeTemplateVariableKey(rawKey);
    if (!key) {
      continue;
    }
    output[key] = rawValue;
  }

  return output;
}

function mergeTemplateVariables({
  defaults = {},
  config = {},
  cli = {},
} = {}) {
  return {
    ...normalizeTemplateVariables(defaults),
    ...normalizeTemplateVariables(config),
    ...normalizeTemplateVariables(cli),
  };
}

function buildTemplateContext({
  baseContext = {},
  promptContext = {},
  configContext = {},
  cliContext = {},
  defaultTemplateVariables = {},
  configTemplateVariables = {},
  cliTemplateVariables = {},
} = {}) {
  const context = {
    ...baseContext,
    ...promptContext,
    ...configContext,
    ...cliContext,
  };
  const templateVariables = mergeTemplateVariables({
    defaults: defaultTemplateVariables,
    config: configTemplateVariables,
    cli: cliTemplateVariables,
  });

  if (Object.keys(templateVariables).length > 0) {
    context.templateVariables = templateVariables;
  }

  return context;
}

module.exports = {
  buildTemplateContext,
  mergeTemplateVariables,
  normalizeTemplateVariables,
};

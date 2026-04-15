const path = require("path");
const fs = require("fs-extra");

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

async function loadInitConfig(configPath) {
  if (!configPath) {
    return {
      context: {},
      templateVariables: {},
    };
  }

  const resolvedPath = path.resolve(configPath);
  const exists = await fs.pathExists(resolvedPath);
  if (!exists) {
    const error = new Error(`Config file not found: ${resolvedPath}`);
    error.code = "CONFIG_NOT_FOUND";
    throw error;
  }

  let parsed;
  try {
    const raw = await fs.readFile(resolvedPath, "utf-8");
    parsed = JSON.parse(raw);
  } catch (error) {
    const configError = new Error(
      `Invalid config file JSON at ${resolvedPath}: ${error.message}`,
    );
    configError.code = "CONFIG_INVALID_JSON";
    throw configError;
  }

  if (!isPlainObject(parsed)) {
    const error = new Error(`Config file must be a JSON object: ${resolvedPath}`);
    error.code = "CONFIG_INVALID_SHAPE";
    throw error;
  }

  const context = parsed.context || {};
  const templateVariables = parsed.templateVariables || parsed.variables || {};

  if (!isPlainObject(context)) {
    const error = new Error(`Config "context" must be an object: ${resolvedPath}`);
    error.code = "CONFIG_INVALID_CONTEXT";
    throw error;
  }

  const templateVariablesValid =
    isPlainObject(templateVariables) || Array.isArray(templateVariables);
  if (!templateVariablesValid) {
    const error = new Error(
      `Config "templateVariables" must be an object or array: ${resolvedPath}`,
    );
    error.code = "CONFIG_INVALID_TEMPLATE_VARIABLES";
    throw error;
  }

  return {
    context,
    templateVariables,
  };
}

module.exports = {
  loadInitConfig,
};

/**
 * Replace template placeholders with actual values.
 * Placeholders use {{KEY}} syntax.
 */
function fillTemplate(content, data) {
  const builtInValues = {
    PROJECT_NAME: data.projectName || "",
    PROJECT_DESCRIPTION: data.projectDescription || "",
    TECH_STACK: data.stack || "",
    EXTRAS: formatExtras(data.extras),
    TARGET_AUDIENCE: data.targetAudience || "",
    INSTALL_COMMAND: data.installCommand || "",
    DEV_COMMAND: data.devCommand || "",
    TEST_COMMAND: data.testCommand || "",
    LINT_COMMAND: data.lintCommand || "",
    PROJECT_STRUCTURE: data.projectStructure || "",
  };

  let output = replaceTokens(content, builtInValues);

  if (data.templateVariables) {
    output = replaceTokens(output, data.templateVariables);
  }

  return output;
}

function formatExtras(extras) {
  if (!extras || extras.length === 0)
    return "<!-- Add key dependencies here -->";
  return extras.map((e) => `- ${e}`).join("\n");
}

function replaceTokens(content, values) {
  let output = content;

  for (const [key, value] of Object.entries(values)) {
    const token = new RegExp(`\\{\\{${escapeRegex(key)}\\}\\}`, "g");
    output = output.replace(token, value ?? "");
  }

  return output;
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = { fillTemplate };

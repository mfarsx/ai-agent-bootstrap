const {
  buildTemplateContext,
  mergeTemplateVariables,
  normalizeTemplateVariables,
} = require("../src/core/template-context");

module.exports = async function registerTemplateContextTests({ test, assert }) {
  test("normalizeTemplateVariables normalizes keys and stringifies values", () => {
    const output = normalizeTemplateVariables({
      " owner name ": "Platform",
      retries: 3,
      ENABLED: true,
      "": "ignored",
    });

    assert.deepStrictEqual(output, {
      OWNER_NAME: "Platform",
      RETRIES: "3",
      ENABLED: "true",
    });
  });

  test("normalizeTemplateVariables supports KEY=VALUE array format", () => {
    const output = normalizeTemplateVariables([
      "owner_name=Team A",
      "build command=npm run build",
      "invalid-entry",
    ]);

    assert.deepStrictEqual(output, {
      OWNER_NAME: "Team A",
      BUILD_COMMAND: "npm run build",
    });
  });

  test("mergeTemplateVariables uses defaults < config < cli precedence", () => {
    const merged = mergeTemplateVariables({
      defaults: { ENV: "dev", TEAM: "core" },
      config: { env: "staging" },
      cli: { ENV: "prod" },
    });

    assert.deepStrictEqual(merged, {
      ENV: "prod",
      TEAM: "core",
    });
  });

  test("buildTemplateContext merges base/prompt/config/cli with precedence", () => {
    const context = buildTemplateContext({
      baseContext: { projectName: "base", provider: "cline" },
      promptContext: { projectName: "prompt", stack: "Node.js" },
      configContext: { stack: "TypeScript" },
      cliContext: { provider: "cursor" },
      configTemplateVariables: { TEAM: "config-team" },
      cliTemplateVariables: { team: "cli-team", OWNER: "me" },
    });

    assert.strictEqual(context.projectName, "prompt");
    assert.strictEqual(context.stack, "TypeScript");
    assert.strictEqual(context.provider, "cursor");
    assert.deepStrictEqual(context.templateVariables, {
      TEAM: "cli-team",
      OWNER: "me",
    });
  });
};

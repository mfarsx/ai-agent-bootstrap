const { getProvider, getReadyProviderNames } = require("../src/providers");
const {
  buildMemoryStep,
  collectWorkflowCommands,
} = require("../src/commands/init-ui");

module.exports = async function registerInitUiTests({ test, assert }) {
  test("buildMemoryStep returns init-memory hint when context files are newly created", () => {
    const provider = getProvider("cursor");
    const fileResults = [
      { target: "memory-bank/projectbrief.md", status: "created" },
    ];

    const message = buildMemoryStep(provider, fileResults);
    assert.ok(message.includes("/init-memory"));
    assert.ok(message.includes("in Cursor chat"));
  });

  test("buildMemoryStep returns update-memory hint when context files are skipped", () => {
    const provider = getProvider("cursor");
    const fileResults = [
      { target: "memory-bank/projectbrief.md", status: "skipped" },
    ];

    const message = buildMemoryStep(provider, fileResults);
    assert.ok(message.includes("/update-memory"));
    assert.ok(message.includes("in Cursor chat"));
  });

  test("collectWorkflowCommands matches expected command list for each ready provider", () => {
    const expectedCommands = [
      "/init-memory",
      "/update-memory",
      "/plan",
      "/review",
      "/commit",
      "/status",
      "/checkpoint",
      "/cleanup",
      "/stuck",
    ];

    for (const providerName of getReadyProviderNames()) {
      const provider = getProvider(providerName);
      if (!provider.workflowSlugs) {
        continue;
      }

      assert.deepStrictEqual(
        collectWorkflowCommands(provider),
        expectedCommands,
        `${providerName} workflow commands should match quick-doc order`,
      );
    }
  });
};

const { applyStackDerivedDefaults } = require("../src/core/stack-defaults");

module.exports = async function registerStackDefaultsTests({ test, assert }) {
  test("stack-defaults fills command fields when not custom", () => {
    const context = { stack: "Python" };
    applyStackDerivedDefaults(context, { customFields: new Set() });

    assert.strictEqual(
      context.installCommand,
      "pip install -r requirements.txt",
    );
    assert.strictEqual(context.devCommand, "python main.py");
    assert.strictEqual(context.testCommand, "pytest");
    assert.strictEqual(context.lintCommand, "ruff check .");
  });

  test("stack-defaults preserves customFields command entries", () => {
    const context = {
      stack: "Python",
      installCommand: "uv sync",
      testCommand: "pytest -x",
    };

    applyStackDerivedDefaults(context, {
      customFields: new Set(["installCommand", "testCommand"]),
    });

    assert.strictEqual(context.installCommand, "uv sync");
    assert.strictEqual(context.testCommand, "pytest -x");
    assert.strictEqual(context.devCommand, "python main.py");
    assert.strictEqual(context.lintCommand, "ruff check .");
  });

  test("stack-defaults overrideStructure re-derives projectStructure", () => {
    const context = {
      stack: "Go",
      projectStructure: "custom-layout",
    };

    applyStackDerivedDefaults(context, {
      customFields: new Set(["projectStructure"]),
      overrideStructure: true,
    });

    assert.ok(context.projectStructure.includes("main.go"));
    assert.notStrictEqual(context.projectStructure, "custom-layout");
  });
};

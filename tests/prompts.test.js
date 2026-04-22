const { applyStackDerivedDefaults } = require("../src/prompts");

module.exports = async function registerPromptsTests({ test, assert }) {
  test("applyStackDerivedDefaults fills in stack commands when nothing is custom", () => {
    const context = { stack: "Python" };
    applyStackDerivedDefaults(context);
    assert.strictEqual(context.installCommand, "pip install -r requirements.txt");
    assert.strictEqual(context.testCommand, "pytest");
    assert.ok(context.projectStructure.includes("main.py"));
  });

  test("applyStackDerivedDefaults preserves user-supplied commands across stack switch", () => {
    const context = {
      stack: "Python",
      installCommand: "uv sync",
      testCommand: "pytest -x",
    };
    const customFields = new Set(["installCommand", "testCommand"]);

    applyStackDerivedDefaults(context, { customFields });

    assert.strictEqual(context.installCommand, "uv sync");
    assert.strictEqual(context.testCommand, "pytest -x");
    assert.strictEqual(context.devCommand, "python main.py");
    assert.strictEqual(context.lintCommand, "ruff check .");
  });

  test("applyStackDerivedDefaults does not overwrite a command that matches another stack default", () => {
    const context = {
      stack: "Python",
      installCommand: "npm install",
    };
    const customFields = new Set(["installCommand"]);

    applyStackDerivedDefaults(context, { customFields });

    assert.strictEqual(context.installCommand, "npm install");
  });

  test("applyStackDerivedDefaults overwrites projectStructure unless it is custom", () => {
    const context = { stack: "Go", projectStructure: "old-structure" };
    applyStackDerivedDefaults(context);
    assert.ok(context.projectStructure.includes("main.go"));

    const kept = { stack: "Go", projectStructure: "custom-layout" };
    applyStackDerivedDefaults(kept, {
      customFields: new Set(["projectStructure"]),
    });
    assert.strictEqual(kept.projectStructure, "custom-layout");
  });
};

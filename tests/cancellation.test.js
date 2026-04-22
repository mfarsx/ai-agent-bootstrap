const path = require("path");
const { runNodeScript } = require("./helpers");

module.exports = async function registerCancellationTests({ test, assert }) {
  test("askQuestions throws CancelledError when prompt cancels", async () => {
    const promptsPath = require.resolve("prompts");
    const promptsModule = require.cache[promptsPath];
    const promptsStub = (questions, options = {}) => {
      if (options && typeof options.onCancel === "function") {
        options.onCancel();
      }
      return {};
    };

    require.cache[promptsPath] = {
      id: promptsPath,
      filename: promptsPath,
      loaded: true,
      exports: promptsStub,
    };

    const promptsFilePath = path.join(__dirname, "..", "src", "prompts.js");
    delete require.cache[require.resolve(promptsFilePath)];

    try {
      const { askQuestions } = require(promptsFilePath);
      await assert.rejects(
        () => askQuestions(process.cwd(), {}),
        (error) => error && error.code === "CANCELLED",
      );
    } finally {
      delete require.cache[require.resolve(promptsFilePath)];
      if (promptsModule) {
        require.cache[promptsPath] = promptsModule;
      } else {
        delete require.cache[promptsPath];
      }
    }
  });

  test("cli exits with code 0 on CancelledError", async () => {
    const script = `
      const path = require("path");
      const root = process.cwd();
      const initPath = path.join(root, "src", "commands", "init.js");
      const { CancelledError } = require(path.join(root, "src", "core", "cli-errors.js"));
      require.cache[require.resolve(initPath)] = {
        id: initPath,
        filename: initPath,
        loaded: true,
        exports: {
          initProject: async () => {
            throw new CancelledError();
          },
        },
      };
      process.argv = ["node", "cli", "init", "--yes"];
      require(path.join(root, "bin", "cli.js"));
    `;

    const result = await runNodeScript(script);
    assert.strictEqual(result.code, 0);
  });
};

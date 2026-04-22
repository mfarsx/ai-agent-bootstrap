const path = require("path");
const fs = require("../src/core/fs-helpers");
const { renderTemplateFile, _clearCache } = require("../src/core/template");
const { withTempDir } = require("./helpers");

module.exports = async function registerTemplateCacheTests({ test, assert }) {
  test("renderTemplateFile caches template reads while rendering with different data", async () => {
    await withTempDir(
      "ai-agent-bootstrap-template-cache-",
      async (targetDir) => {
        _clearCache();
        const templatePath = path.join(targetDir, "template.md");
        await fs.writeFile(templatePath, "Hello {{PROJECT_NAME}}", "utf-8");

        const originalReadFile = fs.readFile;
        let readCalls = 0;
        fs.readFile = async (...args) => {
          readCalls++;
          return originalReadFile(...args);
        };

        try {
          const first = await renderTemplateFile(templatePath, {
            projectName: "First",
          });
          const second = await renderTemplateFile(templatePath, {
            projectName: "Second",
          });

          assert.strictEqual(first, "Hello First");
          assert.strictEqual(second, "Hello Second");
          assert.strictEqual(readCalls, 1);
        } finally {
          fs.readFile = originalReadFile;
          _clearCache();
        }
      },
    );
  });

  test("template cache can be cleared between runs", async () => {
    await withTempDir(
      "ai-agent-bootstrap-template-cache-clear-",
      async (targetDir) => {
        _clearCache();
        const templatePath = path.join(targetDir, "template.md");
        await fs.writeFile(templatePath, "Hello {{PROJECT_NAME}}", "utf-8");

        const originalReadFile = fs.readFile;
        let readCalls = 0;
        fs.readFile = async (...args) => {
          readCalls++;
          return originalReadFile(...args);
        };

        try {
          await renderTemplateFile(templatePath, { projectName: "First" });
          _clearCache();
          await renderTemplateFile(templatePath, { projectName: "Second" });

          assert.strictEqual(readCalls, 2);
        } finally {
          fs.readFile = originalReadFile;
          _clearCache();
        }
      },
    );
  });
};

const path = require("path");
const fs = require("fs-extra");
const { checkStatus } = require("../src/status");
const { withTempDir, captureConsole } = require("./helpers");

module.exports = async function registerStatusTests({ test, assert }) {
  test("checkStatus reports all files missing in empty directory", async () => {
    await withTempDir("ai-bootstrap-status-empty-", async (targetDir) => {
      const output = await captureConsole(() =>
        checkStatus({ dir: targetDir }),
      );
      const text = output.logs.join("\n");

      assert.ok(text.includes("📊 0/11 files found."));
      assert.ok(text.includes("Run"));
      assert.ok(text.includes("ai-bootstrap init"));
      assert.ok(text.includes("create missing files"));
    });
  });

  test("checkStatus reports partial coverage correctly", async () => {
    await withTempDir("ai-bootstrap-status-partial-", async (targetDir) => {
      await fs.ensureDir(path.join(targetDir, "memory-bank"));
      await fs.writeFile(
        path.join(targetDir, "memory-bank", "projectbrief.md"),
        "ok",
        "utf-8",
      );
      await fs.writeFile(path.join(targetDir, ".clineignore"), "ok", "utf-8");

      const output = await captureConsole(() =>
        checkStatus({ dir: targetDir }),
      );
      const text = output.logs.join("\n");

      assert.ok(text.includes("📊 2/11 files found."));
      assert.ok(text.includes("memory-bank/projectbrief.md"));
      assert.ok(text.includes(".clineignore"));
    });
  });

  test("checkStatus reports success when all required files exist", async () => {
    await withTempDir("ai-bootstrap-status-full-", async (targetDir) => {
      const files = [
        "memory-bank/projectbrief.md",
        "memory-bank/productContext.md",
        "memory-bank/activeContext.md",
        "memory-bank/systemPatterns.md",
        "memory-bank/techContext.md",
        "memory-bank/progress.md",
        ".clinerules/00-memory-bank.md",
        ".clinerules/01-coding-standards.md",
        ".clinerules/02-workflow.md",
        ".clinerules/03-boundaries.md",
        ".clineignore",
      ];

      for (const relativeFile of files) {
        const fullPath = path.join(targetDir, relativeFile);
        await fs.ensureDir(path.dirname(fullPath));
        await fs.writeFile(fullPath, "ok", "utf-8");
      }

      const output = await captureConsole(() =>
        checkStatus({ dir: targetDir }),
      );
      const text = output.logs.join("\n");

      assert.ok(text.includes("📊 11/11 files found."));
      assert.ok(text.includes("All files in place!"));
    });
  });
};

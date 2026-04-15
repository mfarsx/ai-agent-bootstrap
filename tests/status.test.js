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

      assert.ok(text.includes("📊 0/19 files found."));
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

      assert.ok(text.includes("📊 2/19 files found."));
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
        ".clinerules/workflows/checkpoint.md",
        ".clinerules/workflows/cleanup.md",
        ".clinerules/workflows/commit.md",
        ".clinerules/workflows/plan.md",
        ".clinerules/workflows/review.md",
        ".clinerules/workflows/status.md",
        ".clinerules/workflows/stuck.md",
        ".clineignore",
        ".gitignore",
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

      assert.ok(text.includes("📊 19/19 files found."));
      assert.ok(text.includes("All files in place!"));
    });
  });

  test("checkStatus reports cursor provider file totals", async () => {
    await withTempDir("ai-bootstrap-status-cursor-", async (targetDir) => {
      await fs.ensureDir(path.join(targetDir, "memory-bank"));
      await fs.writeFile(
        path.join(targetDir, "memory-bank", "projectbrief.md"),
        "ok",
        "utf-8",
      );
      await fs.ensureDir(path.join(targetDir, ".cursor"));
      await fs.writeFile(
        path.join(targetDir, ".cursor", "index.mdc"),
        "ok",
        "utf-8",
      );

      const output = await captureConsole(() =>
        checkStatus({ dir: targetDir, provider: "cursor" }),
      );
      const text = output.logs.join("\n");

      assert.ok(text.includes("Provider: Cursor"));
      assert.ok(text.includes("📊 2/13 files found."));
      assert.ok(text.includes(".cursor/rules/00-memory-bank.mdc"));
    });
  });

  test("checkStatus reports claude-code provider file totals", async () => {
    await withTempDir("ai-bootstrap-status-claude-", async (targetDir) => {
      await fs.ensureDir(path.join(targetDir, "docs", "context"));
      await fs.writeFile(
        path.join(targetDir, "docs", "context", "projectbrief.md"),
        "ok",
        "utf-8",
      );

      const output = await captureConsole(() =>
        checkStatus({ dir: targetDir, provider: "claude-code" }),
      );
      const text = output.logs.join("\n");

      assert.ok(text.includes("Provider: Claude Code"));
      assert.ok(text.includes("📊 1/10 files found."));
      assert.ok(text.includes(".claude/commands/update-memory.md"));
    });
  });
};

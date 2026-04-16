const path = require("path");
const fs = require("fs-extra");
const { checkStatus } = require("../src/status");
const { getExpectedFiles } = require("../src/providers");
const { withTempDir, captureConsole } = require("./helpers");

module.exports = async function registerStatusTests({ test, assert }) {
  test("checkStatus reports all files missing in empty directory", async () => {
    await withTempDir("ai-bootstrap-status-empty-", async (targetDir) => {
      const total = getExpectedFiles("cline").length;
      const output = await captureConsole(() =>
        checkStatus({ dir: targetDir }),
      );
      const text = output.logs.join("\n");

      assert.ok(text.includes(`📊 0/${total} files found.`));
      assert.ok(text.includes("Run"));
      assert.ok(text.includes("ai-bootstrap init"));
      assert.ok(text.includes("create missing files"));
    });
  });

  test("checkStatus reports partial coverage correctly", async () => {
    await withTempDir("ai-bootstrap-status-partial-", async (targetDir) => {
      const total = getExpectedFiles("cline").length;
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

      assert.ok(text.includes(`📊 2/${total} files found.`));
      assert.ok(text.includes("memory-bank/projectbrief.md"));
      assert.ok(text.includes(".clineignore"));
    });
  });

  test("checkStatus reports success when all required files exist", async () => {
    await withTempDir("ai-bootstrap-status-full-", async (targetDir) => {
      const files = getExpectedFiles("cline");

      for (const relativeFile of files) {
        const fullPath = path.join(targetDir, relativeFile);
        await fs.ensureDir(path.dirname(fullPath));
        await fs.writeFile(fullPath, "ok", "utf-8");
      }

      const output = await captureConsole(() =>
        checkStatus({ dir: targetDir }),
      );
      const text = output.logs.join("\n");

      assert.ok(text.includes(`📊 ${files.length}/${files.length} files found.`));
      assert.ok(text.includes("All files in place!"));
    });
  });

  test("checkStatus reports cursor provider file totals", async () => {
    await withTempDir("ai-bootstrap-status-cursor-", async (targetDir) => {
      const total = getExpectedFiles("cursor").length;
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
      assert.ok(text.includes(`📊 2/${total} files found.`));
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

  test("checkStatus reports openclaw provider file totals", async () => {
    await withTempDir("ai-bootstrap-status-openclaw-", async (targetDir) => {
      await fs.ensureDir(path.join(targetDir, "memory-bank"));
      await fs.writeFile(
        path.join(targetDir, "memory-bank", "projectbrief.md"),
        "ok",
        "utf-8",
      );
      await fs.writeFile(path.join(targetDir, "AGENTS.md"), "ok", "utf-8");

      const output = await captureConsole(() =>
        checkStatus({ dir: targetDir, provider: "openclaw" }),
      );
      const text = output.logs.join("\n");

      assert.ok(text.includes("Provider: OpenClaw"));
      assert.ok(text.includes(".gitignore"));
      assert.ok(text.includes("memory-bank/projectbrief.md"));
    });
  });

  test("checkStatus reports windsurf provider file totals", async () => {
    await withTempDir("ai-bootstrap-status-windsurf-", async (targetDir) => {
      await fs.ensureDir(path.join(targetDir, "memory-bank"));
      await fs.writeFile(
        path.join(targetDir, "memory-bank", "projectbrief.md"),
        "ok",
        "utf-8",
      );
      await fs.ensureDir(path.join(targetDir, ".windsurf", "rules"));
      await fs.writeFile(
        path.join(targetDir, ".windsurf", "rules", "00-memory-bank.md"),
        "ok",
        "utf-8",
      );

      const output = await captureConsole(() =>
        checkStatus({ dir: targetDir, provider: "windsurf" }),
      );
      const text = output.logs.join("\n");

      assert.ok(text.includes("Provider: Windsurf"));
      assert.ok(text.includes(".windsurf/rules/00-memory-bank.md"));
      assert.ok(text.includes(".gitignore"));
    });
  });

  test("checkStatus returns structured report contract", async () => {
    await withTempDir("ai-bootstrap-status-contract-", async (targetDir) => {
      await fs.ensureDir(path.join(targetDir, "memory-bank"));
      await fs.writeFile(
        path.join(targetDir, "memory-bank", "projectbrief.md"),
        "ok",
        "utf-8",
      );

      const report = await checkStatus({ dir: targetDir, provider: "cursor" });
      const expectedFiles = getExpectedFiles("cursor");

      assert.strictEqual(typeof report.targetDir, "string");
      assert.strictEqual(report.provider.name, "cursor");
      assert.strictEqual(Array.isArray(report.entries), true);
      assert.strictEqual(report.expectedFiles.length, expectedFiles.length);
      assert.strictEqual(report.found + report.missing, report.expectedFiles.length);
      assert.strictEqual(report.entries.length, report.expectedFiles.length);
      assert.strictEqual(
        report.entries.every((entry) => typeof entry.target === "string"),
        true,
      );
      assert.strictEqual(
        report.entries.every((entry) => typeof entry.exists === "boolean"),
        true,
      );
    });
  });
};

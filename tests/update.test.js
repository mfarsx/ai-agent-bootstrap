const path = require("path");
const fs = require("../src/core/fs-helpers");
const { initProject } = require("../src/commands/init");
const { resetProject } = require("../src/commands/reset");
const { withTempDir, captureConsole, runCli } = require("./helpers");

module.exports = async function registerUpdateTests({ test, assert }) {
  test("resetProject dry-run prints diff when a file drifts", async () => {
    await withTempDir("ai-agent-bootstrap-reset-preview-", async (targetDir) => {
      await captureConsole(() =>
        initProject({ dir: targetDir, yes: true, provider: "cline" }),
      );

      const projectBrief = path.join(
        targetDir,
        "memory-bank",
        "projectbrief.md",
      );
      await fs.writeFile(projectBrief, "user drift", "utf-8");

      const { logs } = await captureConsole(() =>
        resetProject({
          dir: targetDir,
          yes: true,
          provider: "cline",
          dryRun: true,
        }),
      );
      const out = logs.join("\n");
      assert.ok(
        out.includes("memory-bank/projectbrief.md") || out.includes("+++"),
      );
    });
  });

  test("resetProject restores template output by default", async () => {
    await withTempDir("ai-agent-bootstrap-reset-write-", async (targetDir) => {
      await captureConsole(() =>
        initProject({ dir: targetDir, yes: true, provider: "cline" }),
      );

      const projectBrief = path.join(
        targetDir,
        "memory-bank",
        "projectbrief.md",
      );
      await fs.writeFile(projectBrief, "user drift", "utf-8");

      await captureConsole(() =>
        resetProject({ dir: targetDir, yes: true, provider: "cline" }),
      );

      const content = await fs.readFile(projectBrief, "utf-8");
      assert.strictEqual(content.includes("user drift"), false);
      assert.ok(content.includes("**Project:**"));
    });
  });

  test("cli reset without --yes fails when stdin is not a TTY", async () => {
    await withTempDir("ai-agent-bootstrap-reset-tty-", async (targetDir) => {
      await runCli(
        ["init", "--provider", "cline", "--yes", "--dir", targetDir],
        { cwd: targetDir },
      );

      const projectBrief = path.join(
        targetDir,
        "memory-bank",
        "projectbrief.md",
      );
      await fs.writeFile(projectBrief, "drift", "utf-8");

      const result = await runCli(
        ["reset", "--provider", "cline", "--dir", targetDir],
        { cwd: targetDir },
      );

      assert.strictEqual(result.code, 1);
      assert.ok(
        result.stderr.includes("reset error:") ||
          result.stderr.includes("Not a TTY") ||
          result.stderr.includes("--yes"),
      );
    });
  });
};

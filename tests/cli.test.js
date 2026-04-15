const path = require("path");
const fs = require("fs-extra");
const { withTempDir, runCli } = require("./helpers");

module.exports = async function registerCliTests({ test, assert }) {
  test("cli init succeeds with a valid provider", async () => {
    await withTempDir("ai-bootstrap-cli-init-", async (targetDir) => {
      const result = await runCli(
        ["init", "--provider", "cline", "--yes", "--dir", targetDir],
        { cwd: targetDir },
      );

      assert.strictEqual(result.code, 0);
      assert.ok(result.stdout.includes("Done!"));
      assert.strictEqual(
        await fs.pathExists(path.join(targetDir, "memory-bank", "projectbrief.md")),
        true,
      );
      const gitignoreContent = await fs.readFile(
        path.join(targetDir, ".gitignore"),
        "utf-8",
      );
      assert.ok(gitignoreContent.includes("memory-bank/projectbrief.md"));
      assert.ok(gitignoreContent.includes(".clineignore"));
    });
  });

  test("cli status succeeds with a valid provider", async () => {
    await withTempDir("ai-bootstrap-cli-status-", async (targetDir) => {
      await fs.ensureDir(path.join(targetDir, "memory-bank"));
      await fs.writeFile(
        path.join(targetDir, "memory-bank", "projectbrief.md"),
        "ok",
        "utf-8",
      );

      const result = await runCli(
        ["status", "--provider", "cursor", "--dir", targetDir],
        { cwd: targetDir },
      );

      assert.strictEqual(result.code, 0);
      assert.ok(result.stdout.includes("Provider: Cursor"));
    });
  });

  test("cli init exits with code 1 for unknown provider", async () => {
    await withTempDir("ai-bootstrap-cli-bad-init-", async (targetDir) => {
      const result = await runCli(
        ["init", "--provider", "nope", "--yes", "--dir", targetDir],
        { cwd: targetDir },
      );

      assert.strictEqual(result.code, 1);
      assert.ok(result.stderr.includes("Unknown provider"));
      assert.ok(result.stderr.includes("cline, cursor, openclaw, windsurf, claude-code"));
    });
  });

  test("cli status exits with code 1 for unknown provider", async () => {
    await withTempDir("ai-bootstrap-cli-bad-status-", async (targetDir) => {
      const result = await runCli(
        ["status", "--provider", "nope", "--dir", targetDir],
        { cwd: targetDir },
      );

      assert.strictEqual(result.code, 1);
      assert.ok(result.stderr.includes("Unknown provider"));
    });
  });

  test("cli provider input is case-insensitive", async () => {
    await withTempDir("ai-bootstrap-cli-case-", async (targetDir) => {
      const result = await runCli(
        ["init", "--provider", "CURSOR", "--yes", "--dir", targetDir],
        { cwd: targetDir },
      );

      assert.strictEqual(result.code, 0);
      assert.strictEqual(
        await fs.pathExists(path.join(targetDir, ".cursor", "index.mdc")),
        true,
      );
    });
  });

  test("cli exits non-zero for unknown command", async () => {
    const result = await runCli(["unknown-command"]);
    assert.notStrictEqual(result.code, 0);
    assert.ok(result.stderr.includes("unknown command"));
  });

  test("cli exits non-zero for unknown option", async () => {
    const result = await runCli(["init", "--bogus", "--yes"]);
    assert.notStrictEqual(result.code, 0);
    assert.ok(result.stderr.includes("unknown option"));
  });

  test("cli exits non-zero when provider option value is missing", async () => {
    const result = await runCli(["init", "--provider"]);
    assert.notStrictEqual(result.code, 0);
    assert.ok(result.stderr.includes("option '-p, --provider <name>' argument missing"));
  });
};

const path = require("path");
const fs = require("fs-extra");
const { initProject } = require("../src/init");
const { withTempDir, captureConsole } = require("./helpers");

const EXPECTED_FILES = [
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

const CURSOR_EXPECTED_FILES = [
  "memory-bank/projectbrief.md",
  "memory-bank/productContext.md",
  "memory-bank/activeContext.md",
  "memory-bank/systemPatterns.md",
  "memory-bank/techContext.md",
  "memory-bank/progress.md",
  "AGENTS.md",
  ".cursor/index.mdc",
  ".cursor/rules/00-memory-bank.mdc",
  ".cursor/rules/01-coding-standards.mdc",
  ".cursor/rules/02-workflow.mdc",
  ".cursor/rules/03-boundaries.mdc",
  ".gitignore",
];

module.exports = async function registerInitTests({ test, assert }) {
  test("initProject creates all baseline files in a fresh target", async () => {
    await withTempDir("ai-bootstrap-init-", async (targetDir) => {
      await captureConsole(() => initProject({ dir: targetDir, yes: true }));

      for (const relativeFile of EXPECTED_FILES) {
        const exists = await fs.pathExists(path.join(targetDir, relativeFile));
        assert.strictEqual(
          exists,
          true,
          `Expected file missing: ${relativeFile}`,
        );
      }
    });
  });

  test("initProject skips existing files and preserves user edits", async () => {
    await withTempDir("ai-bootstrap-retry-", async (targetDir) => {
      const customFile = path.join(targetDir, "memory-bank", "projectbrief.md");
      await fs.ensureDir(path.dirname(customFile));
      await fs.writeFile(customFile, "custom content", "utf-8");

      await captureConsole(() => initProject({ dir: targetDir, yes: true }));

      const content = await fs.readFile(customFile, "utf-8");
      assert.strictEqual(content, "custom content");
    });
  });

  test("initProject appends missing AI entries into existing .gitignore", async () => {
    await withTempDir("ai-bootstrap-gitignore-merge-", async (targetDir) => {
      const gitignorePath = path.join(targetDir, ".gitignore");
      await fs.writeFile(
        gitignorePath,
        "node_modules/\ncustom.log\nmemory-bank/projectbrief.md\n",
        "utf-8",
      );

      await captureConsole(() => initProject({ dir: targetDir, yes: true }));

      const content = await fs.readFile(gitignorePath, "utf-8");
      assert.ok(content.includes("custom.log"));
      assert.ok(content.includes(".clinerules/00-memory-bank.md"));

      const entries = content.split(/\r?\n/);
      const projectBriefEntries = entries.filter(
        (entry) => entry.trim() === "memory-bank/projectbrief.md",
      );
      assert.strictEqual(projectBriefEntries.length, 1);
    });
  });

  test("initProject keeps .gitignore entries idempotent across reruns", async () => {
    await withTempDir("ai-bootstrap-gitignore-idempotent-", async (targetDir) => {
      await captureConsole(() => initProject({ dir: targetDir, yes: true }));
      await captureConsole(() => initProject({ dir: targetDir, yes: true }));

      const content = await fs.readFile(path.join(targetDir, ".gitignore"), "utf-8");
      const entries = content.split(/\r?\n/);
      const ruleEntries = entries.filter(
        (entry) => entry.trim() === ".clinerules/00-memory-bank.md",
      );
      assert.strictEqual(ruleEntries.length, 1);
    });
  });

  test("initProject supports relative nested paths with spaces", async () => {
    await withTempDir("ai-bootstrap-path-", async (baseDir) => {
      const nestedTarget = path.join(baseDir, "my app", "deep project");
      const relativeDir = path.relative(process.cwd(), nestedTarget);

      await captureConsole(() => initProject({ dir: relativeDir, yes: true }));

      const projectBriefPath = path.join(
        nestedTarget,
        "memory-bank",
        "projectbrief.md",
      );
      const content = await fs.readFile(projectBriefPath, "utf-8");
      assert.ok(content.includes("**Project:** deep project"));
    });
  });

  test("initProject creates cursor provider files", async () => {
    await withTempDir("ai-bootstrap-cursor-", async (targetDir) => {
      await captureConsole(() =>
        initProject({ dir: targetDir, yes: true, provider: "cursor" }),
      );

      for (const relativeFile of CURSOR_EXPECTED_FILES) {
        const exists = await fs.pathExists(path.join(targetDir, relativeFile));
        assert.strictEqual(
          exists,
          true,
          `Expected cursor file missing: ${relativeFile}`,
        );
      }

      const gitignoreContent = await fs.readFile(
        path.join(targetDir, ".gitignore"),
        "utf-8",
      );
      assert.ok(gitignoreContent.includes(".cursor/index.mdc"));
      assert.ok(gitignoreContent.includes("AGENTS.md"));
    });
  });

  test("initProject creates claude-code provider files", async () => {
    await withTempDir("ai-bootstrap-claude-", async (targetDir) => {
      await captureConsole(() =>
        initProject({ dir: targetDir, yes: true, provider: "claude-code" }),
      );

      const expectedFiles = [
        "AGENTS.md",
        "CLAUDE.md",
        ".claude/commands/update-memory.md",
        "docs/context/projectbrief.md",
        "docs/context/productContext.md",
        "docs/context/activeContext.md",
        "docs/context/systemPatterns.md",
        "docs/context/techContext.md",
        "docs/context/progress.md",
        ".gitignore",
      ];

      for (const relativeFile of expectedFiles) {
        const exists = await fs.pathExists(path.join(targetDir, relativeFile));
        assert.strictEqual(
          exists,
          true,
          `Expected claude-code file missing: ${relativeFile}`,
        );
      }

      const gitignoreContent = await fs.readFile(
        path.join(targetDir, ".gitignore"),
        "utf-8",
      );
      assert.ok(gitignoreContent.includes("docs/context/projectbrief.md"));
      assert.ok(gitignoreContent.includes("CLAUDE.md"));
    });
  });

  test("initProject propagates permissions-related filesystem errors", async () => {
    const originalEnsureDir = fs.ensureDir;
    fs.ensureDir = async () => {
      const error = new Error("EACCES: permission denied");
      error.code = "EACCES";
      throw error;
    };

    try {
      await assert.rejects(
        () => initProject({ dir: ".", yes: true }),
        /EACCES: permission denied/,
      );
    } finally {
      fs.ensureDir = originalEnsureDir;
    }
  });

  test("initProject replaces command placeholders for providers with AGENTS.md", async () => {
    await withTempDir("ai-bootstrap-placeholder-", async (targetDir) => {
      await captureConsole(() =>
        initProject({ dir: targetDir, yes: true, provider: "cursor" }),
      );

      const agentsPath = path.join(targetDir, "AGENTS.md");
      const content = await fs.readFile(agentsPath, "utf-8");

      assert.strictEqual(/\{\{[A-Z_]+\}\}/.test(content), false);
      assert.ok(content.includes("npm install"));
      assert.ok(content.includes("npm run dev"));
      assert.ok(content.includes("npm test"));
    });
  });
};

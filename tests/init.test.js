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
  ".clineignore",
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
};

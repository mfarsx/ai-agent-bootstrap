const path = require("path");
const fs = require("../src/core/fs-helpers");
const { scaffoldProviderFiles } = require("../src/core/scaffold");
const { withTempDir } = require("./helpers");

function buildFakeProvider(fileCount) {
  const files = [];
  for (let index = 0; index < fileCount; index++) {
    files.push({
      source: `fake-${index}.md`,
      target: `nested/dir-${index % 10}/file-${index}.md`,
    });
  }

  return {
    name: "fake",
    templateDir: "fake",
    files,
  };
}

module.exports = async function registerScaffoldParallelTests({
  test,
  assert,
}) {
  test("scaffoldProviderFiles writes many files and preserves result order", async () => {
    await withTempDir(
      "ai-agent-bootstrap-scaffold-parallel-",
      async (targetDir) => {
        const provider = buildFakeProvider(50);
        const template = "# {{PROJECT_NAME}}\n";

        const originalReadFile = fs.readFile;
        fs.readFile = async (filePath, encoding) => {
          if (String(filePath).includes(`${path.sep}fake${path.sep}fake-`)) {
            return template;
          }
          return originalReadFile(filePath, encoding);
        };

        try {
          const start = Date.now();
          const result = await scaffoldProviderFiles(
            targetDir,
            provider,
            { projectName: "parallel-test" },
            { dryRun: false },
          );
          const elapsedMs = Date.now() - start;

          assert.ok(
            elapsedMs < 2000,
            `expected scaffold under 2000ms, got ${elapsedMs}`,
          );
          assert.strictEqual(result.created, 50);
          assert.strictEqual(result.fileResults.length, 50);
          assert.deepStrictEqual(
            result.fileResults.map((entry) => entry.target),
            provider.files.map((file) => file.target),
          );

          for (const file of provider.files) {
            const fullPath = path.join(targetDir, file.target);
            assert.strictEqual(await fs.pathExists(fullPath), true);
          }
        } finally {
          fs.readFile = originalReadFile;
        }
      },
    );
  });
};

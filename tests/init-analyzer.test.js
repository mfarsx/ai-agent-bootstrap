const path = require("path");
const fs = require("../src/core/fs-helpers");
const {
  analyzeTargetDir,
  analyzeProviderStates,
} = require("../src/core/init-analyzer");
const { getProvider } = require("../src/providers");
const { withTempDir } = require("./helpers");

async function writeProviderFiles(targetDir, providerName) {
  const provider = getProvider(providerName);

  for (const file of provider.files) {
    const fullPath = path.join(targetDir, file.target);
    await fs.ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, "ok", "utf-8");
  }

  const gitignorePath = path.join(targetDir, ".gitignore");
  await fs.writeFile(
    gitignorePath,
    `${provider.gitignoreEntries.join("\n")}\n`,
    "utf-8",
  );

  return provider;
}

module.exports = async function registerInitAnalyzerTests({ test, assert }) {
  test("analyzeTargetDir returns fresh for empty directory", async () => {
    await withTempDir(
      "ai-agent-bootstrap-analyzer-fresh-",
      async (targetDir) => {
        const analysis = await analyzeTargetDir(targetDir);

        assert.strictEqual(analysis.status, "fresh");
        assert.strictEqual(analysis.provider, null);
        assert.deepStrictEqual(analysis.candidates, []);
      },
    );
  });

  test("analyzeTargetDir returns full for fully initialized provider", async () => {
    await withTempDir(
      "ai-agent-bootstrap-analyzer-full-",
      async (targetDir) => {
        const provider = await writeProviderFiles(targetDir, "cline");
        const analysis = await analyzeTargetDir(targetDir, {
          providerHint: "cline",
        });

        assert.strictEqual(analysis.status, "full");
        assert.strictEqual(analysis.provider.name, "cline");
        assert.strictEqual(analysis.presentCount, provider.files.length);
        assert.strictEqual(analysis.missingFiles.length, 0);
        assert.strictEqual(analysis.gitignore.added, 0);
      },
    );
  });

  test("analyzeTargetDir returns partial for partially initialized windsurf directory", async () => {
    await withTempDir(
      "ai-agent-bootstrap-analyzer-partial-",
      async (targetDir) => {
        const provider = getProvider("windsurf");
        for (const file of provider.files.slice(0, provider.files.length - 3)) {
          const fullPath = path.join(targetDir, file.target);
          await fs.ensureDir(path.dirname(fullPath));
          await fs.writeFile(fullPath, "ok", "utf-8");
        }

        await fs.writeFile(
          path.join(targetDir, ".gitignore"),
          `${provider.gitignoreEntries.join("\n")}\n`,
          "utf-8",
        );

        const analysis = await analyzeTargetDir(targetDir, {
          providerHint: "windsurf",
        });

        assert.strictEqual(analysis.status, "partial");
        assert.strictEqual(analysis.provider.name, "windsurf");
        assert.strictEqual(analysis.missingFiles.length, 3);
      },
    );
  });

  test("analyzeTargetDir returns ambiguous when multiple provider footprints exist", async () => {
    await withTempDir(
      "ai-agent-bootstrap-analyzer-ambiguous-",
      async (targetDir) => {
        await fs.ensureDir(path.join(targetDir, ".clinerules"));
        await fs.writeFile(
          path.join(targetDir, ".clinerules", "00-memory-bank.md"),
          "ok",
          "utf-8",
        );
        await fs.ensureDir(path.join(targetDir, ".cursor"));
        await fs.writeFile(
          path.join(targetDir, ".cursor", "index.mdc"),
          "ok",
          "utf-8",
        );

        const analysis = await analyzeTargetDir(targetDir);
        assert.strictEqual(analysis.status, "ambiguous");
        assert.ok(analysis.candidates.includes("cline"));
        assert.ok(analysis.candidates.includes("cursor"));
      },
    );
  });

  test("analyzeTargetDir providerHint bypasses auto-detection", async () => {
    await withTempDir(
      "ai-agent-bootstrap-analyzer-hint-",
      async (targetDir) => {
        await fs.ensureDir(path.join(targetDir, ".clinerules"));
        await fs.writeFile(
          path.join(targetDir, ".clinerules", "00-memory-bank.md"),
          "ok",
          "utf-8",
        );

        const analysis = await analyzeTargetDir(targetDir, {
          providerHint: "cursor",
        });

        assert.strictEqual(analysis.provider.name, "cursor");
        assert.strictEqual(analysis.status, "fresh");
      },
    );
  });

  test("analyzeTargetDir treats gitignore drift as partial", async () => {
    await withTempDir(
      "ai-agent-bootstrap-analyzer-gitignore-",
      async (targetDir) => {
        const provider = getProvider("cline");

        for (const file of provider.files) {
          const fullPath = path.join(targetDir, file.target);
          await fs.ensureDir(path.dirname(fullPath));
          await fs.writeFile(fullPath, "ok", "utf-8");
        }

        await fs.writeFile(
          path.join(targetDir, ".gitignore"),
          "node_modules/\n",
          "utf-8",
        );

        const analysis = await analyzeTargetDir(targetDir, {
          providerHint: "cline",
        });

        assert.strictEqual(analysis.status, "partial");
        assert.ok(analysis.gitignore.added > 0);
      },
    );
  });

  test("analyzeProviderStates lists installed providers and per-provider states", async () => {
    await withTempDir(
      "ai-agent-bootstrap-analyzer-states-",
      async (targetDir) => {
        await fs.ensureDir(path.join(targetDir, ".cursor", "rules"));
        await fs.writeFile(
          path.join(targetDir, ".cursor", "index.mdc"),
          "ok",
          "utf-8",
        );
        await fs.writeFile(
          path.join(targetDir, ".cursor", "rules", "00-memory-bank.mdc"),
          "ok",
          "utf-8",
        );

        const report = await analyzeProviderStates(targetDir);
        assert.ok(report.installedProviderNames.includes("cursor"));
        assert.strictEqual(report.states.cursor.provider.name, "cursor");
        assert.strictEqual(typeof report.states.windsurf.status, "string");
      },
    );
  });

  test("analyzeTargetDir uses prebuiltStates for detection without extra pathExists calls", async () => {
    await withTempDir(
      "ai-agent-bootstrap-analyzer-prebuilt-detect-",
      async (targetDir) => {
        const report = await analyzeProviderStates(targetDir);
        const providerState = report.states.cursor;
        const requiredTargets = [
          ".cursor/index.mdc",
          ".cursor/rules/00-memory-bank.mdc",
        ];

        for (const target of requiredTargets) {
          if (!providerState.presentFiles.includes(target)) {
            providerState.presentFiles.push(target);
          }
        }

        const originalPathExists = fs.pathExists;
        let pathExistsCalls = 0;
        fs.pathExists = async (...args) => {
          pathExistsCalls++;
          return originalPathExists(...args);
        };

        try {
          const analysis = await analyzeTargetDir(targetDir, {
            prebuiltStates: report.states,
          });

          assert.strictEqual(analysis.provider.name, "cursor");
          assert.strictEqual(pathExistsCalls, 0);
        } finally {
          fs.pathExists = originalPathExists;
        }
      },
    );
  });
};

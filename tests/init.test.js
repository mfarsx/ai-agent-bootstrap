const path = require("path");
const nodeFs = require("fs");
const fs = require("../src/core/fs-helpers");
const { initProject } = require("../src/init");
const { collectInitData } = require("../src/commands/init");
const { withTempDir, captureConsole } = require("./helpers");

const EXPECTED_FILES = [
  "memory-bank/projectbrief.md",
  "memory-bank/productContext.md",
  "memory-bank/activeContext.md",
  "memory-bank/systemPatterns.md",
  "memory-bank/techContext.md",
  "memory-bank/progress.md",
  "AGENTS.md",
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
  ".cursorignore",
  ".gitignore",
];

const OPENCLAW_SENTINEL_FILES = [
  "memory-bank/projectbrief.md",
  "AGENTS.md",
  "IDENTITY.md",
  "SOUL.md",
  "USER.md",
  ".gitignore",
];

const WINDSURF_SENTINEL_FILES = [
  "memory-bank/projectbrief.md",
  "AGENTS.md",
  ".windsurf/rules/00-memory-bank.md",
  ".windsurf/rules/03-boundaries.md",
  ".windsurf/workflows/plan.md",
  ".windsurf/workflows/commit.md",
  ".windsurf/workflows/init-memory.md",
  ".windsurf/workflows/update-memory.md",
  ".windsurfignore",
  ".gitignore",
];

module.exports = async function registerInitTests({ test, assert }) {
  test("initProject dryRun does not create files", async () => {
    await withTempDir("ai-bootstrap-dry-run-", async (targetDir) => {
      await captureConsole(() =>
        initProject({ dir: targetDir, yes: true, dryRun: true }),
      );

      assert.strictEqual(
        await fs.pathExists(
          path.join(targetDir, "memory-bank", "projectbrief.md"),
        ),
        false,
      );
    });
  });

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
    await withTempDir(
      "ai-bootstrap-gitignore-idempotent-",
      async (targetDir) => {
        await captureConsole(() => initProject({ dir: targetDir, yes: true }));
        await captureConsole(() => initProject({ dir: targetDir, yes: true }));

        const content = await fs.readFile(
          path.join(targetDir, ".gitignore"),
          "utf-8",
        );
        const entries = content.split(/\r?\n/);
        const ruleEntries = entries.filter(
          (entry) => entry.trim() === "/.clinerules/00-memory-bank.md",
        );
        assert.strictEqual(ruleEntries.length, 1);
      },
    );
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
        ".claude/commands/init-memory.md",
        ".claude/commands/update-memory.md",
        ".claude/commands/plan.md",
        ".claude/commands/commit.md",
        ".claude/commands/review.md",
        ".claude/commands/checkpoint.md",
        ".claude/commands/cleanup.md",
        ".claude/commands/status.md",
        ".claude/commands/stuck.md",
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

      const agentsContent = await fs.readFile(
        path.join(targetDir, "AGENTS.md"),
        "utf-8",
      );
      assert.ok(
        agentsContent.includes("docs/context/"),
        "claude-code AGENTS.md should reference docs/context/",
      );
      assert.strictEqual(
        /persistent context in `memory-bank\/`/.test(agentsContent),
        false,
        "claude-code AGENTS.md must not reference memory-bank/",
      );
    });
  });

  test("initProject ignore files include shared baseline entries", async () => {
    await withTempDir("ai-bootstrap-ignore-baseline-", async (targetDir) => {
      await captureConsole(() =>
        initProject({ dir: targetDir, yes: true, provider: "cline" }),
      );
      const cline = await fs.readFile(
        path.join(targetDir, ".clineignore"),
        "utf-8",
      );
      assert.ok(cline.includes(".venv/"), ".clineignore should include .venv/");
      assert.ok(cline.includes("__pycache__/"));
      assert.ok(cline.includes(".DS_Store"));
    });

    await withTempDir("ai-bootstrap-cursor-ignore-", async (targetDir) => {
      await captureConsole(() =>
        initProject({ dir: targetDir, yes: true, provider: "cursor" }),
      );
      const cursorIgnore = await fs.readFile(
        path.join(targetDir, ".cursorignore"),
        "utf-8",
      );
      assert.ok(cursorIgnore.includes("node_modules/"));
      assert.ok(cursorIgnore.includes(".env"));
    });

    await withTempDir("ai-bootstrap-windsurf-ignore-", async (targetDir) => {
      await captureConsole(() =>
        initProject({ dir: targetDir, yes: true, provider: "windsurf" }),
      );
      const windsurfIgnore = await fs.readFile(
        path.join(targetDir, ".windsurfignore"),
        "utf-8",
      );
      assert.ok(windsurfIgnore.includes("dist/"));
      assert.ok(windsurfIgnore.includes("target/"));
    });
  });

  test("initProject creates openclaw provider files", async () => {
    await withTempDir("ai-bootstrap-openclaw-", async (targetDir) => {
      await captureConsole(() =>
        initProject({ dir: targetDir, yes: true, provider: "openclaw" }),
      );

      for (const relativeFile of OPENCLAW_SENTINEL_FILES) {
        const exists = await fs.pathExists(path.join(targetDir, relativeFile));
        assert.strictEqual(
          exists,
          true,
          `Expected openclaw file missing: ${relativeFile}`,
        );
      }
    });
  });

  test("initProject creates windsurf provider files", async () => {
    await withTempDir("ai-bootstrap-windsurf-", async (targetDir) => {
      await captureConsole(() =>
        initProject({ dir: targetDir, yes: true, provider: "windsurf" }),
      );

      for (const relativeFile of WINDSURF_SENTINEL_FILES) {
        const exists = await fs.pathExists(path.join(targetDir, relativeFile));
        assert.strictEqual(
          exists,
          true,
          `Expected windsurf file missing: ${relativeFile}`,
        );
      }
    });
  });

  test("initProject propagates permissions-related filesystem errors", async () => {
    await withTempDir("ai-bootstrap-eacces-", async (targetDir) => {
      const originalEnsureDir = fs.ensureDir;
      fs.ensureDir = async () => {
        const error = new Error("EACCES: permission denied");
        error.code = "EACCES";
        throw error;
      };

      try {
        await assert.rejects(
          () => initProject({ dir: targetDir, yes: true }),
          /EACCES: permission denied/,
        );
      } finally {
        fs.ensureDir = originalEnsureDir;
      }
    });
  });

  test("initProject fails fast when ready provider template sources are invalid", async () => {
    await withTempDir("ai-bootstrap-invalid-template-", async (targetDir) => {
      const originalExistsSync = nodeFs.existsSync;
      const originalWriteFile = fs.writeFile;
      let writeCalled = false;

      nodeFs.existsSync = (filePath) => {
        if (
          String(filePath).includes(
            path.join("templates", "shared", "memory-bank", "projectbrief.md"),
          )
        ) {
          return false;
        }
        return originalExistsSync(filePath);
      };

      fs.writeFile = async (...args) => {
        writeCalled = true;
        return originalWriteFile(...args);
      };

      try {
        await assert.rejects(
          () =>
            captureConsole(() =>
              initProject({ dir: targetDir, yes: true, provider: "cline" }),
            ),
          /Manifest validation failed[\s\S]*missing template source/,
        );
        assert.strictEqual(writeCalled, false);
      } finally {
        nodeFs.existsSync = originalExistsSync;
        fs.writeFile = originalWriteFile;
      }
    });
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

  test("initProject prints provider-specific memory-bank prompt in next steps", async () => {
    await withTempDir("ai-bootstrap-next-steps-prompt-", async (targetDir) => {
      const output = await captureConsole(() =>
        initProject({ dir: targetDir, yes: true, provider: "cursor" }),
      );

      const text = output.logs.join("\n");
      assert.ok(
        text.includes("/init-memory") && text.includes("in Cursor chat"),
        "fresh cursor init should suggest /init-memory in Cursor chat",
      );
    });
  });

  test("initProject prints init-memory hint for windsurf and claude-code", async () => {
    await withTempDir(
      "ai-bootstrap-next-steps-windsurf-",
      async (targetDir) => {
        const output = await captureConsole(() =>
          initProject({ dir: targetDir, yes: true, provider: "windsurf" }),
        );
        const text = output.logs.join("\n");
        assert.ok(
          text.includes("/init-memory") && text.includes("in Windsurf chat"),
          "windsurf init should suggest /init-memory in Windsurf chat",
        );
      },
    );

    await withTempDir("ai-bootstrap-next-steps-claude-", async (targetDir) => {
      const output = await captureConsole(() =>
        initProject({ dir: targetDir, yes: true, provider: "claude-code" }),
      );
      const text = output.logs.join("\n");
      assert.ok(
        text.includes("/init-memory") && text.includes("in Claude Code"),
        "claude-code init should suggest /init-memory in Claude Code",
      );
    });
  });

  test("collectInitData applies context/template variable precedence seams", async () => {
    await withTempDir("ai-bootstrap-context-seam-", async (targetDir) => {
      const { provider, answers } = await collectInitData(targetDir, {
        yes: true,
        provider: "cline",
        configContext: { stack: "TypeScript" },
        contextOverrides: { provider: "cursor" },
        configVariables: { owner_name: "config-team" },
        templateVariables: { OWNER_NAME: "cli-team" },
      });

      assert.strictEqual(provider.name, "cursor");
      assert.strictEqual(answers.stack, "TypeScript");
      assert.deepStrictEqual(answers.templateVariables, {
        OWNER_NAME: "cli-team",
      });
    });
  });

  test("collectInitData accepts KEY=VALUE template variables array", async () => {
    await withTempDir("ai-bootstrap-context-array-", async (targetDir) => {
      const { answers } = await collectInitData(targetDir, {
        yes: true,
        provider: "cline",
        templateVariables: [
          "owner_name=cli-team",
          "build_command=npm run build",
        ],
      });

      assert.deepStrictEqual(answers.templateVariables, {
        OWNER_NAME: "cli-team",
        BUILD_COMMAND: "npm run build",
      });
    });
  });

  test("collectInitData ignores invalid KEY=VALUE template variable forms", async () => {
    await withTempDir(
      "ai-bootstrap-context-invalid-vars-",
      async (targetDir) => {
        const { answers } = await collectInitData(targetDir, {
          yes: true,
          provider: "cline",
          templateVariables: ["NO_SEPARATOR", "=empty", "valid_key=value"],
        });

        assert.deepStrictEqual(answers.templateVariables, {
          VALID_KEY: "value",
        });
      },
    );
  });

  test("collectInitData uses last-write-wins for duplicate template variable keys", async () => {
    await withTempDir(
      "ai-bootstrap-context-duplicate-vars-",
      async (targetDir) => {
        const { answers } = await collectInitData(targetDir, {
          yes: true,
          provider: "cline",
          templateVariables: [
            "owner_name=first",
            "OWNER_NAME=second",
            "owner name=third",
          ],
        });

        assert.deepStrictEqual(answers.templateVariables, {
          OWNER_NAME: "third",
        });
      },
    );
  });

  test("collectInitData derives non-Node project structure for Python stack", async () => {
    await withTempDir("ai-bootstrap-stack-python-", async (targetDir) => {
      const { answers } = await collectInitData(targetDir, {
        yes: true,
        provider: "cline",
        configContext: { stack: "Python" },
      });

      assert.strictEqual(answers.stack, "Python");
      assert.ok(
        answers.projectStructure.includes("main.py"),
        "Python stack should produce a Python-flavored project structure default",
      );
      assert.strictEqual(
        answers.projectStructure.includes("index.js"),
        false,
        "Python stack must not keep Node.js default structure",
      );
      assert.strictEqual(
        answers.installCommand,
        "pip install -r requirements.txt",
      );
      assert.strictEqual(answers.testCommand, "pytest");
    });
  });

  test("collectInitData auto-loads bootstrap.config.json from target directory", async () => {
    await withTempDir("ai-bootstrap-config-autoload-", async (targetDir) => {
      await fs.writeFile(
        path.join(targetDir, "bootstrap.config.json"),
        JSON.stringify({
          context: {
            provider: "cursor",
          },
        }),
        "utf-8",
      );

      const { provider } = await collectInitData(targetDir, {
        yes: true,
        provider: "cline",
      });

      assert.strictEqual(provider.name, "cursor");
    });
  });

  test("collectInitData loads config context and variables with --var precedence", async () => {
    await withTempDir("ai-bootstrap-context-config-", async (targetDir) => {
      const configPath = path.join(targetDir, "bootstrap.config.json");
      await fs.writeFile(
        configPath,
        JSON.stringify(
          {
            context: {
              provider: "windsurf",
              stack: "TypeScript",
            },
            templateVariables: {
              OWNER_NAME: "config-team",
            },
          },
          null,
          2,
        ),
        "utf-8",
      );

      const { provider, answers } = await collectInitData(targetDir, {
        yes: true,
        provider: "cline",
        config: configPath,
        templateVariables: ["owner_name=cli-team"],
      });

      assert.strictEqual(provider.name, "windsurf");
      assert.strictEqual(answers.stack, "TypeScript");
      assert.deepStrictEqual(answers.templateVariables, {
        OWNER_NAME: "cli-team",
      });
    });
  });
};

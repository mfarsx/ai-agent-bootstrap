const path = require("path");
const fs = require("../src/core/fs-helpers");
const { withTempDir, runCli, runNodeScript } = require("./helpers");

module.exports = async function registerCliTests({ test, assert }) {
  test("cli init succeeds with a valid provider", async () => {
    await withTempDir("ai-agent-bootstrap-cli-init-", async (targetDir) => {
      const result = await runCli(
        ["init", "--provider", "cline", "--yes", "--dir", targetDir],
        { cwd: targetDir },
      );

      assert.strictEqual(result.code, 0);
      assert.ok(result.stdout.includes("Done!"));
      assert.strictEqual(
        await fs.pathExists(
          path.join(targetDir, "memory-bank", "projectbrief.md"),
        ),
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
    await withTempDir("ai-agent-bootstrap-cli-status-", async (targetDir) => {
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
    await withTempDir("ai-agent-bootstrap-cli-bad-init-", async (targetDir) => {
      const result = await runCli(
        ["init", "--provider", "nope", "--yes", "--dir", targetDir],
        { cwd: targetDir },
      );

      assert.strictEqual(result.code, 1);
      assert.ok(result.stderr.includes("unknown provider:"));
      assert.ok(result.stderr.includes("Unknown provider"));
      assert.ok(
        result.stderr.includes(
          "cline, cursor, openclaw, windsurf, claude-code",
        ),
      );
    });
  });

  test("cli status exits with code 1 for unknown provider", async () => {
    await withTempDir(
      "ai-agent-bootstrap-cli-bad-status-",
      async (targetDir) => {
        const result = await runCli(
          ["status", "--provider", "nope", "--dir", targetDir],
          { cwd: targetDir },
        );

        assert.strictEqual(result.code, 1);
        assert.ok(result.stderr.includes("unknown provider:"));
        assert.ok(result.stderr.includes("Unknown provider"));
      },
    );
  });

  test("cli provider input is case-insensitive", async () => {
    await withTempDir("ai-agent-bootstrap-cli-case-", async (targetDir) => {
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
    assert.ok(
      result.stderr.includes("option '-p, --provider <name>' argument missing"),
    );
  });

  test("cli exits non-zero for empty target dir option", async () => {
    const result = await runCli(["init", "--yes", "--dir", ""]);
    assert.strictEqual(result.code, 1);
    assert.ok(result.stderr.includes("invalid target dir:"));
    assert.ok(result.stderr.includes("Invalid target dir"));
  });

  test("cli init rejects removed --var option", async () => {
    await withTempDir("ai-agent-bootstrap-cli-vars-", async (targetDir) => {
      const result = await runCli(
        [
          "init",
          "--provider",
          "cline",
          "--yes",
          "--dir",
          targetDir,
          "--var",
          "owner_name=platform",
        ],
        { cwd: targetDir },
      );

      assert.notStrictEqual(result.code, 0);
      assert.ok(result.stderr.includes("unknown option '--var'"));
    });
  });

  test("cli init --dry-run does not write files", async () => {
    await withTempDir("ai-agent-bootstrap-cli-dry-run-", async (targetDir) => {
      const result = await runCli(
        [
          "init",
          "--provider",
          "cline",
          "--yes",
          "--dry-run",
          "--dir",
          targetDir,
        ],
        { cwd: targetDir },
      );

      assert.strictEqual(result.code, 0);
      assert.ok(result.stdout.includes("Dry run"));
      assert.ok(
        result.stdout.includes("would be created") ||
          result.stdout.includes("would create"),
      );

      assert.strictEqual(
        await fs.pathExists(path.join(targetDir, "memory-bank")),
        false,
      );
    });
  });

  test("cli init without provider shows modify/install suggestions for installed providers", async () => {
    await withTempDir(
      "ai-agent-bootstrap-cli-init-full-",
      async (targetDir) => {
        await runCli(
          ["init", "--provider", "cline", "--yes", "--dir", targetDir],
          {
            cwd: targetDir,
          },
        );

        const rerun = await runCli(["init", "--yes", "--dir", targetDir], {
          cwd: targetDir,
        });

        assert.strictEqual(rerun.code, 0);
        assert.ok(rerun.stdout.includes("Detected installed providers"));
        assert.ok(rerun.stdout.includes("modify Cline setup"));
        assert.ok(rerun.stdout.includes("install Windsurf setup"));
      },
    );
  });

  test("cli init exits early for fully initialized directory when provider is explicit", async () => {
    await withTempDir(
      "ai-agent-bootstrap-cli-init-full-explicit-",
      async (targetDir) => {
        await runCli(
          ["init", "--provider", "cline", "--yes", "--dir", targetDir],
          {
            cwd: targetDir,
          },
        );

        const rerun = await runCli(
          ["init", "--provider", "cline", "--yes", "--dir", targetDir],
          {
            cwd: targetDir,
          },
        );

        assert.strictEqual(rerun.code, 0);
        assert.ok(rerun.stdout.includes("already initialized for Cline"));
        assert.ok(rerun.stdout.includes("ai-agent-bootstrap status"));
        assert.ok(rerun.stdout.includes("ai-agent-bootstrap init --force"));
      },
    );
  });

  test("cli init --force overrides early exit behavior", async () => {
    await withTempDir(
      "ai-agent-bootstrap-cli-init-force-",
      async (targetDir) => {
        await runCli(
          ["init", "--provider", "cline", "--yes", "--dir", targetDir],
          {
            cwd: targetDir,
          },
        );

        const rerun = await runCli(
          ["init", "--yes", "--force", "--dir", targetDir],
          {
            cwd: targetDir,
          },
        );

        assert.strictEqual(rerun.code, 0);
        assert.ok(rerun.stdout.includes("Done! 0 files created"));
      },
    );
  });

  test("cli init --verbose shows per-file skip output", async () => {
    await withTempDir(
      "ai-agent-bootstrap-cli-init-verbose-",
      async (targetDir) => {
        await runCli(
          ["init", "--provider", "cline", "--yes", "--dir", targetDir],
          {
            cwd: targetDir,
          },
        );

        const rerun = await runCli(
          ["init", "--yes", "--force", "--verbose", "--dir", targetDir],
          { cwd: targetDir },
        );

        assert.strictEqual(rerun.code, 0);
        assert.ok(
          rerun.stdout.includes("memory-bank/projectbrief.md (already exists)"),
        );
        assert.strictEqual(rerun.stdout.includes("files unchanged"), false);
      },
    );
  });

  test("cli init suggests provider actions in non-interactive mode for mixed provider footprints", async () => {
    await withTempDir(
      "ai-agent-bootstrap-cli-init-ambiguous-",
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

        const result = await runCli(["init", "--yes", "--dir", targetDir], {
          cwd: targetDir,
        });

        assert.strictEqual(result.code, 0);
        assert.ok(result.stdout.includes("Detected installed providers"));
        assert.ok(result.stdout.includes("modify Cline setup"));
        assert.ok(result.stdout.includes("modify Cursor setup"));
      },
    );
  });

  test("cli init auto-discovers bootstrap.config.json in target dir without --config", async () => {
    await withTempDir(
      "ai-agent-bootstrap-cli-config-autodetect-",
      async (targetDir) => {
        await fs.writeFile(
          path.join(targetDir, "bootstrap.config.json"),
          JSON.stringify(
            {
              context: {
                provider: "cursor",
              },
            },
            null,
            2,
          ),
          "utf-8",
        );

        const result = await runCli(
          ["init", "--provider", "cline", "--yes", "--dir", targetDir],
          { cwd: targetDir },
        );

        assert.strictEqual(result.code, 0);
        assert.strictEqual(
          await fs.pathExists(path.join(targetDir, ".cursor", "index.mdc")),
          true,
        );
      },
    );
  });

  test("cli init accepts --config and applies provider context", async () => {
    await withTempDir("ai-agent-bootstrap-cli-config-", async (targetDir) => {
      const configPath = path.join(targetDir, "bootstrap.config.json");
      await fs.writeFile(
        configPath,
        JSON.stringify(
          {
            context: {
              provider: "cursor",
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

      const result = await runCli(
        [
          "init",
          "--provider",
          "cline",
          "--yes",
          "--dir",
          targetDir,
          "--config",
          configPath,
        ],
        { cwd: targetDir },
      );

      assert.strictEqual(result.code, 0);
      assert.strictEqual(
        await fs.pathExists(path.join(targetDir, ".cursor", "index.mdc")),
        true,
      );
    });
  });

  test("cli formats provider-not-ready errors with category prefix", async () => {
    const script = `
      const path = require("path");
      const root = process.cwd();
      const statusPath = path.join(root, "src", "commands", "status.js");
      require.cache[require.resolve(statusPath)] = {
        id: statusPath,
        filename: statusPath,
        loaded: true,
        exports: {
          checkStatus: () => {
            const error = new Error(
              "Cursor templates are not ready yet. Use one of: cline",
            );
            error.code = "PROVIDER_NOT_READY";
            throw error;
          },
        },
      };
      process.argv = ["node", "cli", "status", "--provider", "cursor"];
      require(path.join(root, "bin", "cli.js"));
    `;

    const result = await runNodeScript(script);
    assert.strictEqual(result.code, 1);
    assert.ok(result.stderr.includes("provider not ready:"));
    assert.ok(result.stderr.includes("templates are not ready"));
  });

  test("cli formats missing-template-file errors with category prefix", async () => {
    const script = `
      const path = require("path");
      const root = process.cwd();
      const initPath = path.join(root, "src", "commands", "init.js");
      require.cache[require.resolve(initPath)] = {
        id: initPath,
        filename: initPath,
        loaded: true,
        exports: {
          initProject: async () => {
            const error = new Error(
              "Manifest validation failed:\\n- Provider \\"cline\\" is missing template source \\"cline/memory-bank/projectbrief.md\\".",
            );
            error.code = "MISSING_TEMPLATE_SOURCE";
            throw error;
          },
        },
      };
      process.argv = ["node", "cli", "init", "--yes"];
      require(path.join(root, "bin", "cli.js"));
    `;

    const result = await runNodeScript(script);
    assert.strictEqual(result.code, 1);
    assert.ok(result.stderr.includes("missing template file:"));
    assert.ok(result.stderr.includes("missing template source"));
  });

  test("cli formats permission-denied errors with category prefix", async () => {
    const script = `
      const path = require("path");
      const root = process.cwd();
      const initPath = path.join(root, "src", "commands", "init.js");
      require.cache[require.resolve(initPath)] = {
        id: initPath,
        filename: initPath,
        loaded: true,
        exports: {
          initProject: async () => {
            const error = new Error("EACCES: permission denied");
            error.code = "EACCES";
            throw error;
          },
        },
      };
      process.argv = ["node", "cli", "init", "--yes"];
      require(path.join(root, "bin", "cli.js"));
    `;

    const result = await runNodeScript(script);
    assert.strictEqual(result.code, 1);
    assert.ok(result.stderr.includes("permission denied:"));
    assert.ok(result.stderr.includes("EACCES: permission denied"));
  });

  test("cli init fails for missing --config file", async () => {
    await withTempDir(
      "ai-agent-bootstrap-cli-config-missing-",
      async (targetDir) => {
        const missingPath = path.join(targetDir, "missing-config.json");
        const result = await runCli(
          ["init", "--yes", "--dir", targetDir, "--config", missingPath],
          { cwd: targetDir },
        );

        assert.strictEqual(result.code, 1);
        assert.ok(result.stderr.includes("config error:"));
        assert.ok(result.stderr.includes("Config file not found"));
      },
    );
  });

  test("cli init fails for invalid --config JSON", async () => {
    await withTempDir(
      "ai-agent-bootstrap-cli-config-invalid-json-",
      async (targetDir) => {
        const configPath = path.join(targetDir, "bootstrap.config.json");
        await fs.writeFile(configPath, "{ not-valid-json", "utf-8");

        const result = await runCli(
          ["init", "--yes", "--dir", targetDir, "--config", configPath],
          { cwd: targetDir },
        );

        assert.strictEqual(result.code, 1);
        assert.ok(result.stderr.includes("config error:"));
        assert.ok(result.stderr.includes("Invalid config file JSON"));
      },
    );
  });

  test("cli init fails for invalid --config context type", async () => {
    await withTempDir(
      "ai-agent-bootstrap-cli-config-invalid-shape-",
      async (targetDir) => {
        const configPath = path.join(targetDir, "bootstrap.config.json");
        await fs.writeFile(
          configPath,
          JSON.stringify({ context: "not-an-object" }),
          "utf-8",
        );

        const result = await runCli(
          ["init", "--yes", "--dir", targetDir, "--config", configPath],
          { cwd: targetDir },
        );

        assert.strictEqual(result.code, 1);
        assert.ok(result.stderr.includes("config error:"));
        assert.ok(result.stderr.includes('Config "context" must be an object'));
      },
    );
  });

  test("cli init fails for invalid --config templateVariables type", async () => {
    await withTempDir(
      "ai-agent-bootstrap-cli-config-invalid-vars-shape-",
      async (targetDir) => {
        const configPath = path.join(targetDir, "bootstrap.config.json");
        await fs.writeFile(
          configPath,
          JSON.stringify({ templateVariables: "not-an-object" }),
          "utf-8",
        );

        const result = await runCli(
          ["init", "--yes", "--dir", targetDir, "--config", configPath],
          { cwd: targetDir },
        );

        assert.strictEqual(result.code, 1);
        assert.ok(result.stderr.includes("config error:"));
        assert.ok(
          result.stderr.includes(
            'Config "templateVariables" must be an object or array',
          ),
        );
      },
    );
  });
};

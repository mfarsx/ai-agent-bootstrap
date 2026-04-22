const path = require("path");
const fs = require("../src/core/fs-helpers");
const { applyRenderPlan } = require("../src/core/apply-plan");
const { withTempDir } = require("./helpers");

module.exports = async function registerApplyPlanTests({ test, assert }) {
  test("applyRenderPlan keeps scaffold skip-on-exists semantics", async () => {
    await withTempDir(
      "ai-agent-bootstrap-apply-plan-scaffold-",
      async (targetDir) => {
        const existingPath = path.join(targetDir, "existing.txt");
        const missingPath = path.join(targetDir, "nested", "missing.txt");
        await fs.writeFile(existingPath, "original", "utf-8");

        const planItems = [
          {
            targetFile: existingPath,
            exists: true,
            currentContent: "original",
            rendered: "updated",
          },
          {
            targetFile: missingPath,
            exists: false,
            currentContent: null,
            rendered: "created",
          },
        ];

        const result = await applyRenderPlan(planItems, { overwrite: false });
        assert.deepStrictEqual(result, {
          created: 1,
          overwritten: 0,
          unchanged: 0,
          skipped: 1,
        });

        assert.strictEqual(
          await fs.readFile(existingPath, "utf-8"),
          "original",
        );
        assert.strictEqual(await fs.readFile(missingPath, "utf-8"), "created");
      },
    );
  });

  test("applyRenderPlan applies reset overwrite semantics", async () => {
    await withTempDir(
      "ai-agent-bootstrap-apply-plan-reset-",
      async (targetDir) => {
        const samePath = path.join(targetDir, "same.txt");
        const changedPath = path.join(targetDir, "changed.txt");
        const missingPath = path.join(targetDir, "new", "created.txt");

        await fs.writeFile(samePath, "same", "utf-8");
        await fs.writeFile(changedPath, "before", "utf-8");

        const planItems = [
          {
            targetFile: samePath,
            exists: true,
            currentContent: "same",
            rendered: "same",
          },
          {
            targetFile: changedPath,
            exists: true,
            currentContent: "before",
            rendered: "after",
          },
          {
            targetFile: missingPath,
            exists: false,
            currentContent: null,
            rendered: "created",
          },
        ];

        const result = await applyRenderPlan(planItems, { overwrite: true });
        assert.deepStrictEqual(result, {
          created: 1,
          overwritten: 1,
          unchanged: 1,
          skipped: 0,
        });

        assert.strictEqual(await fs.readFile(samePath, "utf-8"), "same");
        assert.strictEqual(await fs.readFile(changedPath, "utf-8"), "after");
        assert.strictEqual(await fs.readFile(missingPath, "utf-8"), "created");
      },
    );
  });
};

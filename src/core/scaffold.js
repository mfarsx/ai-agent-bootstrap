const path = require("path");
const fs = require("./fs-helpers");
const { resolveTemplatePath } = require("../providers");
const { renderTemplateFile } = require("./template");
const { applyRenderPlan } = require("./apply-plan");

async function resolveFileItems(targetDir, provider, data) {
  return Promise.all(
    provider.files.map(async (file) => {
      const targetFile = path.join(targetDir, file.target);
      const templateFile = resolveTemplatePath(provider, file);
      const [rendered, exists] = await Promise.all([
        renderTemplateFile(templateFile, data),
        fs.pathExists(targetFile),
      ]);
      const currentContent = exists
        ? await fs.readFile(targetFile, "utf-8")
        : null;

      return {
        target: file.target,
        targetFile,
        rendered,
        exists,
        currentContent,
      };
    }),
  );
}

async function scaffoldProviderFiles(targetDir, provider, data, options = {}) {
  const dryRun = Boolean(options.dryRun);
  const items = await resolveFileItems(targetDir, provider, data);
  let wouldCreate = 0;
  const fileResults = [];
  let created = 0;
  let skipped = 0;

  if (dryRun) {
    for (const item of items) {
      if (item.exists) {
        fileResults.push({ target: item.target, status: "skipped" });
      } else {
        wouldCreate++;
        fileResults.push({ target: item.target, status: "would_create" });
      }
    }
  } else {
    const writeResult = await applyRenderPlan(items, {
      overwrite: false,
      parallel: true,
    });
    created = writeResult.created;
    skipped = writeResult.skipped;

    for (const item of items) {
      if (item.exists) {
        fileResults.push({ target: item.target, status: "skipped" });
      } else {
        fileResults.push({ target: item.target, status: "created" });
      }
    }
  }

  return { created, skipped, wouldCreate, dryRun, fileResults };
}

async function buildProviderRenderPlan(targetDir, provider, data) {
  return resolveFileItems(targetDir, provider, data);
}

module.exports = {
  buildProviderRenderPlan,
  scaffoldProviderFiles,
};

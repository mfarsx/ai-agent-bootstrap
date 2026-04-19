const path = require("path");
const fs = require("./fs-helpers");
const { resolveTemplatePath } = require("../providers");
const { renderTemplateFile } = require("./template");

async function resolveFileItems(targetDir, provider, data) {
  const items = [];

  for (const file of provider.files) {
    const targetFile = path.join(targetDir, file.target);
    const templateFile = resolveTemplatePath(provider, file);
    const rendered = await renderTemplateFile(templateFile, data);
    const exists = await fs.pathExists(targetFile);
    const currentContent = exists
      ? await fs.readFile(targetFile, "utf-8")
      : null;

    items.push({
      target: file.target,
      targetFile,
      rendered,
      exists,
      currentContent,
    });
  }

  return items;
}

async function scaffoldProviderFiles(targetDir, provider, data, options = {}) {
  const dryRun = Boolean(options.dryRun);
  const items = await resolveFileItems(targetDir, provider, data);
  let created = 0;
  let wouldCreate = 0;
  let skipped = 0;
  const fileResults = [];

  for (const item of items) {
    if (item.exists) {
      skipped++;
      fileResults.push({ target: item.target, status: "skipped" });
      continue;
    }

    if (dryRun) {
      wouldCreate++;
      fileResults.push({ target: item.target, status: "would_create" });
      continue;
    }

    await fs.ensureDir(path.dirname(item.targetFile));
    await fs.writeFile(item.targetFile, item.rendered, "utf-8");
    created++;
    fileResults.push({ target: item.target, status: "created" });
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

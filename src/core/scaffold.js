const path = require("path");
const fs = require("fs-extra");
const { resolveTemplatePath } = require("../providers");
const { renderTemplateFile } = require("./template");

async function scaffoldProviderFiles(targetDir, provider, data, options = {}) {
  const dryRun = Boolean(options.dryRun);
  let created = 0;
  let wouldCreate = 0;
  let skipped = 0;
  const fileResults = [];

  for (const file of provider.files) {
    const targetFile = path.join(targetDir, file.target);
    const templateFile = resolveTemplatePath(provider, file);

    if (await fs.pathExists(targetFile)) {
      skipped++;
      fileResults.push({ target: file.target, status: "skipped" });
      continue;
    }

    const content = await renderTemplateFile(templateFile, data);

    if (dryRun) {
      wouldCreate++;
      fileResults.push({ target: file.target, status: "would_create" });
      continue;
    }

    await fs.ensureDir(path.dirname(targetFile));
    await fs.writeFile(targetFile, content, "utf-8");
    created++;
    fileResults.push({ target: file.target, status: "created" });
  }

  return { created, skipped, wouldCreate, dryRun, fileResults };
}

async function buildProviderRenderPlan(targetDir, provider, data) {
  const items = [];

  for (const file of provider.files) {
    const targetFile = path.join(targetDir, file.target);
    const templateFile = resolveTemplatePath(provider, file);
    const rendered = await renderTemplateFile(templateFile, data);
    const exists = await fs.pathExists(targetFile);
    const currentContent = exists ? await fs.readFile(targetFile, "utf-8") : null;

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

module.exports = {
  buildProviderRenderPlan,
  scaffoldProviderFiles,
};

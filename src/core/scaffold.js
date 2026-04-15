const path = require("path");
const fs = require("fs-extra");
const { resolveTemplatePath } = require("../providers");
const { renderTemplateFile } = require("./template");

async function scaffoldProviderFiles(targetDir, provider, data) {
  let created = 0;
  let skipped = 0;
  const fileResults = [];

  for (const file of provider.files) {
    const targetFile = path.join(targetDir, file.target);
    const templateFile = resolveTemplatePath(provider, file);
    await fs.ensureDir(path.dirname(targetFile));

    if (await fs.pathExists(targetFile)) {
      skipped++;
      fileResults.push({ target: file.target, status: "skipped" });
      continue;
    }

    const content = await renderTemplateFile(templateFile, data);
    await fs.writeFile(targetFile, content, "utf-8");
    created++;
    fileResults.push({ target: file.target, status: "created" });
  }

  return { created, skipped, fileResults };
}

module.exports = {
  scaffoldProviderFiles,
};

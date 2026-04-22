const fs = require("./fs-helpers");
const { fillTemplate } = require("../utils");

const cache = new Map();

async function renderTemplateFile(templatePath, data) {
  let content = cache.get(templatePath);
  if (content === undefined) {
    content = await fs.readFile(templatePath, "utf-8");
    cache.set(templatePath, content);
  }
  return fillTemplate(content, data);
}

module.exports = {
  renderTemplateFile,
  _clearCache: () => cache.clear(),
};

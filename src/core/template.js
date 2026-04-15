const fs = require("fs-extra");
const { fillTemplate } = require("../utils");

async function renderTemplateFile(templatePath, data) {
  const content = await fs.readFile(templatePath, "utf-8");
  return fillTemplate(content, data);
}

module.exports = {
  renderTemplateFile,
};

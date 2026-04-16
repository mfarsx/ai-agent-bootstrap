const path = require("path");
const fs = require("fs-extra");
const { DEFAULT_PROVIDER, getProvider, getExpectedFiles } = require("../providers");

async function buildStatusReport(options = {}) {
  const targetDir = path.resolve(options.dir || ".");
  const provider = getProvider(options.provider || DEFAULT_PROVIDER);
  const expectedFiles = getExpectedFiles(provider.name);
  const entries = [];

  for (const file of expectedFiles) {
    const exists = await fs.pathExists(path.join(targetDir, file));
    entries.push({ target: file, exists });
  }

  const found = entries.filter((entry) => entry.exists).length;
  const missing = entries.length - found;

  return {
    targetDir,
    provider,
    expectedFiles,
    entries,
    found,
    missing,
  };
}

module.exports = {
  buildStatusReport,
};

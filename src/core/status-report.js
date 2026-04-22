const path = require("path");
const fs = require("./fs-helpers");
const {
  DEFAULT_PROVIDER,
  getProvider,
  getExpectedFiles,
} = require("../providers");

async function buildStatusReport(options = {}) {
  const targetDir = path.resolve(options.dir || ".");
  const provider = getProvider(options.provider || DEFAULT_PROVIDER);
  const expectedFiles = getExpectedFiles(provider.name);
  const existsFlags = await Promise.all(
    expectedFiles.map((file) => fs.pathExists(path.join(targetDir, file))),
  );
  const entries = expectedFiles.map((file, index) => ({
    target: file,
    exists: existsFlags[index],
  }));

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

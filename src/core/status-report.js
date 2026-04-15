const path = require("path");
const fs = require("fs-extra");
const { getProvider, getExpectedFiles } = require("../providers");

function buildStatusReport(options = {}) {
  const targetDir = path.resolve(options.dir || ".");
  const provider = getProvider(options.provider || "cline");
  const expectedFiles = getExpectedFiles(provider.name);
  const entries = expectedFiles.map((file) => {
    const exists = fs.pathExistsSync(path.join(targetDir, file));
    return {
      file,
      exists,
      status: exists ? "found" : "missing",
    };
  });
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

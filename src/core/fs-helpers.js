const fs = require("node:fs/promises");

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(targetPath) {
  await fs.mkdir(targetPath, { recursive: true });
}

async function remove(targetPath) {
  await fs.rm(targetPath, { recursive: true, force: true });
}

module.exports = {
  pathExists,
  ensureDir,
  mkdtemp: fs.mkdtemp,
  remove,
  readFile: fs.readFile,
  writeFile: fs.writeFile,
};

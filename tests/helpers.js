const os = require("os");
const path = require("path");
const fs = require("fs-extra");

async function withTempDir(prefix, run) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  try {
    await run(tempDir);
  } finally {
    await fs.remove(tempDir);
  }
}

async function captureConsole(run) {
  const logs = [];
  const errors = [];
  const originalLog = console.log;
  const originalError = console.error;

  console.log = (...args) => logs.push(args.join(" "));
  console.error = (...args) => errors.push(args.join(" "));

  try {
    await run();
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }

  return { logs, errors };
}

module.exports = {
  withTempDir,
  captureConsole,
};

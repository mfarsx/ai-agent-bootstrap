const os = require("os");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("../src/core/fs-helpers");

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

function runCli(args, options = {}) {
  const cliPath = path.join(__dirname, "..", "bin", "cli.js");
  const cwd = options.cwd || process.cwd();
  const env = {
    ...process.env,
    FORCE_COLOR: "0",
    ...options.env,
  };

  return new Promise((resolve) => {
    const child = spawn(process.execPath, [cliPath, ...args], {
      cwd,
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("close", (code) => {
      resolve({
        code: code === null ? 1 : code,
        stdout,
        stderr,
      });
    });
  });
}

function runNodeScript(script, options = {}) {
  const cwd = options.cwd || process.cwd();
  const env = {
    ...process.env,
    FORCE_COLOR: "0",
    ...options.env,
  };

  return new Promise((resolve) => {
    const child = spawn(process.execPath, ["-e", script], {
      cwd,
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("close", (code) => {
      resolve({
        code: code === null ? 1 : code,
        stdout,
        stderr,
      });
    });
  });
}

module.exports = {
  withTempDir,
  captureConsole,
  runCli,
  runNodeScript,
};

const assert = require("assert");

const suites = [
  require("./utils.test"),
  require("./init.test"),
  require("./status.test"),
];

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

async function main() {
  for (const suite of suites) {
    await suite({ test, assert });
  }

  let passed = 0;
  let failed = 0;

  for (const entry of tests) {
    try {
      await entry.fn();
      passed++;
      console.log(`✓ ${entry.name}`);
    } catch (error) {
      failed++;
      console.error(`✗ ${entry.name}`);
      console.error(`  ${error.stack || error.message}`);
    }
  }

  console.log(`\nTest results: ${passed} passed, ${failed} failed.`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});

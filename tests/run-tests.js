const assert = require("assert");

const suites = [
  require("./providers.test"),
  require("./template-context.test"),
  require("./stack-defaults.test"),
  require("./utils.test"),
  require("./prompts.test"),
  require("./init-ui.test"),
  require("./apply-plan.test"),
  require("./init-analyzer.test"),
  require("./scaffold-parallel.test"),
  require("./template-cache.test"),
  require("./init.test"),
  require("./update.test"),
  require("./status.test"),
  require("./cancellation.test"),
  require("./cli.test"),
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

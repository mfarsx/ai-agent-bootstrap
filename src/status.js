const path = require("path");
const fs = require("fs-extra");
const chalk = require("chalk");
const { getProvider, getExpectedFiles } = require("./providers");

function checkStatus(options) {
  const targetDir = path.resolve(options.dir || ".");
  const provider = getProvider(options.provider || "cline");
  const expectedFiles = getExpectedFiles(provider.name);

  console.log(chalk.cyan("\n🤖 AI Agent Bootstrap — Status\n"));
  console.log(chalk.gray(`Directory: ${targetDir}\n`));
  console.log(chalk.gray(`Provider: ${provider.label}\n`));

  let found = 0;
  let missing = 0;

  for (const file of expectedFiles) {
    const fullPath = path.join(targetDir, file);
    if (fs.pathExistsSync(fullPath)) {
      console.log(chalk.green(`  ✔  ${file}`));
      found++;
    } else {
      console.log(chalk.red(`  ✖  ${file}`));
      missing++;
    }
  }

  console.log(chalk.cyan(`\n📊 ${found}/${expectedFiles.length} files found.`));

  if (missing > 0) {
    console.log(
      chalk.yellow(
        `   Run ${chalk.bold("ai-bootstrap init")} to create missing files.\n`,
      ),
    );
  } else {
    console.log(chalk.green("   All files in place! ✨\n"));
  }
}

module.exports = { checkStatus };

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');

const ALL_FILES = [
  'memory-bank/projectbrief.md',
  'memory-bank/productContext.md',
  'memory-bank/activeContext.md',
  'memory-bank/systemPatterns.md',
  'memory-bank/techContext.md',
  'memory-bank/progress.md',
  '.clinerules/00-memory-bank.md',
  '.clinerules/01-coding-standards.md',
  '.clinerules/02-workflow.md',
  '.clinerules/03-boundaries.md',
  '.clineignore',
];

function checkStatus(options) {
  const targetDir = path.resolve(options.dir || '.');

  console.log(chalk.cyan('\n🤖 AI Agent Bootstrap — Status\n'));
  console.log(chalk.gray(`Directory: ${targetDir}\n`));

  let found = 0;
  let missing = 0;

  for (const file of ALL_FILES) {
    const fullPath = path.join(targetDir, file);
    if (fs.pathExistsSync(fullPath)) {
      console.log(chalk.green(`  ✔  ${file}`));
      found++;
    } else {
      console.log(chalk.red(`  ✖  ${file}`));
      missing++;
    }
  }

  console.log(
    chalk.cyan(`\n📊 ${found}/${ALL_FILES.length} files found.`)
  );

  if (missing > 0) {
    console.log(
      chalk.yellow(`   Run ${chalk.bold('ai-bootstrap init')} to create missing files.\n`)
    );
  } else {
    console.log(chalk.green('   All files in place! ✨\n'));
  }
}

module.exports = { checkStatus };

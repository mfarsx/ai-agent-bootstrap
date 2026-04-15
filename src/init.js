const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const { askQuestions, getDefaults } = require('./prompts');
const { fillTemplate } = require('./utils');

const TEMPLATE_DIR = path.join(__dirname, '..', 'templates');

const FILE_MAP = {
  'memory-bank': [
    'projectbrief.md',
    'productContext.md',
    'activeContext.md',
    'systemPatterns.md',
    'techContext.md',
    'progress.md',
  ],
  '.clinerules': [
    '00-memory-bank.md',
    '01-coding-standards.md',
    '02-workflow.md',
    '03-boundaries.md',
  ],
};

async function initProject(options) {
  const targetDir = path.resolve(options.dir || '.');

  console.log(chalk.cyan('\n🤖 AI Agent Bootstrap\n'));
  console.log(chalk.gray(`Target: ${targetDir}\n`));

  // Gather project info
  const data = options.yes ? getDefaults() : await askQuestions();

  let created = 0;
  let skipped = 0;

  for (const [folder, files] of Object.entries(FILE_MAP)) {
    const targetFolder = path.join(targetDir, folder);
    await fs.ensureDir(targetFolder);

    for (const file of files) {
      const targetFile = path.join(targetFolder, file);
      const templateFile = path.join(
        TEMPLATE_DIR,
        folder === '.clinerules' ? 'clinerules' : folder,
        file
      );

      // Skip if file already exists
      if (await fs.pathExists(targetFile)) {
        console.log(chalk.yellow(`  ⏭  ${folder}/${file} (already exists)`));
        skipped++;
        continue;
      }

      // Read template and fill placeholders
      let content = await fs.readFile(templateFile, 'utf-8');
      content = fillTemplate(content, data);

      await fs.writeFile(targetFile, content, 'utf-8');
      console.log(chalk.green(`  ✔  ${folder}/${file}`));
      created++;
    }
  }

  // Create .clineignore if it doesn't exist
  const ignoreFile = path.join(targetDir, '.clineignore');
  if (!(await fs.pathExists(ignoreFile))) {
    const ignoreTemplate = path.join(TEMPLATE_DIR, '.clineignore');
    await fs.copy(ignoreTemplate, ignoreFile);
    console.log(chalk.green('  ✔  .clineignore'));
    created++;
  } else {
    console.log(chalk.yellow('  ⏭  .clineignore (already exists)'));
    skipped++;
  }

  // Summary
  console.log(chalk.cyan(`\n✨ Done! ${created} files created, ${skipped} skipped.\n`));

  if (created > 0) {
    console.log(chalk.gray('Next steps:'));
    console.log(chalk.gray('  1. Fill in the memory-bank files with your project details'));
    console.log(chalk.gray('  2. Review .clinerules and adjust to your workflow'));
    console.log(chalk.gray('  3. Start your AI agent — it will read these files automatically\n'));
  }
}

module.exports = { initProject };

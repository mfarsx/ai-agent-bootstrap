const path = require("path");
const fs = require("fs-extra");
const chalk = require("chalk");
const { askQuestions, getDefaults } = require("./prompts");
const { fillTemplate } = require("./utils");
const { assertProviderReady } = require("./providers");
const { mergeGitignoreEntries } = require("./gitignore");

const TEMPLATE_DIR = path.join(__dirname, "..", "templates");

function resolveTemplatePath(provider, file) {
  const sourceProvider = file.sourceProvider || provider.templateDir;
  return path.join(TEMPLATE_DIR, sourceProvider, file.source);
}

async function initProject(options) {
  const targetDir = path.resolve(options.dir || ".");
  const selectedProvider = assertProviderReady(options.provider || "cline");
  const promptDefaults = {
    ...getDefaults(targetDir),
    provider: selectedProvider.name,
  };

  console.log(chalk.cyan("\n🤖 AI Agent Bootstrap\n"));
  console.log(chalk.gray(`Target: ${targetDir}\n`));

  // Gather project info
  const data = options.yes
    ? promptDefaults
    : await askQuestions(targetDir, promptDefaults);
  const provider = assertProviderReady(data.provider || selectedProvider.name);

  let created = 0;
  let skipped = 0;

  for (const file of provider.files) {
    const targetFile = path.join(targetDir, file.target);
    const templateFile = resolveTemplatePath(provider, file);

    await fs.ensureDir(path.dirname(targetFile));

    // Skip if file already exists
    if (await fs.pathExists(targetFile)) {
      console.log(chalk.yellow(`  ⏭  ${file.target} (already exists)`));
      skipped++;
      continue;
    }

    // Read template and fill placeholders
    let content = await fs.readFile(templateFile, "utf-8");
    content = fillTemplate(content, data);

    await fs.writeFile(targetFile, content, "utf-8");
    console.log(chalk.green(`  ✔  ${file.target}`));
    created++;
  }

  const gitignoreResult = await mergeGitignoreEntries(
    targetDir,
    provider.gitignoreEntries,
  );
  if (gitignoreResult.added > 0) {
    console.log(
      chalk.green(`  ✔  .gitignore (${gitignoreResult.added} entries added)`),
    );
  } else {
    console.log(chalk.yellow("  ⏭  .gitignore (already up to date)"));
  }

  // Summary
  console.log(
    chalk.cyan(`\n✨ Done! ${created} files created, ${skipped} skipped.\n`),
  );

  if (created > 0) {
    console.log(chalk.gray("Next steps:"));
    console.log(
      chalk.gray(
        `  1. Fill in the ${provider.contextPath} files with your project details`,
      ),
    );
    if (provider.rulesPath) {
      console.log(
        chalk.gray(
          `  2. Review ${provider.rulesPath} and adjust to your workflow`,
        ),
      );
    }
    console.log(
      chalk.gray(
        "  3. Start your AI agent — it will read these files automatically\n",
      ),
    );
  }
}

module.exports = { initProject };

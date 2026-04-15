const inquirer = require("inquirer");
const { getProviderPromptChoices } = require("./providers");

const STACK_COMMAND_DEFAULTS = {
  "Node.js": {
    installCommand: "npm install",
    devCommand: "npm run dev",
    testCommand: "npm test",
    lintCommand: "npm run lint",
  },
  React: {
    installCommand: "npm install",
    devCommand: "npm start",
    testCommand: "npm test",
    lintCommand: "npm run lint",
  },
  "Next.js": {
    installCommand: "npm install",
    devCommand: "npm run dev",
    testCommand: "npm test",
    lintCommand: "npm run lint",
  },
  Vue: {
    installCommand: "npm install",
    devCommand: "npm run dev",
    testCommand: "npm test",
    lintCommand: "npm run lint",
  },
  Python: {
    installCommand: "pip install -r requirements.txt",
    devCommand: "python main.py",
    testCommand: "pytest",
    lintCommand: "ruff check .",
  },
  TypeScript: {
    installCommand: "npm install",
    devCommand: "npm run dev",
    testCommand: "npm test",
    lintCommand: "npm run lint && npm run typecheck",
  },
  Go: {
    installCommand: "go mod tidy",
    devCommand: "go run .",
    testCommand: "go test ./...",
    lintCommand: "go vet ./...",
  },
  Other: {
    installCommand: "# update with your install command",
    devCommand: "# update with your dev command",
    testCommand: "# update with your test command",
    lintCommand: "# update with your lint/typecheck command",
  },
};

function getCommandDefaults(stack) {
  return STACK_COMMAND_DEFAULTS[stack] || STACK_COMMAND_DEFAULTS.Other;
}

function getQuestions(targetDir, defaults = {}) {
  return [
    {
      type: "input",
      name: "projectName",
      message: "Project name:",
      default: () =>
        defaults.projectName || require("path").basename(targetDir),
    },
    {
      type: "input",
      name: "projectDescription",
      message: "Short project description:",
      default: defaults.projectDescription || "",
    },
    {
      type: "list",
      name: "provider",
      message: "AI interface/provider:",
      choices: getProviderPromptChoices(),
      default: defaults.provider || "cline",
    },
    {
      type: "list",
      name: "stack",
      message: "Primary tech stack:",
      default: defaults.stack || "Node.js",
      choices: [
        "Node.js",
        "React",
        "Next.js",
        "Vue",
        "Python",
        "TypeScript",
        "Go",
        "Other",
      ],
    },
    {
      type: "input",
      name: "stackOther",
      message: "Specify your stack:",
      when: (answers) => answers.stack === "Other",
    },
    {
      type: "checkbox",
      name: "extras",
      message: "Additional tools/frameworks:",
      default: defaults.extras || [],
      choices: [
        "Tailwind CSS",
        "Docker",
        "PostgreSQL",
        "MongoDB",
        "Redis",
        "GraphQL",
        "REST API",
        "Prisma",
      ],
    },
    {
      type: "input",
      name: "targetAudience",
      message: "Target audience (who is this for?):",
      default: defaults.targetAudience || "",
    },
  ];
}

async function askQuestions(targetDir, defaults = {}) {
  const answers = {
    ...defaults,
    ...(await inquirer.prompt(getQuestions(targetDir, defaults))),
  };

  if (answers.stack === "Other" && answers.stackOther) {
    answers.stack = answers.stackOther;
  }

  const commands = getCommandDefaults(answers.stack);
  answers.installCommand = commands.installCommand;
  answers.devCommand = commands.devCommand;
  answers.testCommand = commands.testCommand;
  answers.lintCommand = commands.lintCommand;

  delete answers.stackOther;

  return answers;
}

function getDefaults(targetDir) {
  const path = require("path");
  const commands = getCommandDefaults("Node.js");

  return {
    projectName: path.basename(targetDir),
    projectDescription: "",
    provider: "cline",
    stack: "Node.js",
    extras: [],
    targetAudience: "",
    installCommand: commands.installCommand,
    devCommand: commands.devCommand,
    testCommand: commands.testCommand,
    lintCommand: commands.lintCommand,
    projectStructure: "src/\n  ├── index.js\n  └── ...",
  };
}

module.exports = { askQuestions, getDefaults };

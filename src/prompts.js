const path = require("path");
const prompts = require("prompts");
const { DEFAULT_PROVIDER, getProviderPromptChoices } = require("./providers");

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

const STACK_PROJECT_STRUCTURES = {
  "Node.js": "src/\n  ├── index.js\n  └── ...",
  React: "src/\n  ├── App.jsx\n  ├── components/\n  └── ...",
  "Next.js": "app/\n  ├── layout.tsx\n  ├── page.tsx\n  └── ...",
  Vue: "src/\n  ├── App.vue\n  ├── components/\n  └── ...",
  TypeScript: "src/\n  ├── index.ts\n  └── ...",
  Python: "src/\n  ├── __init__.py\n  ├── main.py\n  └── ...",
  Go: "cmd/\n  └── app/\n      └── main.go\ninternal/\n  └── ...",
  Other: "<!-- Describe the project's file/folder organization -->",
};

function getProjectStructureDefault(stack) {
  return STACK_PROJECT_STRUCTURES[stack] || STACK_PROJECT_STRUCTURES.Other;
}

function applyStackDerivedDefaults(
  context,
  { overrideStructure = false } = {},
) {
  if (!context || typeof context !== "object") return context;
  const stack = context.stack || "Node.js";
  const commands = getCommandDefaults(stack);
  const nodeStructure = STACK_PROJECT_STRUCTURES["Node.js"];

  if (
    !context.installCommand ||
    context.installCommand === STACK_COMMAND_DEFAULTS["Node.js"].installCommand
  ) {
    context.installCommand = commands.installCommand;
  }
  if (
    !context.devCommand ||
    context.devCommand === STACK_COMMAND_DEFAULTS["Node.js"].devCommand
  ) {
    context.devCommand = commands.devCommand;
  }
  if (
    !context.testCommand ||
    context.testCommand === STACK_COMMAND_DEFAULTS["Node.js"].testCommand
  ) {
    context.testCommand = commands.testCommand;
  }
  if (
    !context.lintCommand ||
    context.lintCommand === STACK_COMMAND_DEFAULTS["Node.js"].lintCommand
  ) {
    context.lintCommand = commands.lintCommand;
  }
  if (
    overrideStructure ||
    !context.projectStructure ||
    context.projectStructure === nodeStructure
  ) {
    context.projectStructure = getProjectStructureDefault(stack);
  }

  return context;
}

async function askQuestions(targetDir, defaults = {}) {
  const onCancel = () => {
    process.exit(0);
  };

  const providerChoices = getProviderPromptChoices().map((choice) => ({
    title: choice.name,
    value: choice.value,
  }));

  const stackChoices = [
    "Node.js",
    "React",
    "Next.js",
    "Vue",
    "Python",
    "TypeScript",
    "Go",
    "Other",
  ];

  const extrasChoices = [
    "Tailwind CSS",
    "Docker",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "GraphQL",
    "REST API",
    "Prisma",
  ];

  const response = await prompts(
    [
      {
        type: "text",
        name: "projectName",
        message: "Project name:",
        initial: defaults.projectName || path.basename(targetDir),
      },
      {
        type: "text",
        name: "projectDescription",
        message: "Short project description:",
        initial: defaults.projectDescription || "",
      },
      {
        type: "select",
        name: "provider",
        message: "AI interface/provider:",
        choices: providerChoices,
        initial: Math.max(
          0,
          providerChoices.findIndex(
            (choice) =>
              choice.value === (defaults.provider || DEFAULT_PROVIDER),
          ),
        ),
      },
      {
        type: "select",
        name: "stack",
        message: "Primary tech stack:",
        choices: stackChoices.map((stack) => ({
          title: stack,
          value: stack,
        })),
        initial: Math.max(0, stackChoices.indexOf(defaults.stack || "Node.js")),
      },
      {
        type: (prev) => (prev === "Other" ? "text" : null),
        name: "stackOther",
        message: "Specify your stack:",
      },
      {
        type: "multiselect",
        name: "extras",
        message: "Additional tools/frameworks:",
        choices: extrasChoices.map((extra) => ({
          title: extra,
          value: extra,
          selected: (defaults.extras || []).includes(extra),
        })),
        hint: "- Space to select. Enter to submit",
        instructions: false,
      },
      {
        type: "text",
        name: "targetAudience",
        message: "Target audience (who is this for?):",
        initial: defaults.targetAudience || "",
      },
    ],
    { onCancel },
  );

  const answers = {
    ...defaults,
    ...response,
  };

  if (answers.stack === "Other" && answers.stackOther) {
    answers.stack = answers.stackOther;
  }

  const commands = getCommandDefaults(answers.stack);
  answers.installCommand = commands.installCommand;
  answers.devCommand = commands.devCommand;
  answers.testCommand = commands.testCommand;
  answers.lintCommand = commands.lintCommand;
  if (
    !answers.projectStructure ||
    answers.projectStructure === STACK_PROJECT_STRUCTURES["Node.js"]
  ) {
    answers.projectStructure = getProjectStructureDefault(answers.stack);
  }

  delete answers.stackOther;

  return answers;
}

function getDefaults(targetDir) {
  const commands = getCommandDefaults("Node.js");

  return {
    projectName: path.basename(targetDir),
    projectDescription: "",
    provider: DEFAULT_PROVIDER,
    stack: "Node.js",
    extras: [],
    targetAudience: "",
    installCommand: commands.installCommand,
    devCommand: commands.devCommand,
    testCommand: commands.testCommand,
    lintCommand: commands.lintCommand,
    projectStructure: getProjectStructureDefault("Node.js"),
    planWorkflowGuidance: "",
    reviewWorkflowGuidance: "",
    commitWorkflowGuidance: "",
  };
}

module.exports = {
  askQuestions,
  getDefaults,
  getProjectStructureDefault,
  applyStackDerivedDefaults,
};

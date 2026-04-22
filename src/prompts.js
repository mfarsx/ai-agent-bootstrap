const path = require("path");
const prompts = require("prompts");
const { DEFAULT_PROVIDER, getProviderPromptChoices } = require("./providers");
const {
  STACK_COMMAND_DEFAULTS,
  STACK_PROJECT_STRUCTURES,
  STACK_DERIVED_COMMAND_FIELDS,
  getCommandDefaults,
  getProjectStructureDefault,
  applyStackDerivedDefaults,
} = require("./core/stack-defaults");
const { CancelledError } = require("./core/cli-errors");

async function askQuestions(targetDir, defaults = {}) {
  const onCancel = () => {
    throw new CancelledError();
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

  const touched = new Set(Object.keys(response));

  if (answers.stack === "Other" && answers.stackOther) {
    answers.stack = answers.stackOther;
    touched.add("stack");
  }

  touched.delete("stackOther");
  delete answers.stackOther;

  return { answers, touched };
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
  STACK_COMMAND_DEFAULTS,
  STACK_PROJECT_STRUCTURES,
  STACK_DERIVED_COMMAND_FIELDS,
  getCommandDefaults,
  askQuestions,
  getDefaults,
  getProjectStructureDefault,
  applyStackDerivedDefaults,
};

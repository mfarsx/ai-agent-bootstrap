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

const STACK_DERIVED_COMMAND_FIELDS = [
  "installCommand",
  "devCommand",
  "testCommand",
  "lintCommand",
];

function applyStackDerivedDefaults(
  context,
  { customFields = new Set(), overrideStructure = false } = {},
) {
  if (!context || typeof context !== "object") return context;
  const stack = context.stack || "Node.js";
  const commands = getCommandDefaults(stack);

  for (const field of STACK_DERIVED_COMMAND_FIELDS) {
    if (customFields.has(field)) continue;
    context[field] = commands[field];
  }

  if (overrideStructure || !customFields.has("projectStructure")) {
    context.projectStructure = getProjectStructureDefault(stack);
  }

  return context;
}

module.exports = {
  STACK_COMMAND_DEFAULTS,
  STACK_PROJECT_STRUCTURES,
  STACK_DERIVED_COMMAND_FIELDS,
  getCommandDefaults,
  getProjectStructureDefault,
  applyStackDerivedDefaults,
};

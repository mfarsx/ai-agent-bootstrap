const fs = require("fs");
const path = require("path");

const MEMORY_BANK_FILES = [
  "projectbrief.md",
  "productContext.md",
  "activeContext.md",
  "systemPatterns.md",
  "techContext.md",
  "progress.md",
];

const WORKFLOW_SLUGS = [
  "checkpoint",
  "cleanup",
  "commit",
  "init-memory",
  "plan",
  "review",
  "status",
  "stuck",
  "update-memory",
];

const SHARED_RULE_FILES = [
  "00-memory-bank.md",
  "01-coding-standards.md",
  "02-workflow.md",
  "03-boundaries.md",
];

const CURSOR_RULE_FILES = [
  "00-memory-bank.mdc",
  "01-coding-standards.mdc",
  "02-workflow.mdc",
  "03-boundaries.mdc",
];

function createGitignoreEntries(files) {
  return files.map((file) => {
    const target = file.target;
    return target.startsWith("/") ? target : `/${target}`;
  });
}

function memoryBankFiles({
  contextPath = "memory-bank",
  sourcePath = "memory-bank",
  sourceProvider = "shared",
} = {}) {
  return MEMORY_BANK_FILES.map((file) => {
    const entry = {
      source: `${sourcePath}/${file}`,
      target: `${contextPath}/${file}`,
    };
    if (sourceProvider) {
      entry.sourceProvider = sourceProvider;
    }
    return entry;
  });
}

function rulesFiles(rulesPath, ruleFiles) {
  return ruleFiles.map((file) => ({
    source: `${rulesPath}/${file}`,
    target: `${rulesPath}/${file}`,
  }));
}

function workflowFiles({ path, slugs, buildFilename }) {
  return slugs.map((slug) => {
    const filename = buildFilename(slug);
    return {
      source: `${path}/${filename}`,
      target: `${path}/${filename}`,
    };
  });
}

function buildProviderManifest({
  memoryBankSource = "shared",
  contextPath = "memory-bank",
  rules,
  workflows,
  extras = [],
  ignoreFile,
}) {
  const files = [
    ...memoryBankFiles({ contextPath, sourceProvider: memoryBankSource }),
  ];

  files.push({ source: "AGENTS.md", target: "AGENTS.md" });

  for (const extra of extras) {
    files.push(extra);
  }

  if (rules) {
    files.push(...rulesFiles(rules.path, rules.files));
  }

  if (workflows) {
    files.push(...workflowFiles(workflows));
  }

  if (ignoreFile) {
    files.push({ source: ignoreFile, target: ignoreFile });
  }

  return files;
}

const CLINE_FILES = buildProviderManifest({
  rules: { path: ".clinerules", files: SHARED_RULE_FILES },
  workflows: {
    path: ".clinerules/workflows",
    slugs: WORKFLOW_SLUGS,
    buildFilename: (slug) => `${slug}.md`,
  },
  ignoreFile: ".clineignore",
});

const CURSOR_FILES = buildProviderManifest({
  extras: [{ source: ".cursor/index.mdc", target: ".cursor/index.mdc" }],
  rules: { path: ".cursor/rules", files: CURSOR_RULE_FILES },
  workflows: {
    path: ".cursor/skills",
    slugs: WORKFLOW_SLUGS,
    buildFilename: (slug) => `${slug}/SKILL.md`,
  },
  ignoreFile: ".cursorignore",
});

const OPENCLAW_FILES = buildProviderManifest({
  extras: [
    { source: "IDENTITY.md", target: "IDENTITY.md" },
    { source: "SOUL.md", target: "SOUL.md" },
    { source: "USER.md", target: "USER.md" },
  ],
});

const WINDSURF_FILES = buildProviderManifest({
  rules: { path: ".windsurf/rules", files: SHARED_RULE_FILES },
  workflows: {
    path: ".windsurf/workflows",
    slugs: WORKFLOW_SLUGS,
    buildFilename: (slug) => `${slug}.md`,
  },
  ignoreFile: ".windsurfignore",
});

const CLAUDE_CODE_FILES = [
  { source: "AGENTS.md", target: "AGENTS.md" },
  { source: "CLAUDE.md", target: "CLAUDE.md" },
  ...workflowFiles({
    path: ".claude/commands",
    slugs: WORKFLOW_SLUGS,
    buildFilename: (slug) => `${slug}.md`,
  }),
  ...memoryBankFiles({
    contextPath: "docs/context",
    sourcePath: "docs/context",
    sourceProvider: null,
  }),
];

const PROVIDERS = {
  cline: {
    label: "Cline",
    ready: true,
    templateDir: "cline",
    contextPath: "memory-bank",
    rulesPath: ".clinerules",
    workflowsPath: ".clinerules/workflows",
    workflowFilenamePattern: "<slug>.md",
    workflowSlugs: WORKFLOW_SLUGS,
    files: CLINE_FILES,
    gitignoreEntries: createGitignoreEntries(CLINE_FILES),
    detectionTargets: [
      ".clinerules/00-memory-bank.md",
      ".clinerules/workflows/init-memory.md",
    ],
    workflows: {
      initMemory: { command: "/init-memory", hint: "in Cline chat" },
      updateMemory: { command: "/update-memory", hint: "in Cline chat" },
    },
  },
  cursor: {
    label: "Cursor",
    ready: true,
    templateDir: "cursor",
    contextPath: "memory-bank",
    rulesPath: ".cursor/rules",
    workflowsPath: ".cursor/skills",
    workflowFilenamePattern: "<slug>/SKILL.md",
    workflowSlugs: WORKFLOW_SLUGS,
    files: CURSOR_FILES,
    gitignoreEntries: createGitignoreEntries(CURSOR_FILES),
    detectionTargets: [".cursor/index.mdc", ".cursor/rules/00-memory-bank.mdc"],
    workflows: {
      initMemory: { command: "/init-memory", hint: "in Cursor chat" },
      updateMemory: { command: "/update-memory", hint: "in Cursor chat" },
    },
  },
  openclaw: {
    label: "OpenClaw",
    ready: true,
    templateDir: "openclaw",
    contextPath: "memory-bank",
    files: OPENCLAW_FILES,
    gitignoreEntries: createGitignoreEntries(OPENCLAW_FILES),
    detectionTargets: ["IDENTITY.md", "SOUL.md"],
  },
  windsurf: {
    label: "Windsurf",
    ready: true,
    templateDir: "windsurf",
    contextPath: "memory-bank",
    rulesPath: ".windsurf/rules",
    workflowsPath: ".windsurf/workflows",
    workflowFilenamePattern: "<slug>.md",
    workflowSlugs: WORKFLOW_SLUGS,
    files: WINDSURF_FILES,
    gitignoreEntries: createGitignoreEntries(WINDSURF_FILES),
    detectionTargets: [
      ".windsurf/rules/00-memory-bank.md",
      ".windsurf/workflows/init-memory.md",
    ],
    workflows: {
      initMemory: { command: "/init-memory", hint: "in Windsurf chat" },
      updateMemory: { command: "/update-memory", hint: "in Windsurf chat" },
    },
  },
  "claude-code": {
    label: "Claude Code",
    ready: true,
    templateDir: "claude-code",
    contextPath: "docs/context",
    workflowsPath: ".claude/commands",
    workflowFilenamePattern: "<slug>.md",
    workflowSlugs: WORKFLOW_SLUGS,
    files: CLAUDE_CODE_FILES,
    gitignoreEntries: createGitignoreEntries(CLAUDE_CODE_FILES),
    detectionTargets: ["CLAUDE.md", ".claude/commands/init-memory.md"],
    workflows: {
      initMemory: { command: "/init-memory", hint: "in Claude Code" },
      updateMemory: { command: "/update-memory", hint: "in Claude Code" },
    },
  },
};

const DEFAULT_PROVIDER = "cline";

const TEMPLATE_ROOT = path.join(__dirname, "..", "templates");

function resolveTemplatePath(provider, file) {
  const sourceProvider = file.sourceProvider || provider.templateDir;
  return path.join(TEMPLATE_ROOT, sourceProvider, file.source);
}

function validateProviderDefinition(
  providerName,
  provider,
  providers = PROVIDERS,
  options = {},
) {
  const checkTemplateSources = Boolean(options.checkTemplateSources);
  const errors = [];

  if (!provider || typeof provider !== "object") {
    return [`Provider "${providerName}" is not defined.`];
  }

  if (typeof provider.ready !== "boolean") {
    errors.push(
      `Provider "${providerName}" must define a boolean "ready" flag.`,
    );
  }

  if (!provider.templateDir || typeof provider.templateDir !== "string") {
    errors.push(
      `Provider "${providerName}" must define a valid "templateDir".`,
    );
  }

  if (!Array.isArray(provider.files) || provider.files.length === 0) {
    errors.push(
      `Provider "${providerName}" must define at least one file mapping.`,
    );
    return errors;
  }

  const targets = new Set();

  for (const [index, file] of provider.files.entries()) {
    if (!file || typeof file !== "object") {
      errors.push(
        `Provider "${providerName}" has invalid file mapping at index ${index}.`,
      );
      continue;
    }

    if (!file.source || typeof file.source !== "string") {
      errors.push(
        `Provider "${providerName}" file[${index}] is missing a valid "source".`,
      );
      continue;
    }

    if (!file.target || typeof file.target !== "string") {
      errors.push(
        `Provider "${providerName}" file[${index}] is missing a valid "target".`,
      );
      continue;
    }

    if (targets.has(file.target)) {
      errors.push(
        `Provider "${providerName}" has duplicate target path "${file.target}".`,
      );
    } else {
      targets.add(file.target);
    }

    const sourceProviderName = file.sourceProvider || provider.templateDir;
    const knownSourceProvider =
      sourceProviderName === "shared" || Boolean(providers[sourceProviderName]);
    if (!knownSourceProvider) {
      errors.push(
        `Provider "${providerName}" file "${file.target}" references unknown sourceProvider "${sourceProviderName}".`,
      );
      continue;
    }

    if (checkTemplateSources && provider.ready) {
      const templatePath = resolveTemplatePath(provider, file);
      if (!fs.existsSync(templatePath)) {
        errors.push(
          `Provider "${providerName}" is missing template source "${sourceProviderName}/${file.source}".`,
        );
      }
    }
  }

  return errors;
}

function validateProviderManifest(providerName, options = {}) {
  const provider = getProvider(providerName);
  const errors = validateProviderDefinition(
    provider.name,
    provider,
    PROVIDERS,
    options,
  );
  return {
    providerName: provider.name,
    valid: errors.length === 0,
    errors,
  };
}

function validateReadyProviderManifests(options = {}) {
  const errors = [];

  for (const providerName of getReadyProviderNames()) {
    const result = validateProviderManifest(providerName, options);
    for (const error of result.errors) {
      errors.push(error);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function formatManifestValidationError(validation) {
  const detail = validation.errors.map((error) => `- ${error}`).join("\n");
  return `Manifest validation failed:\n${detail}`;
}

function getProvider(name) {
  const providerName = String(name || DEFAULT_PROVIDER).toLowerCase();
  const provider = PROVIDERS[providerName];

  if (!provider) {
    const error = new Error(
      `Unknown provider "${name}". Use one of: ${getProviderNames().join(", ")}`,
    );
    error.code = "UNKNOWN_PROVIDER";
    throw error;
  }

  return { name: providerName, ...provider };
}

function getProviderNames() {
  return Object.keys(PROVIDERS);
}

function getReadyProviderNames() {
  return getProviderNames().filter((name) => PROVIDERS[name].ready);
}

function getReadyProviders() {
  return getReadyProviderNames().map((name) => getProvider(name));
}

function getProviderPromptChoices() {
  return getReadyProviderNames().map((name) => ({
    name: PROVIDERS[name].label,
    value: name,
  }));
}

function getExpectedFiles(providerName) {
  const provider = getProvider(providerName);

  if (!provider.ready) {
    const error = new Error(
      `${provider.label} templates are not ready yet. Use one of: ${getReadyProviderNames().join(
        ", ",
      )}`,
    );
    error.code = "PROVIDER_NOT_READY";
    throw error;
  }

  return [...provider.files.map((file) => file.target), ".gitignore"];
}

function assertProviderReady(providerName, options = {}) {
  const provider = getProvider(providerName);

  if (!provider.ready) {
    const error = new Error(
      `${provider.label} templates are not ready yet. Use one of: ${getReadyProviderNames().join(
        ", ",
      )}`,
    );
    error.code = "PROVIDER_NOT_READY";
    throw error;
  }

  if (options.validateManifest || options.checkTemplateSources) {
    const validation = validateProviderManifest(provider.name, {
      checkTemplateSources: options.checkTemplateSources,
    });
    if (!validation.valid) {
      const error = new Error(formatManifestValidationError(validation));
      error.code = "MISSING_TEMPLATE_SOURCE";
      throw error;
    }
  }

  return provider;
}

module.exports = {
  DEFAULT_PROVIDER,
  assertProviderReady,
  getProvider,
  getProviderNames,
  getProviderPromptChoices,
  getReadyProviders,
  getReadyProviderNames,
  getExpectedFiles,
  resolveTemplatePath,
  validateProviderDefinition,
  validateProviderManifest,
  validateReadyProviderManifests,
};

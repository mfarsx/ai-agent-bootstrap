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

const CLINE_RULE_FILES = [
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

const CLINE_WORKFLOW_FILES = [
  "checkpoint.md",
  "cleanup.md",
  "commit.md",
  "plan.md",
  "review.md",
  "status.md",
  "stuck.md",
];

const WINDSURF_RULE_FILES = [
  "00-memory-bank.md",
  "01-coding-standards.md",
  "02-workflow.md",
  "03-boundaries.md",
];

function createMemoryBankFiles() {
  return MEMORY_BANK_FILES.map((file) => ({
    source: `memory-bank/${file}`,
    target: `memory-bank/${file}`,
    sourceProvider: "shared",
  }));
}

function createGitignoreEntries(files) {
  return files.map((file) => file.target);
}

const CLINE_FILES = [
  ...createMemoryBankFiles(),
  ...CLINE_RULE_FILES.map((file) => ({
    source: `.clinerules/${file}`,
    target: `.clinerules/${file}`,
  })),
  ...CLINE_WORKFLOW_FILES.map((file) => ({
    source: `.clinerules/workflows/${file}`,
    target: `.clinerules/workflows/${file}`,
  })),
  { source: ".clineignore", target: ".clineignore" },
];

const CURSOR_FILES = [
  ...createMemoryBankFiles(),
  { source: "AGENTS.md", target: "AGENTS.md" },
  { source: ".cursor/index.mdc", target: ".cursor/index.mdc" },
  ...CURSOR_RULE_FILES.map((file) => ({
    source: `.cursor/rules/${file}`,
    target: `.cursor/rules/${file}`,
  })),
];

const OPENCLAW_FILES = [
  ...createMemoryBankFiles(),
  { source: "AGENTS.md", target: "AGENTS.md" },
  { source: "IDENTITY.md", target: "IDENTITY.md" },
  { source: "SOUL.md", target: "SOUL.md" },
  { source: "USER.md", target: "USER.md" },
];

const WINDSURF_FILES = [
  ...createMemoryBankFiles(),
  { source: "AGENTS.md", target: "AGENTS.md" },
  ...WINDSURF_RULE_FILES.map((file) => ({
    source: `.windsurf/rules/${file}`,
    target: `.windsurf/rules/${file}`,
  })),
];

const CLAUDE_CODE_FILES = [
  { source: "AGENTS.md", target: "AGENTS.md" },
  { source: "CLAUDE.md", target: "CLAUDE.md" },
  {
    source: ".claude/commands/update-memory.md",
    target: ".claude/commands/update-memory.md",
  },
  ...MEMORY_BANK_FILES.map((file) => ({
    source: `docs/context/${file}`,
    target: `docs/context/${file}`,
  })),
];

const PROVIDERS = {
  cline: {
    label: "Cline",
    ready: true,
    templateDir: "cline",
    contextPath: "memory-bank",
    rulesPath: ".clinerules",
    files: CLINE_FILES,
    gitignoreEntries: createGitignoreEntries(CLINE_FILES),
  },
  cursor: {
    label: "Cursor",
    ready: true,
    templateDir: "cursor",
    contextPath: "memory-bank",
    rulesPath: ".cursor/rules",
    files: CURSOR_FILES,
    gitignoreEntries: createGitignoreEntries(CURSOR_FILES),
  },
  openclaw: {
    label: "OpenClaw",
    ready: true,
    templateDir: "openclaw",
    contextPath: "memory-bank",
    files: OPENCLAW_FILES,
    gitignoreEntries: createGitignoreEntries(OPENCLAW_FILES),
  },
  windsurf: {
    label: "Windsurf",
    ready: true,
    templateDir: "windsurf",
    contextPath: "memory-bank",
    rulesPath: ".windsurf/rules",
    files: WINDSURF_FILES,
    gitignoreEntries: createGitignoreEntries(WINDSURF_FILES),
  },
  "claude-code": {
    label: "Claude Code",
    ready: true,
    templateDir: "claude-code",
    contextPath: "docs/context",
    files: CLAUDE_CODE_FILES,
    gitignoreEntries: createGitignoreEntries(CLAUDE_CODE_FILES),
  },
};

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
    errors.push(`Provider "${providerName}" must define a boolean "ready" flag.`);
  }

  if (!provider.templateDir || typeof provider.templateDir !== "string") {
    errors.push(`Provider "${providerName}" must define a valid "templateDir".`);
  }

  if (!Array.isArray(provider.files) || provider.files.length === 0) {
    errors.push(`Provider "${providerName}" must define at least one file mapping.`);
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
  const providerName = String(name || "cline").toLowerCase();
  const provider = PROVIDERS[providerName];

  if (!provider) {
    throw new Error(
      `Unknown provider \"${name}\". Use one of: ${getProviderNames().join(", ")}`,
    );
  }

  return { name: providerName, ...provider };
}

function getProviderNames() {
  return Object.keys(PROVIDERS);
}

function getReadyProviderNames() {
  return getProviderNames().filter((name) => PROVIDERS[name].ready);
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
    throw new Error(
      `${provider.label} templates are not ready yet. Use one of: ${getReadyProviderNames().join(
        ", ",
      )}`,
    );
  }

  return [...provider.files.map((file) => file.target), ".gitignore"];
}

function assertProviderReady(providerName, options = {}) {
  const provider = getProvider(providerName);

  if (!provider.ready) {
    throw new Error(
      `${provider.label} templates are not ready yet. Use one of: ${getReadyProviderNames().join(
        ", ",
      )}`,
    );
  }

  if (options.validateManifest || options.checkTemplateSources) {
    const validation = validateProviderManifest(provider.name, {
      checkTemplateSources: options.checkTemplateSources,
    });
    if (!validation.valid) {
      throw new Error(formatManifestValidationError(validation));
    }
  }

  return provider;
}

module.exports = {
  assertProviderReady,
  getProvider,
  getProviderNames,
  getProviderPromptChoices,
  getReadyProviderNames,
  getExpectedFiles,
  resolveTemplatePath,
  validateProviderDefinition,
  validateProviderManifest,
  validateReadyProviderManifests,
};

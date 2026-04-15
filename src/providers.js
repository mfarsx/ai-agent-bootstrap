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
    sourceProvider: "cline",
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

function assertProviderReady(providerName) {
  const provider = getProvider(providerName);

  if (!provider.ready) {
    throw new Error(
      `${provider.label} templates are not ready yet. Use one of: ${getReadyProviderNames().join(
        ", ",
      )}`,
    );
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
};

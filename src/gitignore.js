const path = require("path");
const fs = require("fs-extra");

function uniqueEntries(entries) {
  const seen = new Set();
  const output = [];

  for (const entry of entries || []) {
    const normalized = String(entry || "").trim();
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    output.push(normalized);
  }

  return output;
}

async function getGitignoreMergePlan(targetDir, entries) {
  const gitignorePath = path.join(targetDir, ".gitignore");
  const unique = uniqueEntries(entries);

  if (unique.length === 0) {
    return { added: 0, created: false, nextContent: null, gitignorePath };
  }

  const exists = await fs.pathExists(gitignorePath);
  const currentContent = exists ? await fs.readFile(gitignorePath, "utf-8") : "";
  const currentLines = currentContent.split(/\r?\n/).map((line) => line.trim());
  const lineSet = new Set(currentLines.filter(Boolean));
  const missing = unique.filter((entry) => !lineSet.has(entry));

  if (missing.length === 0) {
    return { added: 0, created: !exists, nextContent: null, gitignorePath };
  }

  const parts = [];
  const trimmedCurrent = currentContent.trimEnd();
  if (trimmedCurrent) {
    parts.push(trimmedCurrent);
  }
  parts.push(...missing);

  const nextContent = `${parts.join("\n")}\n`;
  return { added: missing.length, created: !exists, nextContent, gitignorePath };
}

async function previewGitignoreMerge(targetDir, entries) {
  const plan = await getGitignoreMergePlan(targetDir, entries);
  return { added: plan.added, created: plan.created };
}

async function mergeGitignoreEntries(targetDir, entries) {
  const plan = await getGitignoreMergePlan(targetDir, entries);

  if (!plan.nextContent) {
    return { added: plan.added, created: plan.created };
  }

  await fs.writeFile(plan.gitignorePath, plan.nextContent, "utf-8");
  return { added: plan.added, created: plan.created };
}

module.exports = {
  getGitignoreMergePlan,
  mergeGitignoreEntries,
  previewGitignoreMerge,
};

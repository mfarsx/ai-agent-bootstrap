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

async function mergeGitignoreEntries(targetDir, entries) {
  const gitignorePath = path.join(targetDir, ".gitignore");
  const unique = uniqueEntries(entries);

  if (unique.length === 0) {
    return { added: 0, created: false };
  }

  const exists = await fs.pathExists(gitignorePath);
  const currentContent = exists ? await fs.readFile(gitignorePath, "utf-8") : "";
  const currentLines = currentContent.split(/\r?\n/).map((line) => line.trim());
  const lineSet = new Set(currentLines.filter(Boolean));
  const missing = unique.filter((entry) => !lineSet.has(entry));

  if (missing.length === 0) {
    return { added: 0, created: !exists };
  }

  const parts = [];
  const trimmedCurrent = currentContent.trimEnd();
  if (trimmedCurrent) {
    parts.push(trimmedCurrent);
  }
  parts.push(...missing);

  await fs.writeFile(gitignorePath, `${parts.join("\n")}\n`, "utf-8");
  return { added: missing.length, created: !exists };
}

module.exports = {
  mergeGitignoreEntries,
};

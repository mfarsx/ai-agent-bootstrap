const path = require("path");
const fs = require("./fs-helpers");

async function applyRenderPlan(
  planItems,
  { overwrite = false, parallel = false } = {},
) {
  let created = 0;
  let overwritten = 0;
  let unchanged = 0;
  let skipped = 0;
  const pendingWrites = [];

  for (const item of planItems) {
    if (item.exists && !overwrite) {
      skipped++;
      continue;
    }

    if (item.exists && item.currentContent === item.rendered) {
      unchanged++;
      continue;
    }

    if (item.exists) {
      overwritten++;
    } else {
      created++;
    }

    pendingWrites.push(item);
  }

  if (parallel) {
    const uniqueDirs = [
      ...new Set(pendingWrites.map((item) => path.dirname(item.targetFile))),
    ];
    await Promise.all(uniqueDirs.map((dir) => fs.ensureDir(dir)));
    await Promise.all(
      pendingWrites.map((item) =>
        fs.writeFile(item.targetFile, item.rendered, "utf-8"),
      ),
    );
  } else {
    for (const item of pendingWrites) {
      await fs.ensureDir(path.dirname(item.targetFile));
      await fs.writeFile(item.targetFile, item.rendered, "utf-8");
    }
  }

  return {
    created,
    overwritten,
    unchanged,
    skipped,
  };
}

module.exports = {
  applyRenderPlan,
};

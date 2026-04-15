/**
 * Replace template placeholders with actual values.
 * Placeholders use {{KEY}} syntax.
 */
function fillTemplate(content, data) {
  return content
    .replace(/\{\{PROJECT_NAME\}\}/g, data.projectName || '')
    .replace(/\{\{PROJECT_DESCRIPTION\}\}/g, data.projectDescription || '')
    .replace(/\{\{TECH_STACK\}\}/g, data.stack || '')
    .replace(/\{\{EXTRAS\}\}/g, formatExtras(data.extras))
    .replace(/\{\{TARGET_AUDIENCE\}\}/g, data.targetAudience || '');
}

function formatExtras(extras) {
  if (!extras || extras.length === 0) return '<!-- Add key dependencies here -->';
  return extras.map((e) => `- ${e}`).join('\n');
}

module.exports = { fillTemplate };

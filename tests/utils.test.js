const path = require("path");
const fs = require("../src/core/fs-helpers");
const { fillTemplate } = require("../src/utils");

module.exports = async function registerUtilsTests({ test, assert }) {
  test("fillTemplate replaces built-in placeholders", () => {
    const template = [
      "{{PROJECT_NAME}}",
      "{{PROJECT_DESCRIPTION}}",
      "{{TECH_STACK}}",
      "{{EXTRAS}}",
      "{{TARGET_AUDIENCE}}",
      "{{INSTALL_COMMAND}}",
      "{{DEV_COMMAND}}",
      "{{TEST_COMMAND}}",
      "{{LINT_COMMAND}}",
      "{{PROJECT_STRUCTURE}}",
      "{{PLAN_WORKFLOW_GUIDANCE}}",
      "{{REVIEW_WORKFLOW_GUIDANCE}}",
      "{{COMMIT_WORKFLOW_GUIDANCE}}",
    ].join("\n");

    const output = fillTemplate(template, {
      projectName: "demo-app",
      projectDescription: "A demo app",
      stack: "Node.js",
      extras: ["Docker", "PostgreSQL"],
      targetAudience: "Developers",
      installCommand: "npm install",
      devCommand: "npm run dev",
      testCommand: "npm test",
      lintCommand: "npm run lint",
      projectStructure: "src/\n  └── index.js",
      planWorkflowGuidance: "Plan hint",
      reviewWorkflowGuidance: "Review hint",
      commitWorkflowGuidance: "Commit hint",
    });

    assert.ok(output.includes("demo-app"));
    assert.ok(output.includes("A demo app"));
    assert.ok(output.includes("Node.js"));
    assert.ok(output.includes("- Docker\n- PostgreSQL"));
    assert.ok(output.includes("Developers"));
    assert.ok(output.includes("npm install"));
    assert.ok(output.includes("npm run dev"));
    assert.ok(output.includes("npm test"));
    assert.ok(output.includes("npm run lint"));
    assert.ok(output.includes("src/\n  └── index.js"));
    assert.ok(output.includes("Plan hint"));
    assert.ok(output.includes("Review hint"));
    assert.ok(output.includes("Commit hint"));
  });

  test("fillTemplate lets templateVariables override built-in placeholders", () => {
    const output = fillTemplate("{{PROJECT_NAME}} {{PLAN_WORKFLOW_GUIDANCE}}", {
      projectName: "ignored",
      planWorkflowGuidance: "from-context",
      templateVariables: {
        PROJECT_NAME: "from-var",
        PLAN_WORKFLOW_GUIDANCE: "override-hint",
      },
    });

    assert.ok(output.includes("from-var"));
    assert.ok(output.includes("override-hint"));
  });

  test("fillTemplate uses fallback text for empty extras", () => {
    const output = fillTemplate("{{EXTRAS}}", { extras: [] });
    assert.strictEqual(output, "<!-- Add key dependencies here -->");
  });

  test("fillTemplate applies custom templateVariables", () => {
    const output = fillTemplate("Owner: {{TEAM_NAME}}", {
      templateVariables: {
        TEAM_NAME: "Platform Team",
      },
    });

    assert.strictEqual(output, "Owner: Platform Team");
  });

  test("fillTemplate leaves unknown tokens untouched", () => {
    const output = fillTemplate("Known {{PROJECT_NAME}} Unknown {{UNDEFINED_KEY}}", {
      projectName: "demo",
    });

    assert.strictEqual(output, "Known demo Unknown {{UNDEFINED_KEY}}");
  });

  test("fillTemplate renders every token in a single pass", () => {
    const output = fillTemplate(
      "{{PROJECT_NAME}} {{PROJECT_NAME}} {{PROJECT_NAME}}",
      { projectName: "x" },
    );
    assert.strictEqual(output, "x x x");
  });

  test("fillTemplate resolves placeholders in shipped templates", async () => {
    const templatesRoot = path.join(__dirname, "..", "templates");
    const filePaths = [
      path.join(templatesRoot, "shared", "memory-bank", "projectbrief.md"),
      path.join(templatesRoot, "shared", "memory-bank", "techContext.md"),
      path.join(templatesRoot, "cursor", "AGENTS.md"),
      path.join(templatesRoot, "windsurf", "AGENTS.md"),
      path.join(templatesRoot, "claude-code", "AGENTS.md"),
      path.join(templatesRoot, "cline", ".clinerules", "workflows", "plan.md"),
    ];

    for (const filePath of filePaths) {
      const template = await fs.readFile(filePath, "utf-8");
      const output = fillTemplate(template, {
        projectName: "sample-project",
        projectDescription: "Sample description",
        stack: "Node.js",
        extras: ["Docker"],
        targetAudience: "Engineers",
        installCommand: "npm install",
        devCommand: "npm run dev",
        testCommand: "npm test",
        lintCommand: "npm run lint",
        projectStructure: "src/\n  └── index.js",
        planWorkflowGuidance: "",
        reviewWorkflowGuidance: "",
        commitWorkflowGuidance: "",
      });

      assert.strictEqual(
        /\{\{[A-Z_]+\}\}/.test(output),
        false,
        `Unresolved placeholder found in ${path.basename(filePath)}`,
      );
    }
  });
};

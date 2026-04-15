const {
  getReadyProviderNames,
  validateProviderDefinition,
  validateProviderManifest,
  validateReadyProviderManifests,
} = require("../src/providers");

module.exports = async function registerProviderTests({ test, assert }) {
  test("validateProviderManifest passes for all ready providers", () => {
    for (const providerName of getReadyProviderNames()) {
      const validation = validateProviderManifest(providerName, {
        checkTemplateSources: true,
      });
      assert.strictEqual(
        validation.valid,
        true,
        `Expected ${providerName} manifest to be valid:\n${validation.errors.join("\n")}`,
      );
    }
  });

  test("validateProviderDefinition detects duplicate target paths", () => {
    const providerMap = {
      mock: {
        ready: true,
        templateDir: "mock",
        files: [
          { source: "a.md", target: "docs/a.md" },
          { source: "b.md", target: "docs/a.md" },
        ],
      },
    };

    const errors = validateProviderDefinition(
      "mock",
      providerMap.mock,
      providerMap,
    );

    assert.ok(
      errors.some((error) => error.includes('duplicate target path "docs/a.md"')),
      `Expected duplicate target path error, got:\n${errors.join("\n")}`,
    );
  });

  test("validateProviderDefinition detects ready flag consistency issues", () => {
    const providerMap = {
      broken: {
        ready: "yes",
        templateDir: "broken",
        files: [{ source: "a.md", target: "docs/a.md" }],
      },
    };

    const errors = validateProviderDefinition(
      "broken",
      providerMap.broken,
      providerMap,
    );

    assert.ok(
      errors.some((error) => error.includes('must define a boolean "ready" flag')),
      `Expected ready flag consistency error, got:\n${errors.join("\n")}`,
    );
  });

  test("validateProviderDefinition detects missing template sources for ready providers", () => {
    const providerMap = {
      mock: {
        ready: true,
        templateDir: "__missing_provider__",
        files: [{ source: "missing.md", target: "docs/missing.md" }],
      },
      __missing_provider__: {
        ready: true,
        templateDir: "__missing_provider__",
        files: [{ source: "missing.md", target: "docs/missing.md" }],
      },
    };

    const errors = validateProviderDefinition(
      "mock",
      providerMap.mock,
      providerMap,
      { checkTemplateSources: true },
    );

    assert.ok(
      errors.some((error) => error.includes("missing template source")),
      `Expected missing template source error, got:\n${errors.join("\n")}`,
    );
  });

  test("validateProviderDefinition detects unknown sourceProvider references", () => {
    const providerMap = {
      mock: {
        ready: true,
        templateDir: "mock",
        files: [
          {
            source: "memory-bank/projectbrief.md",
            target: "memory-bank/projectbrief.md",
            sourceProvider: "does-not-exist",
          },
        ],
      },
    };

    const errors = validateProviderDefinition(
      "mock",
      providerMap.mock,
      providerMap,
      { checkTemplateSources: true },
    );

    assert.ok(
      errors.some((error) => error.includes("unknown sourceProvider")),
      `Expected unknown sourceProvider error, got:\n${errors.join("\n")}`,
    );
  });

  test("validateReadyProviderManifests passes for current ready providers", () => {
    const validation = validateReadyProviderManifests({
      checkTemplateSources: true,
    });

    assert.strictEqual(validation.valid, true);
    assert.deepStrictEqual(validation.errors, []);
  });
};

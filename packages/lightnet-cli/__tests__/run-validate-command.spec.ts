import { beforeEach, describe, expect, test, vi } from "vitest"

import { runValidateCommand } from "../src/commands/translations/validate-command"

const {
  assertLightnetVersion,
  detectPackageManager,
  runDiscoveryBuild,
  readDiscoveryArtifacts,
  buildValidationReport,
} = vi.hoisted(() => ({
  assertLightnetVersion: vi.fn(),
  detectPackageManager: vi.fn(),
  runDiscoveryBuild: vi.fn(),
  readDiscoveryArtifacts: vi.fn(),
  buildValidationReport: vi.fn(),
}))

vi.mock("../src/core/project/assert-lightnet-version", () => ({
  assertLightnetVersion,
}))

vi.mock("../src/core/build/detect-package-manager", () => ({
  detectPackageManager,
}))

vi.mock("../src/core/build/run-discovery-build", () => ({
  runDiscoveryBuild,
}))

vi.mock("../src/core/discovery/read-discovery-artifacts", () => ({
  readDiscoveryArtifacts,
}))

vi.mock("../src/core/validate/build-validation-report", () => ({
  buildValidationReport,
}))

describe("runValidateCommand", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    readDiscoveryArtifacts.mockResolvedValue({
      metadata: {
        defaultLocale: "en",
        locales: ["en", "de"],
      },
      records: [{ key: "home.title", type: "user", values: { en: "Home" } }],
    })
    buildValidationReport.mockReturnValue({
      hasMissingTranslations: true,
      missingCounts: { en: 0, de: 1 },
      text: "report",
    })
  })

  test("Should reuse artifacts when build is disabled", async () => {
    const result = await runValidateCommand({
      build: false,
      lightnetBuiltins: false,
      root: "/repo",
      verbose: false,
    })

    expect(result).toEqual({
      hasMissingTranslations: true,
      missingCounts: { en: 0, de: 1 },
      text: "report",
    })
    expect(runDiscoveryBuild).not.toHaveBeenCalled()
    expect(buildValidationReport).toHaveBeenCalledWith({
      includeBuiltIns: false,
      metadata: {
        defaultLocale: "en",
        locales: ["en", "de"],
      },
      records: [{ key: "home.title", type: "user", values: { en: "Home" } }],
    })
  })

  test("Should run discovery build when enabled", async () => {
    detectPackageManager.mockResolvedValue("npm")

    await runValidateCommand({
      build: true,
      lightnetBuiltins: true,
      root: "/repo",
      verbose: true,
    })

    expect(detectPackageManager).toHaveBeenCalledWith("/repo")
    expect(runDiscoveryBuild).toHaveBeenCalledWith({
      packageManager: "npm",
      root: "/repo",
      verbose: true,
    })
  })
})

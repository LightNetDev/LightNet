import { beforeEach, describe, expect, test, vi } from "vitest"

import { runExportCommand } from "../src/commands/translations/export-command"
import { LightnetCliError } from "../src/core/errors"

const {
  assertLightnetVersion,
  detectPackageManager,
  runDiscoveryBuild,
  readDiscoveryArtifacts,
  buildExportDocument,
} = vi.hoisted(() => ({
  assertLightnetVersion: vi.fn(),
  detectPackageManager: vi.fn(),
  runDiscoveryBuild: vi.fn(),
  readDiscoveryArtifacts: vi.fn(),
  buildExportDocument: vi.fn(),
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

vi.mock("../src/core/export/build-export-document", () => ({
  buildExportDocument,
}))

describe("runExportCommand", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    readDiscoveryArtifacts.mockResolvedValue({
      metadata: {
        defaultLocale: "en",
        locales: ["en", "de"],
      },
      records: [],
    })
    buildExportDocument.mockReturnValue("yaml-output")
  })

  test("Should reuse artifacts when build is disabled", async () => {
    const output = await runExportCommand({
      build: false,
      locale: "de",
      missingOnly: false,
      root: "/repo",
      verbose: false,
    })

    expect(output).toBe("yaml-output")
    expect(assertLightnetVersion).toHaveBeenCalled()
    expect(detectPackageManager).not.toHaveBeenCalled()
    expect(runDiscoveryBuild).not.toHaveBeenCalled()
    expect(buildExportDocument).toHaveBeenCalledWith({
      locale: "de",
      metadata: {
        defaultLocale: "en",
        locales: ["en", "de"],
      },
      missingOnly: false,
      records: [],
    })
  })

  test("Should run discovery build when enabled", async () => {
    detectPackageManager.mockResolvedValue("pnpm")

    await runExportCommand({
      build: true,
      locale: "de",
      missingOnly: true,
      root: "/repo",
      verbose: true,
    })

    expect(detectPackageManager).toHaveBeenCalledWith("/repo")
    expect(runDiscoveryBuild).toHaveBeenCalledWith({
      packageManager: "pnpm",
      root: "/repo",
      verbose: true,
    })
  })

  test("Should fail for unknown locales", async () => {
    await expect(
      runExportCommand({
        build: false,
        locale: "fr",
        missingOnly: false,
        root: "/repo",
        verbose: false,
      }),
    ).rejects.toThrow(
      new LightnetCliError('Unknown locale "fr". Expected one of: en, de.'),
    )
  })
})

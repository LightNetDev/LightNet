import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { detectPackageManager } from "../../core/build/detect-package-manager.js"
import { runDiscoveryBuild } from "../../core/build/run-discovery-build.js"
import { readDiscoveryArtifacts } from "../../core/discovery/read-discovery-artifacts.js"
import { LightnetCliError } from "../../core/errors.js"
import { buildExportDocument } from "../../core/export/build-export-document.js"
import { assertLightnetVersion } from "../../core/project/assert-lightnet-version.js"
import type { ExportCommandOptions } from "../../core/types.js"

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..")

export const runExportCommand = async (options: ExportCommandOptions) => {
  await assertLightnetVersion(options.root, packageRoot)

  if (options.build) {
    const packageManager = await detectPackageManager(options.root)
    await runDiscoveryBuild({
      packageManager,
      root: options.root,
      verbose: options.verbose,
    })
  }

  const { metadata, records } = await readDiscoveryArtifacts(options.root)

  if (!metadata.locales.includes(options.locale)) {
    throw new LightnetCliError(
      `Unknown locale "${options.locale}". Expected one of: ${metadata.locales.join(", ")}.`,
    )
  }

  return buildExportDocument({
    locale: options.locale,
    metadata,
    missingOnly: options.missingOnly,
    records,
  })
}

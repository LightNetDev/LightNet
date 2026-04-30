import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { detectPackageManager } from "../../core/build/detect-package-manager.js"
import { runDiscoveryBuild } from "../../core/build/run-discovery-build.js"
import { readDiscoveryArtifacts } from "../../core/discovery/read-discovery-artifacts.js"
import { assertLightnetVersion } from "../../core/project/assert-lightnet-version.js"
import type { ValidateCommandOptions } from "../../core/types.js"
import { buildValidationReport } from "../../core/validate/build-validation-report.js"

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..")

export const runValidateCommand = async (options: ValidateCommandOptions) => {
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

  return buildValidationReport({
    includeBuiltIns: options.lightnetBuiltins,
    metadata,
    records,
  })
}

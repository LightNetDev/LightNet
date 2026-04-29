import { spawn } from "node:child_process"

import { LightnetCliError } from "../errors.js"
import type { SupportedPackageManager } from "./detect-package-manager.js"

const buildCommands: Record<SupportedPackageManager, string[]> = {
  npm: ["npm", "exec", "astro", "build"],
  pnpm: ["pnpm", "exec", "astro", "build"],
}

export const runDiscoveryBuild = async ({
  packageManager,
  root,
  verbose,
}: {
  packageManager: SupportedPackageManager
  root: string
  verbose: boolean
}) => {
  const [command, ...args] = buildCommands[packageManager]

  await new Promise<void>((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      env: {
        ...process.env,
        LIGHTNET_TRANSLATION_DISCOVERY: "1",
      },
      stdio: verbose ? "inherit" : "pipe",
    })

    let output = ""

    if (!verbose) {
      child.stdout?.on("data", (chunk) => {
        output += chunk.toString()
      })
      child.stderr?.on("data", (chunk) => {
        output += chunk.toString()
      })
    }

    child.on("exit", (code) => {
      if (code === 0) {
        resolvePromise()
        return
      }

      reject(
        new LightnetCliError(
          output ? `Astro build failed.\n\n${output}` : "Astro build failed.",
        ),
      )
    })
  })
}

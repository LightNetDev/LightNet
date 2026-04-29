import { readFile } from "node:fs/promises"
import { resolve } from "node:path"

import { ZodError } from "zod"

import { LightnetCliError } from "../errors.js"
import { discoveryMetadataSchema } from "./discovery-schema.js"
import { parseJsonl } from "./parse-jsonl.js"

export const readDiscoveryArtifacts = async (root: string) => {
  const cacheRoot = resolve(root, "node_modules", ".cache", "lightnet")

  try {
    const [metadataContent, recordsContent] = await Promise.all([
      readFile(resolve(cacheRoot, "languages.json"), "utf-8"),
      readFile(resolve(cacheRoot, "translations.jsonl"), "utf-8"),
    ])

    const metadata = discoveryMetadataSchema.parse(JSON.parse(metadataContent))
    const records = parseJsonl(recordsContent)

    if (records.length === 0) {
      throw new LightnetCliError(
        "Discovery build completed without any translation records.",
      )
    }

    return { metadata, records }
  } catch (error) {
    if (error instanceof LightnetCliError) {
      throw error
    }

    if (error instanceof ZodError || error instanceof SyntaxError) {
      throw new LightnetCliError(
        "Invalid translation discovery artifacts. Re-run without --no-build.",
      )
    }

    throw new LightnetCliError(
      "Missing translation discovery artifacts. Run without --no-build first.",
    )
  }
}

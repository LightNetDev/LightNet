import { readFile } from "node:fs/promises"
import { resolve } from "node:path"

import { z } from "zod"

const packageJsonSchema = z.object({
  dependencies: z.record(z.string(), z.string()).optional(),
  devDependencies: z.record(z.string(), z.string()).optional(),
  packageManager: z.string().optional(),
})

export const readProjectPackage = async (
  root: string,
  options: { optional?: boolean } = {},
) => {
  const filePath = resolve(root, "package.json")
  try {
    const content = await readFile(filePath, "utf-8")
    return packageJsonSchema.parse(JSON.parse(content))
  } catch (error) {
    if (options.optional) {
      return
    }

    throw error
  }
}

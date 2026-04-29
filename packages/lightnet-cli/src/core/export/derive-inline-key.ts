import type { DiscoveryRecord } from "../types.js"

const toSegment = (value: string) =>
  value
    .replace(/^src\//, "")
    .replace(/^astro\.config\.[^.]+$/, "config")
    .replace(/\.[^.]+$/, "")
    .replace(/[\\/]/g, ".")

export const deriveInlineKey = (record: DiscoveryRecord) => {
  if (record.sourceFile) {
    const sourcePath = toSegment(record.sourceFile)
    const objectPath = record.objectPath?.join(".")
    return `ln.inline.${sourcePath}${objectPath ? `.${objectPath}` : ""}`
  }

  const fallback = record.callsite
    ?.replace(/[\\/]/g, ".")
    .replace(/[^a-zA-Z0-9.:-]/g, "")
    .replace(/:+/g, ".")

  return `ln.inline.${fallback ?? record.key}`
}

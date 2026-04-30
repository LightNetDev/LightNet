import type { DiscoveryRecord } from "../types.js"

const contentCollectionPrefixes = new Set([
  "categories",
  "media",
  "media-collections",
  "media-types",
])

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

  if (record.objectPath?.length) {
    const [prefix, ...rest] = record.objectPath
    if (prefix === "config") {
      return `ln.inline.config${rest.length ? `.${rest.join(".")}` : ""}`
    }

    if (contentCollectionPrefixes.has(prefix)) {
      return `ln.inline.content.${record.objectPath.join(".")}`
    }

    return `ln.inline.${record.objectPath.join(".")}`
  }

  const fallback = record.callsite
    ?.replace(/[\\/]/g, ".")
    .replace(/[^a-zA-Z0-9.:-]/g, "")
    .replace(/:+/g, ".")

  return `ln.inline.${fallback ?? record.key}`
}

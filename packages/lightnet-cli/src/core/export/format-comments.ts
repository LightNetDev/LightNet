import type { DiscoveryMetadata, DiscoveryRecord } from "../types.js"

const toSingleLine = (value: string) => value.replace(/\n/g, "\\n")

export const formatComments = (
  record: DiscoveryRecord,
  metadata: DiscoveryMetadata,
) => {
  const source = record.sourceFile
    ? `${record.sourceFile}${record.objectPath?.length ? `#${record.objectPath.join(".")}` : ""}`
    : (record.callsite ?? record.key)

  const orderedLocales = [
    metadata.defaultLocale,
    ...metadata.locales.filter((locale) => locale !== metadata.defaultLocale),
    ...Object.keys(record.values).filter(
      (locale) =>
        locale !== metadata.defaultLocale && !metadata.locales.includes(locale),
    ),
  ]

  const values = orderedLocales
    .map((locale) => [locale, record.values[locale]] as const)
    .filter(([, value]) => value !== undefined)

  const hasMultiline = values.some(([, value]) => value?.includes("\n"))

  const lines = [`# source: ${source}`]

  if (!hasMultiline) {
    lines.push(
      `# translations: ${values.map(([locale, value]) => `${locale}=${toSingleLine(value ?? "")}`).join(" | ")}`,
    )
    return lines
  }

  lines.push("# translations:")
  for (const [locale, value] of values) {
    lines.push(`# ${locale}`)
    for (const line of (value ?? "").split("\n")) {
      lines.push(`# ${line}`)
    }
    lines.push("#")
  }

  return lines
}

import { mergeDiscoveryRecords } from "../discovery/merge-discovery-records.js"
import type { DiscoveryMetadata, DiscoveryRecord } from "../types.js"

export const buildValidationReport = ({
  includeBuiltIns,
  metadata,
  records,
}: {
  includeBuiltIns: boolean
  metadata: DiscoveryMetadata
  records: DiscoveryRecord[]
}) => {
  const mergedRecords = mergeDiscoveryRecords(records)
  const filteredRecords = includeBuiltIns
    ? mergedRecords
    : mergedRecords.filter((record) => record.type !== "built-in")

  const missingCounts = Object.fromEntries(
    metadata.locales.map((locale) => [
      locale,
      filteredRecords.filter((record) => !record.values[locale]).length,
    ]),
  )

  const lines = [
    "Missing translations by locale:",
    ...metadata.locales.map(
      (locale) => `- ${locale}: ${missingCounts[locale]}`,
    ),
    "",
    "Use `lightnet-cli translations export <locale> --missing-only` to export missing translations.",
  ]

  return {
    hasMissingTranslations: Object.values(missingCounts).some(
      (count) => count > 0,
    ),
    missingCounts,
    text: lines.join("\n"),
  }
}

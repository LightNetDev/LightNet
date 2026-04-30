import { mergeDiscoveryRecords } from "../discovery/merge-discovery-records.js"
import type { DiscoveryMetadata, DiscoveryRecord } from "../types.js"
import { deriveInlineKey } from "./derive-inline-key.js"
import { emitYaml } from "./emit-yaml.js"
import { formatComments } from "./format-comments.js"

const groupOrder = ["built-in", "user", "inline"] as const

const getKey = (record: DiscoveryRecord) => {
  if (record.type === "inline") {
    return deriveInlineKey(record)
  }
  return record.key
}

export const buildExportDocument = ({
  locale,
  metadata,
  missingOnly,
  records,
}: {
  locale: string
  metadata: DiscoveryMetadata
  missingOnly: boolean
  records: DiscoveryRecord[]
}) => {
  const mergedRecords = mergeDiscoveryRecords(records)

  const blocks = groupOrder.flatMap((group) =>
    mergedRecords
      .filter((record) => record.type === group)
      .filter((record) => !missingOnly || !record.values[locale])
      .sort((a, b) => getKey(a).localeCompare(getKey(b)))
      .map((record) => {
        const key = getKey(record)
        const value = record.values[locale] ?? ""
        return [
          ...formatComments(record, metadata),
          emitYaml([[key, value]]),
        ].join("\n")
      }),
  )

  return blocks.join("\n\n")
}

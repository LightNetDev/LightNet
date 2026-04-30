import { deriveInlineKey } from "../export/derive-inline-key.js"
import type { DiscoveryRecord } from "../types.js"

const getRecordIdentity = (record: DiscoveryRecord) =>
  record.type === "inline" ? deriveInlineKey(record) : record.key

const mergeRecordPair = (
  primary: DiscoveryRecord,
  secondary: DiscoveryRecord,
) => ({
  ...primary,
  values: {
    ...secondary.values,
    ...primary.values,
  },
  sourceFile: primary.sourceFile ?? secondary.sourceFile,
  objectPath: primary.objectPath ?? secondary.objectPath,
  callsite: primary.callsite ?? secondary.callsite,
})

const preferRecord = (current: DiscoveryRecord, next: DiscoveryRecord) => {
  if (current.sourceFile && !next.sourceFile) {
    return mergeRecordPair(current, next)
  }

  if (!current.sourceFile && next.sourceFile) {
    return mergeRecordPair(next, current)
  }

  return mergeRecordPair(current, next)
}

export const mergeDiscoveryRecords = (records: DiscoveryRecord[]) =>
  Object.values(
    records.reduce<Record<string, DiscoveryRecord>>((collected, record) => {
      const identity = getRecordIdentity(record)
      const existing = collected[identity]

      if (!existing) {
        collected[identity] = record
        return collected
      }

      collected[identity] = preferRecord(existing, record)
      return collected
    }, {}),
  )

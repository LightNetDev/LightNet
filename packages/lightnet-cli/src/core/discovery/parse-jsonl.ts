import { discoveryRecordSchema } from "./discovery-schema.js"

export const parseJsonl = (content: string) =>
  content
    .split("\n")
    .filter(Boolean)
    .map((line) => discoveryRecordSchema.parse(JSON.parse(line)))

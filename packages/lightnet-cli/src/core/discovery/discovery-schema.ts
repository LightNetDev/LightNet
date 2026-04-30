import { z } from "zod"

export const discoveryMetadataSchema = z.object({
  defaultLocale: z.string(),
  locales: z.array(z.string()),
})

export const discoveryRecordSchema = z.object({
  type: z.enum(["built-in", "inline", "user"]),
  key: z.string(),
  sourceFile: z.string().optional(),
  objectPath: z.array(z.string()).optional(),
  callsite: z.string().optional(),
  values: z.record(z.string(), z.string().optional()),
})

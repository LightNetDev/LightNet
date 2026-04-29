export type DiscoveryRecordType = "built-in" | "inline" | "user"

export type DiscoveryRecord = {
  type: DiscoveryRecordType
  key: string
  sourceFile?: string
  objectPath?: string[]
  callsite?: string
  values: Record<string, string | undefined>
}

export type DiscoveryMetadata = {
  defaultLocale: string
  locales: string[]
}

export type ExportCommandOptions = {
  root: string
  locale: string
  build: boolean
  missingOnly: boolean
  verbose: boolean
}

export type ValidateCommandOptions = {
  root: string
  build: boolean
  verbose: boolean
  lightnetBuiltins: boolean
}

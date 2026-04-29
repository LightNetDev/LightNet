export type TranslationRecord = {
  type: "built-in" | "inline" | "user"
  key: string
  values: Record<string, string | undefined>
  sourceFile?: string
  objectPath?: string[]
  callsite?: string
}

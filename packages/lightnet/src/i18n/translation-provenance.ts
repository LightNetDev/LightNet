export type TranslationProvenance = {
  sourceFile?: string
  objectPath?: string[]
  callsite?: string
}

const translationProvenanceSymbol = Symbol.for("lightnet.translationProvenance")

export const setTranslationProvenance = <T extends object>(
  value: T,
  provenance: TranslationProvenance,
) => {
  Object.defineProperty(value, translationProvenanceSymbol, {
    value: provenance,
    enumerable: false,
    configurable: true,
  })

  return value
}

export const getTranslationProvenance = (value: unknown) => {
  if (!value || typeof value !== "object") {
    return
  }

  return (value as Record<symbol, TranslationProvenance>)[
    translationProvenanceSymbol
  ]
}

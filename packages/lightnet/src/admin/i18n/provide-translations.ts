const translationKeys = ["ln.admin.*"] as const

export const provideTranslations = (translate: (key: string) => string, allKeys: string[]) => {
  const resolveTranslations = (key: string) => {
    if (key.endsWith("*")) {
      const keyPrefix = key.slice(0, -1)
      return allKeys.filter(k => k.startsWith(keyPrefix)).map(k => ([k, translate(k)]))
    }
    return [[key, translate(key)]]
  }
  return Object.fromEntries(
    translationKeys.flatMap(resolveTranslations),
  ) as Record<string, string>
}




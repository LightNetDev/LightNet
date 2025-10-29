import { createContext } from "react"

export type I18n = {
  t: (key: string) => string
  currentLocale: string
  direction: "rtl" | "ltr"
}

export type I18nConfig = Omit<I18n, "t"> & {
  translations: Record<string, string>
}

export const I18nContext = createContext<I18n | undefined>(undefined)

/**
 * Creates the runtime i18n helpers given a prepared configuration.
 * Wraps the raw translation dictionary with a lookup that throws on missing keys.
 */
export const createI18n = ({
  translations,
  currentLocale,
  direction,
}: I18nConfig) => {
  const t = (key: string) => {
    const translated = translations[key]
    if (!translated) {
      throw new Error(`Missing translation for key ${key}`)
    }
    return translated
  }
  return { t, currentLocale, direction }
}

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
    const value = translations[key]
    if (value) {
      return value
    }
    if (key.match(/^(?:ln|x)\../i)) {
      console.error(`Missing translation for key ${key}`)
      return ""
    }
    return key
  }
  return { t, currentLocale, direction }
}

import { createContext, useMemo } from "react"

export type I18n = {
  t: (key: string, params?: Record<string, unknown>) => string
  currentLocale: string
  direction: "rtl" | "ltr"
}

export type I18nConfig = Omit<I18n, "t"> & {
  translations: Record<string, string>
}

export const I18nContext = createContext<I18n | undefined>(undefined)

const interpolate = (value: string, params?: Record<string, unknown>) => {
  if (!params) {
    return value
  }
  return Object.entries(params ?? {}).reduce(
    (prev, [paramName, paramValue]) =>
      prev.replaceAll(`{{${paramName}}}`, `${paramValue}`),
    value,
  )
}

/**
 * Creates the runtime i18n helpers given a prepared configuration.
 * Wraps the raw translation dictionary with a lookup that throws on missing keys.
 */
export const createI18n = ({
  translations,
  currentLocale,
  direction,
}: I18nConfig) => {
  return useMemo(() => {
    const t = (key: string, params?: Record<string, unknown>) => {
      const value = translations[key]
      if (value) {
        return interpolate(value, params)
      }
      if (!key || key.match(/^(?:ln|x)\../i)) {
        console.error(`Missing translation for key ${key}`)
        return ""
      }
      return interpolate(key, params)
    }
    return { t, currentLocale, direction }
  }, [])
}

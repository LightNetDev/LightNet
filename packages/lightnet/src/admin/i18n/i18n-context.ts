import { createContext } from "react";


export type I18n = {
  t: (key: string) => string
}

export const I18nContext = createContext<I18n>({ t: (key) => key })

export const createI18n = (translations: Record<string, string>) => {
  const t = (key: string) => {
    const translated = translations[key]
    if (!translated) {
      throw new Error(`Missing translation for key ${key}`)
    }
    return translated
  }
  return ({ t })
}


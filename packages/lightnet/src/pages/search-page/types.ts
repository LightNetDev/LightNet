import type { Language } from "../../i18n/language"

export type MediaType = {
  id: string
  label: string
  icon: string
}

export type TranslatedLanguage = Language & { name: string }

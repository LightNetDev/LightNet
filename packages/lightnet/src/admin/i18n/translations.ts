export const builtInAdminTranslations = {
  en: () => import("./translations/en.yml?raw"),
} as const

export type AdminTranslationKey = "ln.admin.edit"

import type { Field, ObjectField } from "@sveltia/cms"
import config from "virtual:lightnet/config"
import adminConfig from "virtual:lightnet/sveltiaAdminConfig"

type Options = Partial<ObjectField> & {
  name: string
}

const summaryLocale = adminConfig.experimental.summaryLocale

const locales = [
  config.defaultLocale,
  ...config.locales.filter((l) => l !== config.defaultLocale),
].map((locale) => ({
  name: locale,
  label: locale,
}))

export const inlineTranslation = (options: Options): Field => ({
  summary: `{{${summaryLocale ?? config.defaultLocale}}}`,
  ...options,
  widget: "object",
  fields: locales.map((locale) => ({
    ...locale,
    widget: "string",
    required:
      locale.name === config.defaultLocale || locale.name === summaryLocale,
  })),
})

export const translatedLabel = (fieldName = "label") => {
  return `{{${fieldName}.${summaryLocale ?? config.defaultLocale}}}`
}

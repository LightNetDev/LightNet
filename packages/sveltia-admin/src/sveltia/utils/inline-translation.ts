import type { Field, ObjectField } from "@sveltia/cms"
import config from "virtual:lightnet/config"

const languages = Object.fromEntries(
  config.languages.map((lang) => [lang.code, lang]),
)

type Options = Partial<ObjectField> & {
  name: string
}

const locales = [
  config.defaultLocale,
  ...config.locales.filter((l) => l !== config.defaultLocale),
].map((locale) => ({
  name: locale,
  label: languages[locale].label[config.defaultLocale],
}))

export const inlineTranslation = (options: Options): Field => ({
  summary: `{{${config.defaultLocale}}}`,
  ...options,
  widget: "object",
  fields: locales.map((locale) => ({
    ...locale,
    widget: "string",
    required: locale.name === config.defaultLocale,
  })),
})

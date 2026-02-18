import YAML from "yaml"

import { configSchema } from "./config"

/**
 * Load config from json files in config folder in /src/config
 * @returns config
 */
export const loadConfig = async () => {
  const settings = await loadSettings()
  const translations = await loadTranslations()
  const languages = await loadLanguages()
  return configSchema.partial().parse({ ...settings, translations, languages })
}

const loadSettings = async () => {
  const settings: Record<string, unknown> = {}
  for await (const [_, settingsImport] of Object.entries(
    import.meta.glob("/src/config/*.json", {
      import: "default",
    }),
  )) {
    Object.assign(settings, await settingsImport())
  }
  return settings
}

const loadLanguages = async () => {
  const languages: Record<string, unknown> = {}
  for await (const [path, languageImport] of Object.entries(
    import.meta.glob("/src/config/languages/*.json", {
      import: "default",
    }),
  )) {
    const [fileName] = path.split("/").slice(-1)
    const lang = fileName.replace(/\.json/, "")
    languages[lang] = await languageImport()
  }
  return languages
}

const loadTranslations = async () => {
  const translations: Record<string, unknown> = {}
  for await (const [path, translationImport] of Object.entries(
    import.meta.glob(
      [
        "/src/translations/*.(yml|yaml)",
        "/src/config/translations/*.(yml|yaml)",
      ],
      {
        query: "?raw",
        import: "default",
      },
    ),
  )) {
    const [fileName] = path.split("/").slice(-1)
    const lang = fileName.replace(/\.ya?ml/, "")
    translations[lang] = YAML.parse((await translationImport()) as string)
  }
  return translations
}

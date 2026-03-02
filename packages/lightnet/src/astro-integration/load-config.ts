import YAML from "yaml"

import { verifySchema } from "../utils/verify-schema"
import { configSchema } from "./config"

/**
 * Loads LightNet configuration from split files in `src/config`.
 *
 * This helper lets projects keep a LightNet config in json or yaml files instead of
 * placing everything inline in `astro.config.*`.
 *
 * It collects and validates:
 * - base settings from `/src/config/*.json`
 * - translations from `/src/config/translations/*.(yml|yaml)`
 *
 * Typical usage:
 * ```ts
 * import lightnet, { loadConfig } from "lightnet"
 *
 * export default defineConfig({
 *   integrations: [lightnet(await loadConfig())],
 * })
 * ```
 *
 * @returns A partially validated LightNet config that can be passed to `lightnet(...)`.
 */
export const loadConfig = async () => {
  const settings = await loadSettings()
  const translations = await loadTranslations()
  return verifySchema(
    configSchema.partial(),
    { ...settings, translations },
    "Invalid LightNet config loaded from /src/config",
    "Fix the configuration issues listed below. Check /src/config/*.json and /src/config/translations/*.(yml|yaml):",
  )
}

const loadSettings = async () => {
  // Merge all top-level config JSON files into one object.
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

const loadTranslations = async () => {
  // Map translation filenames to locale keys and parse YAML into objects.
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

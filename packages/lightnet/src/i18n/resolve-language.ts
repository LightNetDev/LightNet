import { AstroError } from "astro/errors"
import { getCollection } from "astro:content"
import i18next from "i18next"

import { languageEntrySchema } from "../content/content-schema"
import { verifySchema } from "../utils/verify-schema"
import type { TranslateFn } from "./translate"

const languages = Object.fromEntries(
  (await loadLanguages()).map((language) => [
    language.data.code,
    language.data,
  ]),
)

export const resolveLanguage = (bcp47: string) => {
  const label = languages[bcp47]?.label

  if (!label) {
    throw new AstroError(
      `Missing language code "${bcp47}"`,
      `To fix the issue, add a language entry at "src/content/languages/${bcp47}.json".`,
    )
  }
  return {
    code: bcp47,
    label,
    direction: i18next.dir(bcp47),
  }
}

export const resolveTranslatedLanguage = (bcp47: string, t: TranslateFn) => {
  const language = resolveLanguage(bcp47)
  return {
    ...language,
    labelText: t(language.label),
  }
}

async function loadLanguages() {
  const languages: unknown[] = await getCollection("languages")
  return languages
    .map((language: unknown) =>
      verifySchema(
        languageEntrySchema,
        language,
        (id) => `Invalid language: "${id}"`,
        (id) => `Fix these issues inside "src/content/languages/${id}.json":`,
      ),
    )
    .map((language) => {
      if (language.id === language.data.code) {
        return language
      }
      throw new AstroError(
        `Language code mismatch for "${language.id}"`,
        `The language file id "${language.id}" must match its "code" value "${language.data.code}". Fix "src/content/languages/${language.id}.json".`,
      )
    })
}

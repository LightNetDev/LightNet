import { AstroError } from "astro/errors"

export const resolveDefaultLocale = ({
  languages,
}: {
  languages: {
    code: string
    isDefaultUILanguage?: boolean
  }[]
}) => {
  const defaultLanguage = languages.find((l) => l.isDefaultUILanguage)
  if (!defaultLanguage) {
    throw new AstroError(
      "No default user interface language has been set",
      "Make sure you have set one language to be the default language by setting the isDefaultUILanguage to `true`.",
    )
  }
  return defaultLanguage.code
}

import { AstroError } from "astro/errors"

export const resolveDefaultLocale = ({
  languages,
}: {
  languages: {
    code: string
    isDefaultSiteLanguage?: boolean
  }[]
}) => {
  const defaultLanguage = languages.find((l) => l.isDefaultSiteLanguage)
  if (!defaultLanguage) {
    throw new AstroError(
      "No default site language has been set",
      "Make sure you have set one language to be the default language by setting the isDefaultSiteLanguage to `true`.",
    )
  }
  return defaultLanguage.code
}

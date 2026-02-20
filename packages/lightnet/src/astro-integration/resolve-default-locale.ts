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
      "No default site language set",
      "To fix the issue, set isDefaultSiteLanguage for one language in the LightNet configuration in your astro.config.mjs file.",
    )
  }
  return defaultLanguage.code
}

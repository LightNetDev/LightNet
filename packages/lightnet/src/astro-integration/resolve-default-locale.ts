import { AstroError } from "astro/errors"

export const resolveDefaultLocale = ({
  languages,
}: {
  languages: Record<
    string,
    {
      isDefaultSiteLanguage?: boolean
    }
  >
}) => {
  const [defaultLanguage] =
    Object.entries(languages).find(([_, l]) => l.isDefaultSiteLanguage) ?? []
  if (!defaultLanguage) {
    throw new AstroError(
      "No default site language set",
      "To fix the issue, set isDefaultSiteLanguage for one language in the LightNet configuration in your astro.config.mjs file.",
    )
  }
  return defaultLanguage
}

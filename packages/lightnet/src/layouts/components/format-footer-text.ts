/**
 * Replaces supported placeholders in localized footer text.
 *
 * Use `{{year}}` to render the current calendar year.
 *
 * @param text Localized footer text from LightNet config.
 * @param currentYear Year to render. Defaults to the current system year.
 */
export const formatFooterText = (
  text: string,
  currentYear = new Date().getFullYear(),
) => {
  return text.replaceAll("{{year}}", String(currentYear))
}

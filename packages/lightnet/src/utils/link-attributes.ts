import { isExternalUrl } from "./is-external-url"

export function getLinkAttributes(href: string) {
  const isExternal = isExternalUrl(href)
  return {
    href,
    target: isExternal ? "_blank" : "_self",
    rel: isExternal ? "noopener noreferrer" : undefined,
  }
}

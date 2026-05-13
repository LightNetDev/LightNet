import config from "virtual:lightnet/config"

import { parseUrl } from "./urls"

/**
 * Test if a given url is outside this site.
 * Will return false if the url is relative or if it
 * starts with the site config from astro config.
 *
 * @param url to test
 * @returns is the url external?
 */
export function isExternalUrl(url: string) {
  const parsedUrl = parseUrl(url)
  if (!parsedUrl) {
    return false
  }

  if (config.internalDomains.includes(parsedUrl.hostname)) {
    return false
  }

  const { SITE: site } = import.meta.env
  if (!site) {
    return true
  }

  const parsedSiteUrl = parseUrl(site)
  if (!parsedSiteUrl) {
    return true
  }

  return !parsedUrl.href.startsWith(parsedSiteUrl.href)
}

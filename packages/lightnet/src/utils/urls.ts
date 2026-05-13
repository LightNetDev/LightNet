export function parseUrl(url: string) {
  try {
    return new URL(url)
  } catch {
    // Support host-like values such as `example.com` without treating plain paths as external.
    if (/^(localhost(?::\d+)?|[^/\s]+\.[^/\s]+)(?:[/?#]|$)/.test(url)) {
      return new URL(`https://${url}`)
    }

    return null
  }
}

export function isAbsoluteUrl(url: string) {
  return !!parseUrl(url)
}

/**
 * Build the single callback URL registered with GitHub from trusted Worker
 * configuration. Request-derived URLs must never be used for this value.
 */
export const getCallbackUrl = (workerOrigin?: string): string | undefined => {
  if (!workerOrigin) return undefined

  try {
    const url = new URL(workerOrigin)
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      workerOrigin !== url.origin
    ) {
      return undefined
    }
    return new URL("/callback", url).toString()
  } catch {
    return undefined
  }
}

const base64UrlEncode = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "")

/** Generate an RFC 7636-compatible, high-entropy PKCE code verifier. */
export const createCodeVerifier = (): string => {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return base64UrlEncode(bytes)
}

/** Derive the S256 challenge that is sent to the authorization server. */
export const createCodeChallenge = async (
  verifier: string,
): Promise<string> => {
  const encodedVerifier = new TextEncoder().encode(verifier)
  const digest = await crypto.subtle.digest("SHA-256", encodedVerifier)
  return base64UrlEncode(new Uint8Array(digest))
}

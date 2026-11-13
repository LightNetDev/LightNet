import { handleAuth } from "./handle-auth"
import { handleCallback } from "./handle-callback"
import { handleRefresh } from "./handle-refresh"
import type { Env } from "./shared/env"

export interface RouteRequestOptions {
  /**
   * Path prefix for the authentication routes, such as `/_auth`. Defaults to
   * the root. Set the CMS backend's `base_url` to the origin followed by this
   * prefix and register `<origin><basePath>/callback` as the GitHub callback
   * URL.
   */
  basePath?: string
}

const segmentPattern = /^[A-Za-z0-9._~-]+$/

/**
 * Normalizes a base path to `""` or `/segment[/segment...]`.
 * Throws for paths that can never match a request path.
 */
const normalizeBasePath = (basePath = "") => {
  const segments = basePath.split("/").filter(Boolean)
  const isValid = segments.every(
    (segment) =>
      segmentPattern.test(segment) && segment !== "." && segment !== "..",
  )
  if (!isValid) {
    throw new Error(
      `Invalid basePath "${basePath}". Use path segments with letters, digits, "-", "_", ".", or "~", such as "/_auth".`,
    )
  }
  return segments.map((segment) => `/${segment}`).join("")
}

/**
 * Routes Sveltia CMS authentication requests to the matching handler.
 *
 * Returns `undefined` when the request does not match an authentication
 * route, so the caller can handle other routes or respond with `404`.
 */
export const routeRequest = async (
  request: Request,
  env: Env,
  { basePath }: RouteRequestOptions = {},
): Promise<Response | undefined> => {
  const prefix = normalizeBasePath(basePath)
  const { method } = request
  const { pathname } = new URL(request.url)
  const matches = (...paths: string[]) =>
    paths.some((path) => pathname === `${prefix}${path}`)

  if (method === "GET" && matches("/auth", "/oauth/authorize")) {
    return handleAuth(request, env)
  }

  if (method === "GET" && matches("/callback", "/oauth/redirect")) {
    return handleCallback(request, env)
  }

  // Sveltia CMS refreshes expiring GitHub App tokens through the same origin.
  if (
    ["POST", "OPTIONS"].includes(method) &&
    matches("/auth", "/oauth/access_token")
  ) {
    return handleRefresh(request, env)
  }

  return undefined
}

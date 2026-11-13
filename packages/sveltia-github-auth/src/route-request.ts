import { handleAuth } from "./handle-auth"
import { handleCallback } from "./handle-callback"
import { handleRefresh } from "./handle-refresh"
import type { Env } from "./shared/env"

/**
 * Routes Sveltia CMS authentication requests to the matching handler. Paths
 * are matched from the root of the request URL.
 *
 * Returns `undefined` when the request does not match an authentication
 * route, so the caller can handle other routes or respond with `404`.
 */
export const routeRequest = async (
  request: Request,
  env: Env,
): Promise<Response | undefined> => {
  const { method } = request
  const { pathname } = new URL(request.url)

  if (method === "GET" && ["/auth", "/oauth/authorize"].includes(pathname)) {
    return handleAuth(request, env)
  }

  if (method === "GET" && ["/callback", "/oauth/redirect"].includes(pathname)) {
    return handleCallback(request, env)
  }

  // Sveltia CMS refreshes expiring GitHub App tokens through the same origin.
  if (
    ["POST", "OPTIONS"].includes(method) &&
    ["/auth", "/oauth/access_token"].includes(pathname)
  ) {
    return handleRefresh(request, env)
  }

  return undefined
}

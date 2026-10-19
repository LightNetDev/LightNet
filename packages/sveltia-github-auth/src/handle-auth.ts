import { z } from "zod"

import {
  hasConfiguredAllowedOrigins,
  isAllowedSiteId,
} from "./shared/allowed-origins"
import type { Env } from "./shared/env"
import { outputHTML } from "./shared/output-html"
import { createCodeChallenge, createCodeVerifier } from "./shared/pkce"

const authQuerySchema = z.object({
  provider: z.literal("github").optional(),
  siteId: z.string().trim().min(1).max(253).optional(),
  scope: z.string().max(256).optional(),
})

const getScope = (requested = "repo,user") => {
  const scopes = (requested ?? "").split(/[\s,]+/).filter(Boolean)
  if (scopes.length === 0) {
    return
  }
  const allowed = ["repo", "public_repo", "user"]
  if (scopes.find((s) => !allowed.includes(s))) {
    return
  }
  return requested
}

export const handleAuth = async (
  request: Request,
  env: Env,
): Promise<Response> => {
  const { searchParams } = new URL(request.url)
  const query = authQuerySchema.safeParse({
    provider: searchParams.get("provider") ?? undefined,
    siteId: searchParams.get("site_id") ?? undefined,
    scope: searchParams.get("scope") ?? undefined,
  })

  if (!query.success || !query.data.provider) {
    return outputHTML({
      env,
      error: "Your Git backend is not supported by the authenticator.",
      errorCode: "UNSUPPORTED_BACKEND",
    })
  }

  const scope = getScope(query.data.scope)
  if (!scope) {
    return outputHTML({
      env,
      error: "The requested GitHub permission is not supported.",
      errorCode: "UNSUPPORTED_SCOPE",
    })
  }

  if (!hasConfiguredAllowedOrigins(env.ALLOWED_ORIGINS)) {
    return outputHTML({
      env,
      error:
        "Allowed origins are not configured. Set ALLOWED_ORIGINS to your site origin.",
      errorCode: "MISCONFIGURED_ORIGINS",
    })
  }

  if (!isAllowedSiteId(query.data.siteId, env.ALLOWED_ORIGINS)) {
    return outputHTML({
      env,
      error: "Your domain is not allowed to use the authenticator.",
      errorCode: "UNSUPPORTED_DOMAIN",
    })
  }

  const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = env
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return outputHTML({
      env,
      error: "OAuth app client ID or secret is not configured.",
      errorCode: "MISCONFIGURED_CLIENT",
    })
  }

  const csrfToken = crypto.randomUUID().replaceAll("-", "")
  const codeVerifier = createCodeVerifier()
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    scope,
    state: csrfToken,
    code_challenge: await createCodeChallenge(codeVerifier),
    code_challenge_method: "S256",
  })

  return new Response("", {
    status: 302,
    headers: {
      Location: `https://github.com/login/oauth/authorize?${params.toString()}`,
      "Set-Cookie": `__Host-oauth-state=github_${csrfToken}_${codeVerifier}; HttpOnly; Path=/; Max-Age=600; SameSite=Lax; Secure`,
    },
  })
}

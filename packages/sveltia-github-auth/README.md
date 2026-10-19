# @lightnet/sveltia-github-auth

Shared GitHub OAuth endpoints for [Sveltia CMS](https://sveltiacms.app/en/).

```sh
pnpm add @lightnet/sveltia-github-auth
```

## Worker usage

Replace the template's local handlers with these imports. Routing stays in your worker:

```ts
import {
  handleAuth,
  handleCallback,
  type Env,
} from "@lightnet/sveltia-github-auth"

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url)

    if (request.method === "GET") {
      if (["/auth", "/oauth/authorize"].includes(pathname)) {
        return handleAuth(request, env)
      }
      if (["/callback", "/oauth/redirect"].includes(pathname)) {
        return handleCallback(request, env)
      }
    }

    return new Response("", { status: 404 })
  },
}
```

Individual imports are also available from `@lightnet/sveltia-github-auth/handle-auth.ts` and `@lightnet/sveltia-github-auth/handle-callback.ts`. Both handlers accept `(request: Request, env: Env)` and return `Promise<Response>`.

## Configuration

Pass these environment values to both handlers:

| Variable               | Value                                                                                                                                                                                                                             |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GITHUB_CLIENT_ID`     | GitHub OAuth app client ID.                                                                                                                                                                                                       |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app secret; store as a worker secret.                                                                                                                                                                                |
| `WORKER_ORIGIN`        | Canonical HTTPS origin of your auth service, without a trailing slash, path, query, fragment, or credentials.                                                                                                                     |
| `ALLOWED_ORIGINS`      | Comma-separated canonical HTTPS origins allowed to receive authentication results. Explicit subdomains and non-default ports must be listed; wildcards are unsupported. Replace the template's `https://example.com` placeholder. |

Register `${WORKER_ORIGIN}/callback` as your GitHub OAuth app callback URL. This fixed URL is used for both authorization and token exchange, including requests routed through aliases. Set your CMS GitHub backend's `base_url` to `WORKER_ORIGIN`.

The authorization endpoint requires `provider=github` and `site_id` matching an allowed origin's hostname. Optional `scope` defaults to `repo,user`; only `repo`, `public_repo`, and `user` are supported.

The flow uses PKCE and a secure, HTTP-only state cookie. The callback returns Sveltia's popup messaging protocol and only releases results to exact configured origins. Serve the endpoints over HTTPS; preserve the response headers, including `Set-Cookie`.

## Attribution

Adapted from [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth).

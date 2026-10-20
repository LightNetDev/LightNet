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

| Variable               | Value                                                                                                                                                                                                                                                                            |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GITHUB_CLIENT_ID`     | GitHub OAuth app client ID.                                                                                                                                                                                                                                                      |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app secret; store as a worker secret.                                                                                                                                                                                                                               |
| `ALLOWED_ORIGINS`      | Comma-separated HTTPS origins or bare hostnames allowed to receive authentication results. Bare hostnames default to `https://`. Explicit subdomains and non-default ports must be listed; paths, trailing slashes, credentials, other protocols, and wildcards are unsupported. |

For example, `ALLOWED_ORIGINS=cms.yoursite.com,admin.yoursite.com:8443` allows `https://cms.yoursite.com` and `https://admin.yoursite.com:8443`. Bare hostnames and full HTTPS origins can be mixed in the same list. Any invalid entry rejects the entire list.

Register `https://<YOUR_WORKER_HOST>/callback` as your GitHub OAuth app's only callback URL and disable wildcard matching. The handlers omit `redirect_uri` from both OAuth requests so GitHub uses its registered callback. Set your CMS GitHub backend's `base_url` to the same HTTPS Worker origin (without `/callback`) so the state cookie is available when GitHub redirects back.

Existing deployments can remove `WORKER_ORIGIN` from their environment configuration.

## Attribution

Adapted from [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth).

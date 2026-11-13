---
"@lightnet/sveltia-github-auth": minor
---

Add `routeRequest`, which routes Sveltia CMS authentication requests to `handleAuth`, `handleCallback`, and `handleRefresh`. It returns `undefined` for requests that don't match an authentication route, so workers can combine it with their own routes:

```js
import { routeRequest } from "@lightnet/sveltia-github-auth"

export default {
  async fetch(request, env) {
    return (
      (await routeRequest(request, env)) ?? new Response("", { status: 404 })
    )
  },
}
```

The `basePath` option serves the routes under a prefix, for example when the authenticator runs in the same Worker as a site. With `routeRequest(request, env, { basePath: "/_auth" })`, set the CMS backend's `base_url` to `https://<host>/_auth` and register `https://<host>/_auth/callback` as the GitHub callback URL.

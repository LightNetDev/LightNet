---
"@lightnet/sveltia-github-auth": minor
---

Add a ready-made Worker entry for LightNet sites that serve GitHub authentication from their own Worker. It serves the authentication routes under `/_auth` and passes all other requests to the static assets. Set it as `main` in `wrangler.jsonc` and run it only for `/_auth/*`:

```jsonc
{
  "main": "node_modules/@lightnet/sveltia-github-auth/src/site-worker.ts",
  "assets": {
    "directory": "./dist",
    "binding": "ASSETS",
    "run_worker_first": ["/_auth/*"],
  },
}
```

---
"@lightnet/cli": minor
---

Add `lightnet setup-github-auth`, which creates the GitHub App for a site's Administration UI with GitHub's app manifest flow and configures the site's Worker to serve sign-in under `/_auth`. It fills in the callback URL, permissions, and other app settings, writes the client ID to `wrangler.jsonc`, and can store the client secret in the Worker with Wrangler.

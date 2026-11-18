---
"@lightnet/cli": minor
---

Improve `lightnet setup-github-auth`. The command now asks for the site URL, repository, and app name instead of taking options, and explains each step before you open GitHub in your browser. It names the app after your site, such as "my-library.org Authentication", preselects your site's repository when you install the app, and adds `@lightnet/sveltia-github-auth` to your site. It no longer stores the client secret with Wrangler; it shows the secret and waits until you have added it to your Worker in Cloudflare.

---
"@lightnet/cli": minor
---

Improve `lightnet setup-github-auth`. The command now reads the site URL from the `site` option of your Astro config and the repository from `backend.repo`, and asks only for the app name instead of taking options. It explains each step before you open GitHub in your browser, names the app after your site, such as "my-library.org Authentication", preselects your site's repository when you install the app, and adds `@lightnet/sveltia-github-auth` to your site. It no longer stores the client secret with Wrangler. Instead, it waits until you have deployed your site, because Cloudflare can't store secrets for a Worker that only serves static files, then shows the secret and waits until you have added it to your Worker.

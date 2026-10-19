import { readFile } from "node:fs/promises"

import type { APIRoute } from "astro"
import config from "virtual:lightnet/sveltiaAdminConfig"

import { pathWithBase } from "./utils/path-with-base"

let sveltiaScriptUrl = ""
const getSveltiaScriptUrl = async () => {
  // The package does not export package.json. Resolve its entry first so this
  // follows the installed version, including pnpm overrides and workspace links.
  if (sveltiaScriptUrl) {
    return sveltiaScriptUrl
  }
  const cmsEntry = import.meta.resolve("@sveltia/cms")
  const { version } = JSON.parse(
    await readFile(new URL("../package.json", cmsEntry), "utf8"),
  ) as { version: string }
  sveltiaScriptUrl = `https://unpkg.com/@sveltia/cms@${version}/dist/sveltia-cms.mjs`
  return sveltiaScriptUrl
}

export const GET: APIRoute = async () => {
  const configUrl = pathWithBase(`/${config.path}/config.json`)
  const scriptUrl = await getSveltiaScriptUrl()

  return new Response(
    `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">
    <title>LightNet Administration</title>
    <link href="${configUrl}" type="application/json" rel="cms-config-url">
  </head>
  <body>
    <script type="module">
      import CMS from ${JSON.stringify(scriptUrl)};
      CMS.init({});
      window.localStorage.setItem("ln.adminPaths", JSON.stringify({
        rootPath: window.location.pathname,
        mediaItemPath: window.location.pathname + "#/collections/media/entries/{{mediaId}}"
      }));
    </script>
  </body>
</html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  )
}

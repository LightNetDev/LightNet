// @ts-check

import { spawn } from "node:child_process"
import { randomUUID } from "node:crypto"
import { readFile, writeFile } from "node:fs/promises"
import { createServer } from "node:http"
import { resolve } from "node:path"
import { stdin, stdout } from "node:process"

import {
  confirm,
  intro,
  isCancel,
  log,
  note,
  outro,
  text,
} from "@clack/prompts"
import { applyEdits, modify, parse, printParseErrorCode } from "jsonc-parser"

import { CliError } from "./support/cli-error.js"
import { cancelPrompt } from "./support/prompt-cancel.js"

/** Must match the base path of the `@lightnet/sveltia-github-auth` site worker. */
export const authBasePath = "/_auth"
export const siteWorkerPath =
  "node_modules/@lightnet/sveltia-github-auth/src/site-worker.ts"
const authPackage = "@lightnet/sveltia-github-auth"
const maxAppNameLength = 34
const registrationTimeoutMs = 30 * 60 * 1000
const astroConfigFiles = [
  "astro.config.mjs",
  "astro.config.js",
  "astro.config.ts",
  "astro.config.mts",
]

/**
 * @typedef {{
 *   site?: string
 *   org?: string
 *   personal?: boolean
 *   name?: string
 *   config?: string
 *   open?: boolean
 * }} SetupGithubAuthOptions
 *
 * @typedef {{
 *   client_id: string
 *   client_secret: string
 *   slug: string
 *   html_url: string
 * }} GithubApp
 *
 * @typedef {{
 *   cwd?: string
 *   isInteractive?: boolean
 *   fetch?: typeof fetch
 *   openUrl?: (url: string) => void | Promise<void>
 *   promptText?: (options: { message: string, initialValue?: string, placeholder?: string }) => Promise<string>
 *   promptConfirm?: (message: string) => Promise<boolean>
 *   storeSecret?: (secret: string, cwd: string) => Promise<boolean>
 * }} SetupGithubAuthRuntime
 */

/**
 * Creates a GitHub App for the site with GitHub's manifest flow and configures
 * the site's Worker to serve the Sveltia CMS authentication routes.
 *
 * @param {SetupGithubAuthOptions} options
 * @param {SetupGithubAuthRuntime} runtime
 */
export async function setupGithubAuth(options, runtime = {}) {
  const cwd = runtime.cwd ?? process.cwd()
  const isInteractive =
    runtime.isInteractive ?? Boolean(stdin.isTTY && stdout.isTTY)
  const promptText = runtime.promptText ?? defaultPromptText
  const promptConfirm = runtime.promptConfirm ?? defaultPromptConfirm
  const openUrl =
    options.open === false ? undefined : (runtime.openUrl ?? openInBrowser)

  intro("Set up GitHub authentication")

  const configPath = resolve(cwd, options.config ?? "wrangler.jsonc")
  const wranglerConfig = await readFile(configPath, "utf8").catch(() => {
    throw new CliError(
      `Could not read ${configPath}. Run this command in your site folder or pass --config.`,
    )
  })
  const astroConfig = await readAstroConfig(cwd)

  let site = options.site ?? findSiteUrl(astroConfig)
  if (!site) {
    if (!isInteractive) {
      throw new CliError("Could not find your site URL. Pass --site.")
    }
    site = await promptText({
      message: "What is your site's URL?",
      placeholder: "https://my-library.org",
    })
  }
  const siteOrigin = toSiteOrigin(site)

  let org = options.personal ? "" : options.org
  if (org === undefined) {
    const repoOwner = findRepoOwner(astroConfig)
    org = isInteractive
      ? await promptText({
          message:
            "Which GitHub organization should own the app? Leave empty for your personal account.",
          initialValue: repoOwner,
        })
      : (repoOwner ?? "")
  }

  const name =
    options.name ??
    `${new URL(siteOrigin).hostname} CMS`.slice(0, maxAppNameLength)

  const state = randomUUID()
  const code = await waitForManifestCode({
    state,
    registrationUrl: getRegistrationUrl({ org, state }),
    createManifest: (redirectUrl) =>
      createManifest({ name, siteOrigin, redirectUrl }),
    onReady: async (url) => {
      log.step(
        `Open ${url} to create the GitHub App. GitHub lets you review the settings before you create it.`,
      )
      await openUrl?.(url)
    },
  })
  const app = await exchangeManifestCode(code, runtime.fetch ?? fetch)
  log.success(`Created the GitHub App "${app.slug}".`)

  const { text: updatedConfig, warnings } = updateWranglerConfig(
    wranglerConfig,
    app.client_id,
  )
  await writeFile(configPath, updatedConfig)
  log.success(`Updated ${options.config ?? "wrangler.jsonc"}.`)
  warnings.forEach((warning) => log.warn(warning))

  const storeSecret = runtime.storeSecret ?? storeSecretWithWrangler
  const secretStored =
    isInteractive &&
    (await promptConfirm(
      "Store the client secret in your Cloudflare Worker with wrangler now?",
    )) &&
    (await storeSecret(app.client_secret, cwd))
  if (!secretStored) {
    note(
      `${app.client_secret}\n\nIn the Cloudflare dashboard, open your site's Worker, go to Settings → Variables and Secrets, and add it as the encrypted secret GITHUB_CLIENT_SECRET. GitHub shows this secret only once.`,
      "GitHub client secret",
    )
  }

  if (!(await hasDependency(cwd, authPackage))) {
    log.warn(`Add the auth package to your site: pnpm add ${authPackage}`)
  }
  if (/\bbaseUrl\s*:/.test(astroConfig ?? "")) {
    log.warn(
      `Remove backend.baseUrl from your Astro config so the Administration UI uses ${siteOrigin}${authBasePath}.`,
    )
  }

  const installUrl = `https://github.com/apps/${app.slug}/installations/new`
  note(
    [
      `1. Install the app on your site's repository: ${installUrl}`,
      `2. In the app settings, check that "Expire user authorization tokens" is enabled: ${app.html_url}`,
      "3. Commit and push your changes, then sign in to the Administration UI.",
    ].join("\n"),
    "Next steps",
  )
  await openUrl?.(installUrl)
  outro("GitHub authentication is configured.")
  return app
}

/**
 * @param {{ name: string, siteOrigin: string, redirectUrl: string }} options
 */
export function createManifest({ name, siteOrigin, redirectUrl }) {
  return {
    name,
    url: siteOrigin,
    description: `Sign in to the LightNet Administration UI of ${siteOrigin}.`,
    redirect_url: redirectUrl,
    callback_urls: [`${siteOrigin}${authBasePath}/callback`],
    public: false,
    request_oauth_on_install: false,
    hook_attributes: { url: siteOrigin, active: false },
    default_permissions: { contents: "write", metadata: "read" },
    default_events: [],
  }
}

/**
 * @param {{ org?: string, state: string }} options
 */
export function getRegistrationUrl({ org, state }) {
  const url = new URL(
    org
      ? `https://github.com/organizations/${encodeURIComponent(org)}/settings/apps/new`
      : "https://github.com/settings/apps/new",
  )
  url.searchParams.set("state", state)
  return url.toString()
}

/**
 * Serves a local page that posts the manifest to GitHub, then waits for
 * GitHub to redirect back with the temporary code.
 *
 * @param {{
 *   state: string
 *   registrationUrl: string
 *   createManifest: (redirectUrl: string) => object
 *   onReady: (url: string) => void | Promise<void>
 *   timeoutMs?: number
 * }} options
 * @returns {Promise<string>}
 */
export function waitForManifestCode({
  state,
  registrationUrl,
  createManifest,
  onReady,
  timeoutMs = registrationTimeoutMs,
}) {
  return new Promise((resolvePromise, reject) => {
    /** @type {object | undefined} */
    let manifest
    const server = createServer((request, response) => {
      const url = new URL(request.url ?? "/", "http://127.0.0.1")
      if (url.pathname === "/" && manifest) {
        sendHtml(
          response,
          200,
          `<form method="post" action="${escapeHtml(registrationUrl)}">
            <input type="hidden" name="manifest" value="${escapeHtml(JSON.stringify(manifest))}">
            <p>Redirecting to GitHub…</p>
            <button type="submit">Continue to GitHub</button>
          </form>
          <script>document.forms[0].submit()</script>`,
        )
        return
      }
      const code = url.searchParams.get("code")
      if (
        url.pathname === "/callback" &&
        code &&
        url.searchParams.get("state") === state
      ) {
        sendHtml(
          response,
          200,
          "<p>The GitHub App was created. You can close this tab and return to the terminal.</p>",
        )
        finish(() => resolvePromise(code))
        return
      }
      sendHtml(response, 404, "<p>Not found.</p>")
    })
    const timeout = setTimeout(
      () =>
        finish(() =>
          reject(
            new CliError("Timed out waiting for the GitHub App to be created."),
          ),
        ),
      timeoutMs,
    )
    /** @param {() => void} settle */
    const finish = (settle) => {
      clearTimeout(timeout)
      server.close()
      server.closeAllConnections()
      settle()
    }
    server.on("error", (error) => finish(() => reject(error)))
    server.listen(0, "127.0.0.1", async () => {
      const address = server.address()
      const port = typeof address === "object" && address ? address.port : 0
      const origin = `http://127.0.0.1:${port}`
      manifest = createManifest(`${origin}/callback`)
      try {
        await onReady(`${origin}/`)
      } catch (error) {
        finish(() => reject(error))
      }
    })
  })
}

/**
 * @param {string} code
 * @param {typeof fetch} fetchFn
 * @returns {Promise<GithubApp>}
 */
export async function exchangeManifestCode(code, fetchFn) {
  const response = await fetchFn(
    `https://api.github.com/app-manifests/${encodeURIComponent(code)}/conversions`,
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  )
  if (response.status !== 201) {
    throw new CliError(
      `GitHub could not finish creating the app (HTTP ${response.status}). Try again.`,
    )
  }
  const app = await response.json()
  if (!app.client_id || !app.client_secret || !app.slug) {
    throw new CliError("GitHub returned an unexpected response.")
  }
  return app
}

/**
 * Configures `wrangler.jsonc` to run the site Worker for `/_auth/*` and sets
 * the GitHub App's client ID. Keeps comments and formatting.
 *
 * @param {string} text
 * @param {string} clientId
 * @returns {{ text: string, warnings: string[] }}
 */
export function updateWranglerConfig(text, clientId) {
  /** @type {import("jsonc-parser").ParseError[]} */
  const errors = []
  const config = parse(text, errors, { allowTrailingComma: true })
  if (errors.length > 0 || !config || typeof config !== "object") {
    const reason = errors[0] ? printParseErrorCode(errors[0].error) : "empty"
    throw new CliError(`Could not parse the Wrangler config (${reason}).`)
  }
  if (!config.assets?.directory) {
    throw new CliError(
      "The Wrangler config has no assets.directory. See the LightNet hosting guide.",
    )
  }

  /** @type {string[]} */
  const warnings = []
  let result = text
  /**
   * @param {import("jsonc-parser").JSONPath} path
   * @param {unknown} value
   */
  const set = (path, value) => {
    result = applyEdits(
      result,
      modify(result, path, value, {
        formattingOptions: { insertSpaces: true, tabSize: 2 },
      }),
    )
  }

  if (!config.main) {
    set(["main"], siteWorkerPath)
  } else if (config.main !== siteWorkerPath) {
    warnings.push(
      `Your Worker already has a main script (${config.main}). Route ${authBasePath} requests in it with routeRequest(request, env, { basePath: "${authBasePath}" }) from ${authPackage}.`,
    )
  }

  if (!config.assets.binding) {
    set(["assets", "binding"], "ASSETS")
  } else if (config.assets.binding !== "ASSETS") {
    warnings.push(
      `The site Worker expects the assets binding ASSETS, but yours is ${config.assets.binding}.`,
    )
  }

  const pattern = `${authBasePath}/*`
  const runWorkerFirst = config.assets.run_worker_first
  if (Array.isArray(runWorkerFirst)) {
    if (!runWorkerFirst.includes(pattern)) {
      set(["assets", "run_worker_first"], [...runWorkerFirst, pattern])
    }
  } else if (runWorkerFirst !== true) {
    set(["assets", "run_worker_first"], [pattern])
  }

  set(["vars", "GITHUB_CLIENT_ID"], clientId)

  return { text: result, warnings }
}

/**
 * @param {string | undefined} astroConfig
 */
export function findSiteUrl(astroConfig) {
  return astroConfig?.match(/\bsite\s*:\s*["'`](https?:\/\/[^"'`]+)["'`]/)?.[1]
}

/**
 * @param {string | undefined} astroConfig
 */
export function findRepoOwner(astroConfig) {
  return astroConfig?.match(
    /\brepo\s*:\s*["'`]([A-Za-z0-9-]+)\/[A-Za-z0-9._-]+["'`]/,
  )?.[1]
}

/**
 * @param {string} site
 */
export function toSiteOrigin(site) {
  let url
  try {
    url = new URL(site)
  } catch {
    throw new CliError(`"${site}" is not a valid URL.`)
  }
  if (url.protocol !== "https:") {
    throw new CliError(`Your site must use HTTPS, but "${site}" does not.`)
  }
  return url.origin
}

/**
 * @param {string} cwd
 */
async function readAstroConfig(cwd) {
  for (const file of astroConfigFiles) {
    try {
      return await readFile(resolve(cwd, file), "utf8")
    } catch {
      // Try the next file name.
    }
  }
}

/**
 * @param {string} cwd
 * @param {string} name
 */
async function hasDependency(cwd, name) {
  try {
    const pkg = JSON.parse(await readFile(resolve(cwd, "package.json"), "utf8"))
    return Boolean(pkg.dependencies?.[name] ?? pkg.devDependencies?.[name])
  } catch {
    return false
  }
}

/**
 * @param {string} secret
 * @param {string} cwd
 * @returns {Promise<boolean>}
 */
function storeSecretWithWrangler(secret, cwd) {
  return new Promise((resolvePromise) => {
    const child = spawn(
      "pnpm",
      ["dlx", "wrangler@4", "secret", "put", "GITHUB_CLIENT_SECRET"],
      { cwd, stdio: ["pipe", "inherit", "inherit"] },
    )
    child.on("error", () => resolvePromise(false))
    child.on("close", (exitCode) => resolvePromise(exitCode === 0))
    child.stdin.end(secret)
  })
}

/**
 * @param {string} url
 */
function openInBrowser(url) {
  const [command, args] =
    process.platform === "darwin"
      ? ["open", [url]]
      : process.platform === "win32"
        ? ["cmd", ["/c", "start", "", url]]
        : ["xdg-open", [url]]
  spawn(command, args, { stdio: "ignore", detached: true })
    .on("error", () => {})
    .unref()
}

/**
 * @param {{ message: string, initialValue?: string, placeholder?: string }} options
 */
async function defaultPromptText(options) {
  const answer = await text(options)
  if (isCancel(answer)) {
    cancelPrompt()
  }
  return (answer ?? "").trim()
}

/**
 * @param {string} message
 */
async function defaultPromptConfirm(message) {
  const answer = await confirm({ message })
  if (isCancel(answer)) {
    cancelPrompt()
  }
  return answer
}

/**
 * @param {import("node:http").ServerResponse} response
 * @param {number} status
 * @param {string} body
 */
function sendHtml(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
  })
  response.end(
    `<!doctype html><html><head><meta charset="utf-8"><title>LightNet</title></head><body>${body}</body></html>`,
  )
}

/**
 * @param {string} value
 */
function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
}

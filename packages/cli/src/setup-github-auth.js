// @ts-check

import { spawn } from "node:child_process"
import { randomUUID } from "node:crypto"
import { readFile, writeFile } from "node:fs/promises"
import { createServer } from "node:http"
import { resolve } from "node:path"
import { stdin, stdout } from "node:process"
import { styleText } from "node:util"

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
export const maxAppNameLength = 34
/** The app's homepage. Not the site's URL, which can change later. */
export const appHomepageUrl = "https://lightnet.community"
const authPackage = "@lightnet/sveltia-github-auth"
const wranglerConfigFile = "wrangler.jsonc"
const registrationTimeoutMs = 30 * 60 * 1000
const githubApiHeaders = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
}
const astroConfigFiles = [
  "astro.config.mjs",
  "astro.config.js",
  "astro.config.ts",
  "astro.config.mts",
]

/**
 * @typedef {{
 *   client_id: string
 *   client_secret: string
 *   slug: string
 *   html_url: string
 *   owner?: { login: string, id: number, type: string }
 * }} GithubApp
 *
 * @typedef {{
 *   cwd?: string
 *   isInteractive?: boolean
 *   fetch?: typeof fetch
 *   openUrl?: (url: string) => void | Promise<void>
 *   promptText?: (options: { message: string, initialValue?: string, placeholder?: string, validate?: (value: string | undefined) => string | undefined }) => Promise<string>
 *   promptConfirm?: (message: string) => Promise<boolean>
 *   addPackage?: (name: string, cwd: string) => Promise<boolean>
 * }} SetupGithubAuthRuntime
 */

/**
 * Creates a GitHub App for the site with GitHub's manifest flow and configures
 * the site's Worker to serve the Sveltia CMS authentication routes.
 *
 * GitHub asks the user to confirm every step in the browser, so the command
 * is always interactive and opens the browser only after the user agrees.
 *
 * @param {SetupGithubAuthRuntime} runtime
 */
export async function setupGithubAuth(runtime = {}) {
  const cwd = runtime.cwd ?? process.cwd()
  const isInteractive =
    runtime.isInteractive ?? Boolean(stdin.isTTY && stdout.isTTY)
  const fetchFn = runtime.fetch ?? fetch
  const promptText = runtime.promptText ?? defaultPromptText
  const promptConfirm = runtime.promptConfirm ?? defaultPromptConfirm
  const openUrl = runtime.openUrl ?? openInBrowser
  const addPackage = runtime.addPackage ?? addPackageWithPnpm

  if (!isInteractive) {
    throw new CliError(
      "This command asks you to confirm steps on GitHub. Run it in an interactive terminal.",
    )
  }

  intro("Set up GitHub authentication")
  const heading = createStepHeadings([
    "Check your site",
    "Create GitHub App",
    "Configure your site",
    "Install GitHub App",
    "Deploy your site",
    "Add client secret",
  ])

  heading("Check your site")

  const configPath = resolve(cwd, wranglerConfigFile)
  const wranglerConfig = await readFile(configPath, "utf8").catch(() => {
    throw new CliError(
      `Could not read ${wranglerConfigFile}. Run this command in your site folder.`,
    )
  })
  const astroConfig = await readAstroConfig(cwd)

  const site = findSiteUrl(astroConfig)
  if (!site) {
    throw new CliError(
      'Could not find your site\'s URL. Set "site" in your Astro config, such as site: "https://my-library.org".',
    )
  }
  const siteOrigin = toSiteOrigin(site)
  log.info(`Setting up sign-in for ${siteOrigin}.`)
  const repo = findRepo(astroConfig)
  if (!repo) {
    throw new CliError(
      'Could not find your site\'s GitHub repository. Set backend.repo in your Astro config, such as repo: "my-org/my-library".',
    )
  }
  const repoName = `${repo.owner}/${repo.name}`
  log.info(`Using the GitHub repository ${repoName} from backend.repo.`)
  const name = await promptText({
    message: "What should the GitHub App be called?",
    initialValue: getDefaultAppName(repo.name),
    validate: validateAppName,
  })

  const ownerType = await lookupOwnerType(repo.owner, fetchFn)
  const isOrganization =
    ownerType === undefined
      ? await promptConfirm(`Is ${repo.owner} a GitHub organization?`)
      : ownerType === "Organization"

  heading("Create GitHub App")
  const state = randomUUID()
  const code = await waitForManifestCode({
    state,
    registrationUrl: getRegistrationUrl({
      org: isOrganization ? repo.owner : "",
      state,
    }),
    createManifest: (redirectUrl) =>
      createManifest({ name, siteOrigin, redirectUrl }),
    onReady: (url) =>
      openWhenReady({
        message: [
          `Next, GitHub opens in your browser to create the GitHub App "${name}" ${isOrganization ? `for the organization ${repo.owner}` : `for your personal account. Make sure you are signed in to GitHub as ${repo.owner}`}.`,
          'GitHub shows the app settings that LightNet filled in. Review them and select "Create GitHub App".',
          "If GitHub says the name is taken, change it on the form.",
        ].join("\n"),
        url,
        promptConfirm,
        openUrl,
      }),
  })
  const app = await exchangeManifestCode(code, fetchFn)
  log.success(`Created the GitHub App "${app.slug}".`)

  heading("Configure your site")
  const { text: updatedConfig, warnings } = updateWranglerConfig(
    wranglerConfig,
    app.client_id,
  )
  await writeFile(configPath, updatedConfig)
  log.success(`Updated ${wranglerConfigFile}.`)
  warnings.forEach((warning) => log.warn(warning))

  if (await hasDependency(cwd, authPackage)) {
    log.info(`${authPackage} is already installed.`)
  } else if (await addPackage(authPackage, cwd)) {
    log.success(`Added ${authPackage} to your site.`)
  } else {
    log.warn(`Could not add ${authPackage}. Run: pnpm add ${authPackage}`)
  }

  heading("Install GitHub App")
  const repoId = await lookupRepoId(repo, fetchFn)
  await openWhenReady({
    message: [
      `Next, GitHub opens in your browser to install the app on ${repo.owner}/${repo.name}.`,
      `Choose "Only select repositories" and select only ${repo.owner}/${repo.name}. Don't give the app access to all repositories.`,
      repoId
        ? `LightNet asks GitHub to preselect ${repo.owner}/${repo.name}. Check that no other repository is selected, then select "Install".`
        : `Then select "Install".`,
    ].join("\n"),
    url: getInstallationUrl({ slug: app.slug, ownerId: app.owner?.id, repoId }),
    promptConfirm,
    openUrl,
  })

  heading("Deploy your site")
  // Cloudflare only stores secrets for Workers that run a script, so the
  // site's Worker has to be deployed with the new `main` before the secret
  // can be added.
  const settingsUrl = getAppSettingsUrl(
    app,
    isOrganization ? repo.owner : undefined,
  )
  note(
    [
      `Commit and push the changes to ${wranglerConfigFile}, package.json, and pnpm-lock.yaml to the branch Cloudflare deploys from, usually main.`,
      "Then wait until Cloudflare has deployed your site. Cloudflare can store the client secret only after this deploy.",
      "Keep this terminal open: the next step shows the client secret.",
    ].join("\n"),
  )
  while (!(await promptConfirm("Has Cloudflare deployed your site?"))) {
    log.warn(
      `Wait for the deploy before you continue. If you have to stop now, generate a new client secret later in the app settings: ${settingsUrl}`,
    )
  }

  heading("Add client secret")
  note(
    [
      app.client_secret,
      "",
      "In the Cloudflare dashboard, open your site's Worker, go to Settings → Variables and Secrets, and add this value as the secret GITHUB_CLIENT_SECRET (type: Secret).",
      `GitHub shows this secret only once. If you lose it, generate a new one in the app settings: ${settingsUrl}`,
    ].join("\n"),
    "GITHUB_CLIENT_SECRET",
  )
  while (
    !(await promptConfirm(
      "Have you added GITHUB_CLIENT_SECRET to your Worker in Cloudflare?",
    ))
  ) {
    log.warn("Add the secret before you continue. GitHub shows it only once.")
  }

  const nextSteps = []
  if (/\bbaseUrl\s*:/.test(astroConfig ?? "")) {
    nextSteps.push(
      `Remove backend.baseUrl from your Astro config so the Administration UI uses ${siteOrigin}${authBasePath}. Then commit and push.`,
    )
  }
  nextSteps.push(
    `Sign in to the Administration UI on ${siteOrigin} to check that everything works.`,
  )
  note(
    nextSteps.map((step, index) => `${index + 1}. ${step}`).join("\n"),
    "Next steps",
  )
  outro("GitHub authentication is configured.")
  return app
}

/**
 * Names the app after the site's repository, which stays the same when the
 * site moves to another domain. Shortens the suffix to fit GitHub's limit.
 *
 * @param {string} repoName
 */
export function getDefaultAppName(repoName) {
  return (
    [`${repoName} Authentication`, `${repoName} Auth`].find(
      (name) => name.length <= maxAppNameLength,
    ) ?? repoName.slice(0, maxAppNameLength)
  )
}

/**
 * @param {string | undefined} name
 */
export function validateAppName(name) {
  const trimmed = name?.trim() ?? ""
  if (!trimmed) {
    return "Enter a name for the GitHub App."
  }
  if (trimmed.length > maxAppNameLength) {
    return `GitHub App names can have at most ${maxAppNameLength} characters.`
  }
}

/**
 * Prints numbered headings, such as "2/6 Create GitHub App", so users can see
 * where they are in the setup.
 *
 * @param {string[]} titles
 */
function createStepHeadings(titles) {
  /** @param {string} title */
  return (title) => {
    const number = titles.indexOf(title) + 1
    log.step(styleText("bold", `${number}/${titles.length} ${title}`))
  }
}

/**
 * Explains what happens next and opens the URL only after the user agrees.
 *
 * @param {{
 *   message: string
 *   url: string
 *   promptConfirm: (message: string) => Promise<boolean>
 *   openUrl: (url: string) => void | Promise<void>
 * }} options
 */
async function openWhenReady({ message, url, promptConfirm, openUrl }) {
  note(message)
  if (await promptConfirm("Open GitHub in your browser now?")) {
    await openUrl(url)
  } else {
    log.info(`Open this URL when you are ready: ${url}`)
  }
}

/**
 * @param {{ name: string, siteOrigin: string, redirectUrl: string }} options
 */
export function createManifest({ name, siteOrigin, redirectUrl }) {
  return {
    name,
    url: appHomepageUrl,
    description:
      "Lets editors sign in to the LightNet Administration UI and save content to the site's repository.",
    redirect_url: redirectUrl,
    callback_urls: [`${siteOrigin}${authBasePath}/callback`],
    public: false,
    request_oauth_on_install: false,
    hook_attributes: { url: appHomepageUrl, active: false },
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
 * Settings page of the app, where client secrets can be generated.
 *
 * @param {{ slug: string }} app
 * @param {string | undefined} org
 */
export function getAppSettingsUrl(app, org) {
  return org
    ? `https://github.com/organizations/${encodeURIComponent(org)}/settings/apps/${app.slug}`
    : `https://github.com/settings/apps/${app.slug}`
}

/**
 * Installation page of the app. Preselects the owner account and the site's
 * repository when their IDs are known.
 *
 * @param {{ slug: string, ownerId?: number, repoId?: number }} options
 */
export function getInstallationUrl({ slug, ownerId, repoId }) {
  if (!ownerId) {
    return `https://github.com/apps/${slug}/installations/new`
  }
  const url = new URL(
    `https://github.com/apps/${slug}/installations/new/permissions`,
  )
  url.searchParams.set("target_id", String(ownerId))
  if (repoId) {
    url.searchParams.append("repository_ids[]", String(repoId))
  }
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
      headers: githubApiHeaders,
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
export function findRepo(astroConfig) {
  const match = astroConfig?.match(
    /\brepo\s*:\s*["'`]([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+)["'`]/,
  )
  return match ? { owner: match[1], name: match[2] } : undefined
}

/**
 * Looks up whether a GitHub account is an organization or a user.
 *
 * @param {string} owner
 * @param {typeof fetch} fetchFn
 * @returns {Promise<string | undefined>}
 */
export async function lookupOwnerType(owner, fetchFn) {
  const account = await fetchGithubJson(
    `https://api.github.com/users/${encodeURIComponent(owner)}`,
    fetchFn,
  )
  return typeof account?.type === "string" ? account.type : undefined
}

/**
 * Looks up the repository ID. Only works for public repositories, because
 * the CLI has no GitHub token.
 *
 * @param {{ owner: string, name: string }} repo
 * @param {typeof fetch} fetchFn
 * @returns {Promise<number | undefined>}
 */
export async function lookupRepoId(repo, fetchFn) {
  const result = await fetchGithubJson(
    `https://api.github.com/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.name)}`,
    fetchFn,
  )
  return typeof result?.id === "number" ? result.id : undefined
}

/**
 * @param {string} url
 * @param {typeof fetch} fetchFn
 */
async function fetchGithubJson(url, fetchFn) {
  try {
    const response = await fetchFn(url, { headers: githubApiHeaders })
    return response.ok ? await response.json() : undefined
  } catch {
    return undefined
  }
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
 * @param {string} name
 * @param {string} cwd
 * @returns {Promise<boolean>}
 */
function addPackageWithPnpm(name, cwd) {
  return new Promise((resolvePromise) => {
    const child = spawn("pnpm", ["add", name], { cwd, stdio: "inherit" })
    child.on("error", () => resolvePromise(false))
    child.on("close", (exitCode) => resolvePromise(exitCode === 0))
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
 * @param {{ message: string, initialValue?: string, placeholder?: string, validate?: (value: string | undefined) => string | undefined }} options
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

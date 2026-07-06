// @ts-check

import { posix, resolve } from "node:path"
import { cwd as processCwd, stdin, stdout } from "node:process"

import { intro, isCancel, log, outro, progress, text } from "@clack/prompts"

import {
  cliConfigFileName,
  readCliConfig,
  writeCliConfig,
} from "./support/cli-config.js"
import { CliError } from "./support/cli-error.js"
import { contentCollections } from "./support/content-collections.js"
import { pathExists } from "./support/filesystem.js"

const mediaDir = "src/content/media"
const defaultConcurrency = 24
const defaultTimeoutMs = 10_000
const headFallbackStatuses = new Set([405, 501])
const requestHeaders = {
  accept: "*/*",
  "user-agent": "@lightnet/cli link checker",
}

/** @typedef {import("./support/content-collections.js").MediaItem} MediaItem */

/**
 * @typedef {{
 *   timeout?: string
 * }} CheckLinksOptions
 */

/**
 * @typedef {{
 *   cwd?: string
 *   fetch?: typeof fetch
 *   isInteractive?: boolean
 *   promptText?: (message: string) => Promise<string>
 * }} CheckLinksRuntime
 */

/**
 * @typedef {{
 *   displayUrl: string
 *   resolvedUrl: string
 *   sources: Set<string>
 * }} LinkReference
 */

/**
 * @typedef {{
 *   ok: boolean
 *   reason?: string
 *   status?: number
 * }} LinkCheckResult
 */

/**
 * @param {CheckLinksOptions} options
 * @param {CheckLinksRuntime} [runtime]
 */
export async function checkLinks(options, runtime = {}) {
  const cwd = runtime.cwd ?? processCwd()
  const interactive =
    runtime.isInteractive ?? Boolean(stdin.isTTY && stdout.isTTY)
  const promptText =
    runtime.promptText ?? (async (message) => defaultPromptText(message))
  const runFetch = runtime.fetch ?? fetch
  const timeoutMs = parsePositiveInteger(
    options.timeout,
    "--timeout",
    defaultTimeoutMs,
  )

  intro("check-links")

  await assertLightNetSiteRoot(cwd)

  const collections = contentCollections(cwd)
  const mediaItems = await collections.getMediaItems()
  const siteUrl = await initSiteUrl({
    cwd,
    interactive,
    mediaItems,
    promptText,
  })
  const references = collectLinkReferences(mediaItems, siteUrl)
  log.message(
    `Checking ${references.length} unique links from ${mediaItems.length} media items.`,
  )

  if (references.length === 0) {
    log.warn("No media content URLs found.")
    outro("No issues found. 🎉")
    return true
  }

  const results = await checkReferencesWithProgress(references, {
    fetch: runFetch,
    timeoutMs,
  })
  const checkedLinks = references
    .map((reference, index) => ({ reference, result: results[index] }))
    .sort((a, b) =>
      a.reference.displayUrl.localeCompare(b.reference.displayUrl),
    )
  const protectedLinks = checkedLinks.filter((item) =>
    isProtectedLink(item.result),
  )
  const unavailableLinks = checkedLinks.filter(
    (item) => !item.result.ok && !isProtectedLink(item.result),
  )

  printProtectedLinks(protectedLinks)

  if (unavailableLinks.length === 0) {
    if (protectedLinks.length > 0) {
      outro("No unavailable links found. Some links could not be verified. ⚠️")
      return true
    }
    outro("No issues found. 🎉")
    return true
  }

  log.error(`Unavailable links (${unavailableLinks.length})`)
  for (const { reference, result } of unavailableLinks) {
    log.message(
      `• ${reference.displayUrl} (${formatFailure(result)}, referenced by ${[
        ...reference.sources,
      ]
        .toSorted()
        .join(", ")})`,
    )
  }

  outro("Issues found. 🚧")

  return false
}

/**
 * @param {LinkReference[]} references
 * @param {{fetch: typeof fetch, timeoutMs: number}} options
 */
async function checkReferencesWithProgress(references, options) {
  const linkProgress = progress({ max: references.length })
  let completed = 0
  linkProgress.start(`Checking links (0/${references.length})`)

  try {
    const results = await mapConcurrent(
      references,
      defaultConcurrency,
      async (reference) => {
        const result = await checkLink(reference.resolvedUrl, options)
        completed += 1
        linkProgress.advance(
          1,
          `Checking links (${completed}/${references.length})`,
        )
        return result
      },
    )
    const protectedCount = results.filter((result) =>
      isProtectedLink(result),
    ).length
    const unavailableCount = results.filter(
      (result) => !result.ok && !isProtectedLink(result),
    ).length
    const availableCount = results.length - protectedCount - unavailableCount
    linkProgress.stop(
      `Checked links: ${availableCount} available, ${protectedCount} protected, ${unavailableCount} unavailable.`,
    )
    return results
  } catch (error) {
    linkProgress.error("Link check failed.")
    throw error
  }
}

/**
 * @param {{
 *   cwd: string
 *   interactive: boolean
 *   mediaItems: MediaItem[]
 *   promptText: (message: string) => Promise<string>
 * }} args
 */
async function initSiteUrl({ cwd, interactive, mediaItems, promptText }) {
  const needsSiteUrl = mediaItems.some((item) =>
    item.content.some((contentItem) => isRootRelativeUrl(contentItem.url)),
  )
  if (!needsSiteUrl) {
    return undefined
  }

  const config = await readCliConfig(cwd)
  const configuredSiteUrl = parseSiteUrl(config)
  if (configuredSiteUrl) {
    return configuredSiteUrl
  }

  if (!interactive) {
    throw new CliError(
      `Root-relative media content URLs require a site URL. Add "siteUrl" to "${cliConfigFileName}".`,
    )
  }

  log.error(`Missing siteUrl in "${cliConfigFileName}".`)
  while (true) {
    const value = (await promptText("Site URL: ")).trim()
    if (!value) {
      continue
    }
    const siteUrl = normalizeSiteUrl(value, "Site URL")
    await writeCliConfig(cwd, {
      ...(isPlainObject(config) ? config : {}),
      siteUrl,
    })
    return siteUrl
  }
}

/**
 * @param {unknown} config
 */
function parseSiteUrl(config) {
  if (!isPlainObject(config)) {
    return undefined
  }
  const siteUrl = /** @type {Record<string, unknown>} */ (config).siteUrl
  if (typeof siteUrl !== "string" || !siteUrl.trim()) {
    return undefined
  }
  return normalizeSiteUrl(siteUrl, `"${cliConfigFileName}" siteUrl`)
}

/**
 * @param {MediaItem[]} mediaItems
 * @param {string|undefined} siteUrl
 */
function collectLinkReferences(mediaItems, siteUrl) {
  /** @type {Map<string, LinkReference>} */
  const references = new Map()
  for (const item of mediaItems) {
    const sourceFileName = posix.basename(toPosixPath(item.path))
    for (const contentItem of item.content) {
      const resolvedUrl = resolveUrl(contentItem.url, siteUrl)
      const current = references.get(resolvedUrl)
      if (current) {
        current.sources.add(sourceFileName)
        if (contentItem.url.length < current.displayUrl.length) {
          current.displayUrl = contentItem.url
        }
      } else {
        references.set(resolvedUrl, {
          displayUrl: contentItem.url,
          resolvedUrl,
          sources: new Set([sourceFileName]),
        })
      }
    }
  }
  return [...references.values()].sort((a, b) =>
    a.displayUrl.localeCompare(b.displayUrl),
  )
}

/**
 * @param {string} url
 * @param {string|undefined} siteUrl
 */
function resolveUrl(url, siteUrl) {
  if (isRootRelativeUrl(url)) {
    if (!siteUrl) {
      throw new CliError(`Root-relative URL "${url}" requires a site URL.`)
    }
    const parsed = new URL(url, siteUrl)
    parsed.hash = ""
    return parsed.toString()
  }

  let parsed
  try {
    parsed = new URL(url)
  } catch {
    throw new CliError(`Invalid media content URL "${url}".`)
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new CliError(
      `Unsupported media content URL "${url}". Expected http or https.`,
    )
  }
  parsed.hash = ""
  return parsed.toString()
}

/**
 * @param {string} url
 * @param {{fetch: typeof fetch, timeoutMs: number}} options
 * @returns {Promise<LinkCheckResult>}
 */
async function checkLink(url, options) {
  const headResult = await fetchStatus(url, {
    ...options,
    headers: requestHeaders,
    method: "HEAD",
  })
  if (headResult.ok || !headFallbackStatuses.has(headResult.status ?? 0)) {
    return headResult
  }
  return fetchStatus(url, {
    ...options,
    headers: {
      ...requestHeaders,
      "accept-encoding": "identity",
      range: "bytes=0-0",
    },
    method: "GET",
  })
}

/**
 * @param {{reference: LinkReference, result: LinkCheckResult}[]} links
 */
function printProtectedLinks(links) {
  if (links.length === 0) {
    return
  }

  log.warn(`Protected or forbidden links (${links.length})`)
  for (const { reference, result } of links) {
    log.message(
      `• ${reference.displayUrl} (${formatFailure(result)}, referenced by ${[
        ...reference.sources,
      ]
        .toSorted()
        .join(", ")})`,
    )
  }
}

/**
 * @param {string} url
 * @param {{
 *   fetch: typeof fetch
 *   headers?: Record<string, string>
 *   method: "GET"|"HEAD"
 *   timeoutMs: number
 * }} options
 * @returns {Promise<LinkCheckResult>}
 */
async function fetchStatus(url, options) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs)
  try {
    const response = await options.fetch(url, {
      headers: options.headers,
      method: options.method,
      redirect: "follow",
      signal: controller.signal,
    })
    await response.body?.cancel()
    const ok = response.status >= 200 && response.status < 400
    return { ok, status: response.status }
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "Request failed",
    }
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * @template T
 * @template R
 * @param {T[]} items
 * @param {number} concurrency
 * @param {(item: T) => Promise<R>} mapper
 * @returns {Promise<R[]>}
 */
async function mapConcurrent(items, concurrency, mapper) {
  /** @type {R[]} */
  const results = []
  let nextIndex = 0
  const workerCount = Math.min(concurrency, items.length)
  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (true) {
        const index = nextIndex
        nextIndex += 1
        const item = items[index]
        if (item === undefined) {
          return
        }
        results[index] = await mapper(item)
      }
    }),
  )
  return results
}

/**
 * @param {string|undefined} rawValue
 * @param {string} optionName
 * @param {number} defaultValue
 */
function parsePositiveInteger(rawValue, optionName, defaultValue) {
  if (rawValue === undefined) {
    return defaultValue
  }
  const value = Number(rawValue)
  if (!Number.isInteger(value) || value < 1) {
    throw new CliError(`Expected "${optionName}" to be a positive integer.`)
  }
  return value
}

/**
 * @param {string} value
 * @param {string} label
 */
function normalizeSiteUrl(value, label) {
  let parsed
  try {
    parsed = new URL(value)
  } catch {
    throw new CliError(`Invalid ${label}: expected an absolute http(s) URL.`)
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new CliError(`Invalid ${label}: expected an absolute http(s) URL.`)
  }
  return parsed.toString().replace(/\/+$/, "")
}

/**
 * @param {string} cwd
 */
async function assertLightNetSiteRoot(cwd) {
  if (!(await pathExists(resolve(cwd, mediaDir)))) {
    throw new CliError(
      'Expected a LightNet site root with "src/content/media". Run this command inside a LightNet site project.',
    )
  }
}

/**
 * @param {string} url
 */
function isRootRelativeUrl(url) {
  return url.startsWith("/") && !url.startsWith("//")
}

/**
 * @param {LinkCheckResult} result
 */
function formatFailure(result) {
  if (result.status !== undefined) {
    return `status ${result.status}`
  }
  return result.reason ?? "request failed"
}

/**
 * @param {LinkCheckResult} result
 */
function isProtectedLink(result) {
  return !result.ok && result.status === 403
}

/**
 * @param {string} filePath
 */
function toPosixPath(filePath) {
  return filePath.split("\\").join("/")
}

/**
 * @param {string} message
 */
async function defaultPromptText(message) {
  const answer = await text({ message })
  return isCancel(answer) ? "" : String(answer)
}

/**
 * @param {unknown} value
 */
function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

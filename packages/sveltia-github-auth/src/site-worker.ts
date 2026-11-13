import { routeRequest } from "./route-request"
import type { Env } from "./shared/env"

/**
 * Path prefix for the authentication routes on a LightNet site. Not exported:
 * Workers treat every export of the main module as an entrypoint.
 */
const siteAuthBasePath = "/_auth"

export interface SiteWorkerEnv extends Env {
  /** Static assets binding (`assets.binding` in `wrangler.jsonc`). */
  ASSETS?: { fetch: (request: Request) => Promise<Response> }
}

/**
 * Worker entry for a static LightNet site that also serves Sveltia CMS
 * authentication under `/_auth`. Set `main` in `wrangler.jsonc` to this file
 * and send `/_auth/*` to it with `assets.run_worker_first`. Other requests
 * fall back to the static assets.
 */
const siteWorker = {
  async fetch(request: Request, env: SiteWorkerEnv): Promise<Response> {
    return (
      (await routeRequest(request, env, { basePath: siteAuthBasePath })) ??
      (env.ASSETS
        ? env.ASSETS.fetch(request)
        : new Response("", { status: 404 }))
    )
  },
}

export default siteWorker

import type { APIRoute } from "astro"

import { config } from "./sveltia/sveltia.config"

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(config))
}

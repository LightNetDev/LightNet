import type { APIRoute } from "astro"

import { getConfig } from "./sveltia/sveltia.config"

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(getConfig()))
}

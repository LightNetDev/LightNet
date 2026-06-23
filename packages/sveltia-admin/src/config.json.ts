import type { APIRoute } from "astro"

import { createConfig } from "./sveltia.config"

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(createConfig()))
}

import type { APIRoute } from "astro"

import pkg from "../../../package.json" assert { type: "json" }

export const GET: APIRoute = () => {
  return new Response(JSON.stringify({ lightnet: pkg.version }))
}

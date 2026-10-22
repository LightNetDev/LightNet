import type { APIRoute } from "astro"

export const GET: APIRoute = ({ site }) => {
  const base = new URL(import.meta.env.BASE_URL, site)
  if (!base.pathname.endsWith("/")) base.pathname += "/"
  const sitemap = new URL("sitemap-index.xml", base)

  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap.href}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}

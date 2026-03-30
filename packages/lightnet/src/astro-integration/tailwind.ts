import { fileURLToPath } from "node:url"

import type { AstroIntegration } from "astro"
import autoprefixerPlugin from "autoprefixer"
import type { AcceptedPlugin, ProcessOptions } from "postcss"
import postcssrc from "postcss-load-config"
import tailwindPlugin from "tailwindcss"

type PostcssInlineOptions =
  | undefined
  | string
  | (ProcessOptions & {
      plugins?: AcceptedPlugin[]
    })

function isInlinePostCssOptions(
  postcssInlineOptions: PostcssInlineOptions,
): postcssInlineOptions is Exclude<PostcssInlineOptions, undefined | string> {
  return (
    typeof postcssInlineOptions === "object" && postcssInlineOptions !== null
  )
}

async function getPostCssConfig(
  root: string,
  postcssInlineOptions: PostcssInlineOptions,
) {
  let postcssConfigResult
  if (!isInlinePostCssOptions(postcssInlineOptions)) {
    const searchPath =
      typeof postcssInlineOptions === "string" ? postcssInlineOptions : root
    try {
      postcssConfigResult = await postcssrc({}, searchPath)
    } catch {
      postcssConfigResult = null
    }
  }
  return postcssConfigResult
}
async function getViteConfiguration(
  root: string,
  postcssInlineOptions: PostcssInlineOptions,
) {
  const postcssConfigResult = await getPostCssConfig(root, postcssInlineOptions)
  const inlinePostcssOptions = isInlinePostCssOptions(postcssInlineOptions)
    ? postcssInlineOptions
    : null
  const postcssOptions = inlinePostcssOptions
    ? { ...inlinePostcssOptions }
    : (postcssConfigResult?.options ?? {})
  const postcssPlugins =
    inlinePostcssOptions?.plugins?.slice() ??
    postcssConfigResult?.plugins?.slice() ??
    []
  postcssPlugins.push(tailwindPlugin())
  postcssPlugins.push(autoprefixerPlugin())
  return {
    css: {
      postcss: {
        ...postcssOptions,
        plugins: postcssPlugins,
      },
    },
  }
}

// Astro v6 no longer supports Tailwind CSS v3 through `@astrojs/tailwind`,
// so LightNet provides its own minimal integration for now.
// Remove this in the next major release once Tailwind v4 is the baseline,
// and then also remove `autoprefixer`, `postcss`, and `postcss-load-config`.
function tailwindIntegration(): AstroIntegration {
  return {
    name: "@lightnet/tailwind",
    hooks: {
      "astro:config:setup": async ({ config, updateConfig }) => {
        updateConfig({
          vite: await getViteConfiguration(
            fileURLToPath(config.root),
            config.vite.css?.postcss,
          ),
        })
      },
    },
  }
}
export { tailwindIntegration as default }

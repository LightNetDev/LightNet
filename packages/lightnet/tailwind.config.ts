import { addIconSelectors } from "@iconify/tailwind"
import typography from "@tailwindcss/typography"
import type { Config } from "tailwindcss"

const DEFAULT_COLOR_PRIMARY = "#E6B15C"

export function lightnetStyles({
  primaryColor,
}: {
  primaryColor?: string
}): Partial<Config> {
  const primary = primaryColor ?? DEFAULT_COLOR_PRIMARY
  return {
    content: [
      "./node_modules/lightnet/src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
      "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
      "./src/content/media-types/*.json",
    ],
    theme: {
      extend: {
        colors: {
          primary,
        },
        backgroundImage: {
          "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        },
      },
    },
    plugins: [typography, addIconSelectors(["mdi", "lucide"])],
  }
}

export default lightnetStyles({})

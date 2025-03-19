import { addIconSelectors } from "@iconify/tailwind"
import typography from "@tailwindcss/typography"
import daisyui from "daisyui"
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
    daisyui: {
      themes: [
        {
          lightnet: {
            primary,
            secondary: primary,
            accent: primary,
            neutral: "#030712",
            "base-100": "#f9fafb",

            "--rounded-box": "0.375rem", // border radius rounded-box utility class, used in card and other large boxes
            "--rounded-btn": "0.375rem", // border radius rounded-btn utility class, used in buttons and similar element
            "--rounded-badge": "0.375rem", // border radius rounded-badge utility class, used in badges and similar
            "--tab-radius": "0.375rem", // border radius of tabs
          },
        },
      ],
      base: false, // applies background color and foreground color for root element by default
      utils: true, // adds responsive and modifier utility classes
      logs: false, // Shows info about daisyUI version and used config in the console when building your CSS
      prefix: "dy-",
    },
    plugins: [typography, daisyui, addIconSelectors(["mdi"])],
  }
}

export default lightnetStyles({})

import pluginJs from "@eslint/js"
import configPrettier from "eslint-config-prettier"
import pluginAstro from "eslint-plugin-astro"
import pluginReact from "eslint-plugin-react"
import pluginSimpleImportSort from "eslint-plugin-simple-import-sort"
import pluginUnusedImports from "eslint-plugin-unused-imports"
import globals from "globals"
import tseslint from "typescript-eslint"

/** @type { import("eslint").Linter.Config[] } */
export default [
  {
    ignores: [
      "**/.astro/",
      "**/dist/",
      "**/env.d.ts",
      "**/node_modules/",
      "**/playwright-report/",
    ],
  },
  {
    files: ["**/*.{js,mjs,ts,jsx,tsx,astro}"],
    rules: {
      "no-warning-comments": "warn",
    },
  },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  configPrettier,
  pluginReact.configs.flat["jsx-runtime"],
  ...pluginAstro.configs.recommended,
  {
    rules: {
      "@typescript-eslint/triple-slash-reference": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    plugins: {
      "unused-imports": pluginUnusedImports,
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    plugins: {
      "simple-import-sort": pluginSimpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
]

import type { FileCollection } from "@sveltia/cms"
import config from "virtual:lightnet/config"

import { inlineTranslation } from "../../utils/inline-translation"
import { projectPath } from "../../utils/path"

export const siteConfigCollection: FileCollection = {
  name: "site-config",
  label: "Site Configuration",
  files: [
    {
      name: "general",
      label: "General",
      file: projectPath("src/config/general.json"),
      fields: [
        {
          name: "site",
          label: "Site URL",
          widget: "string",
          type: "url",
        },
        inlineTranslation({ label: "Site Title", name: "title" }),
      ],
    },
    {
      name: "navigation",
      label: "Navigation",
      file: projectPath("src/config/navigation.json"),
      fields: [
        {
          name: "mainMenu",
          label: "Main Menu Entries",
          label_singular: "Main Menu Entry",
          widget: "list",
          collapsed: "auto",
          summary: `{{label.${config.defaultLocale}}}`,
          fields: [
            {
              name: "href",
              label: "URL Path",
              widget: "string",
            },
            inlineTranslation({
              name: "label",
              label: "Label",
            }),
            {
              name: "requiresLocale",
              label: "Add Site Language to URL Path",
              required: false,
              default: true,
              widget: "boolean",
              hint: "Turn this off to keep internal URL paths exactly as entered. External URLs are not affected.",
            },
          ],
        },
      ],
    },
  ],
}

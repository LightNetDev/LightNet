import type { CollectionFile } from "@sveltia/cms"
import config from "virtual:lightnet/config"
import sveltiaAdminConfig from "virtual:lightnet/sveltiaAdminConfig"

import { inlineTranslation } from "../../utils/inline-translation"
import { projectPath } from "../../utils/path"

export const languagesSelect = () => {
  if (sveltiaAdminConfig.experimental?.useLanguagesCollection) {
    return {
      name: "language",
      label: "Language",
      widget: "relation",
      collection: "_singletons",
      file: "languages",
      value_field: "{{languages.*.code}}",
      display_fields: [
        `{{languages.*.label.${config.defaultLocale}}} ({{languages.*.code}})`,
      ],
    }
  } else {
    return {
      name: "language",
      label: "Language",
      widget: "select",
      options: config.languages.map(({ code, label }) => {
        return {
          label: `${label[config.defaultLocale]} (${code})`,
          value: code,
        }
      }),
    }
  }
}

export const defineLanguagesCollection = () => {
  if (!sveltiaAdminConfig.experimental?.useLanguagesCollection) {
    return
  }
  return languagesCollection
}

const languagesCollection: CollectionFile = {
  name: "languages",
  label: "Languages",
  file: projectPath("languages.json"),
  format: "json",
  icon: "language",
  fields: [
    {
      widget: "list",
      name: "languages",
      label: "Languages",
      label_singular: "Language",
      allow_duplicate: false,
      allow_reorder: false,
      root: true,
      collapsed: "auto",
      summary: `{{label.${config.defaultLocale}}}  ({{code}})`,
      fields: [
        {
          name: "code",
          label: "Language Code",
          hint: "Enter a valid IETF BCP 47 language tag (for example, en, en-US, ar). Use this [tool](https://r12a.github.io/app-subtags/) to find the right code.",
          pattern: [
            "^(?:(?:[A-Za-z]{2,3}(?:-[A-Za-z]{3}){0,3}|[A-Za-z]{4}|[A-Za-z]{5,8})(?:-[A-Za-z]{4})?(?:-(?:[A-Za-z]{2}|\\d{3}))?(?:-(?:[A-Za-z0-9]{5,8}|\\d[A-Za-z0-9]{3}))*(?:-[0-9A-WY-Za-wy-z](?:-[A-Za-z0-9]{2,8})+)*(?:-x(?:-[A-Za-z0-9]{1,8})+)?|x(?:-[A-Za-z0-9]{1,8})+)$",
            "Enter a valid BCP 47 language tag (e.g. en, en-US, zh-Hans-CN).",
          ],
        },
        inlineTranslation({ name: "label", label: "Name" }),
      ],
    },
  ],
}

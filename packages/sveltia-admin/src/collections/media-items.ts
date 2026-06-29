import type { Collection } from "@sveltia/cms"
import config from "virtual:lightnet/config"
import adminConfig from "virtual:lightnet/sveltiaAdminConfig"

import { isDefined } from "../utils/is-defined"
import { projectPath } from "../utils/paths"
import { inlineTranslation } from "./fields/inline-translation"
import { languagesSelect } from "./languages"

export const mediaItemCollection: Collection = {
  name: "media",
  label: "Media Items",
  description:
    "Use media items to add resources people can open or download. Examples: a book PDF, a YouTube link. [Read documentation](https://docs.lightnet.community/content/media-items/)",
  label_singular: "Media Item",
  folder: projectPath("src/content/media"),
  create: true,
  preview_path: `${config.defaultLocale}/media/{{filename}}`,
  format: "json",
  identifier_field: "englishTitle",
  sortable_fields: ["slug", "dateCreated", "language"],
  summary: "{{title}} ({{slug}})",
  view_groups: [
    { label: "Language", field: "language", pattern: ".*" },
    { label: "Type", field: "type", pattern: ".*" },
  ],
  fields: [
    {
      name: "englishTitle",
      label: "English Title",
      required: false,
      hint: "Used only for new items to generate the entry ID. If empty, a random ID is generated.",
    },
    {
      name: "type",
      label: "Media Type",
      widget: "relation",
      hint: "Choose the kind of media this content represents.",
      collection: "media-types",
      value_field: "{{slug}}",
      display_fields: [`{{label.${config.defaultLocale}}} ({{slug}})`],
    },
    languagesSelect(),
    {
      name: "title",
      label: "Title",
      widget: "string",
      hint: "Enter the title in the content language.",
    },
    {
      name: "image",
      label: "Image",
      widget: "image",
      choose_url: false,
      media_folder: "./images",
      accept: "image/png, image/jpeg, image/webp, image/gif",
      hint: "Upload a cover image for this item. LightNet may resize it and change the file format.",
    },
    {
      name: "content",
      label: "Content",
      widget: "list",
      hint: "Add one or more files or links. The first item becomes the main resource people will open or download.",
      min: 1,
      summary: "{{types.url}}",
      types: [
        {
          name: "upload",
          label: "File Upload",
          fields: [
            {
              name: "url",
              label: "File",
              widget: "file",
              choose_url: false,
              ...getFileStorage(),
            },
            adminConfig.experimental.useContentLabelField &&
              inlineTranslation({
                name: "label",
                label: "Visible Name",
                hint: "Optional. Add a clearer label if you do not want to show the file name.",
                required: false,
                collapsed: "auto",
              }),
          ].filter(isDefined),
        },
        {
          name: "link",
          label: "Link",
          summary: "{{url}}",
          fields: [
            {
              name: "url",
              label: "Url",
              widget: "string",
              type: "url",
              pattern: ["^https?://", "Link must start with http(s)://"],
            },
            adminConfig.experimental.useContentLabelField &&
              inlineTranslation({
                name: "label",
                label: "Visible Name",
                required: false,
                hint: "Optional. Add a clearer label if you do not want to show the website name.",
                collapsed: "auto",
              }),
          ].filter(isDefined),
        },
      ],
    },
    adminConfig.experimental.useDateCreatedField
      ? {
          name: "dateCreated",
          label: "Created On",
          widget: "datetime",
          time_format: false,
          required: true,
          default: "{{now}}",
          picker_utc: true,
          hint: "Choose when this item was added to the media library.",
        }
      : {
          name: "dateCreated",
          widget: "hidden",
          default: "{{datetime | date('YYYY-MM-DD')}}",
        },
    {
      name: "authors",
      label: "Authors",
      label_singular: "Author",
      required: false,
      collapsed: true,
      default: [],
      widget: "list",
      summary: "{{fields.name}}",
      hint: "Add the author names in the content language.",
      field: { label: "Name", name: "name", widget: "string" },
    },
    adminConfig.experimental.useCommonIdField && {
      name: "commonId",
      label: "Translation Group (Common ID)",
      widget: "string",
      required: false,
      hint: "Optional. Use the same value for matching items in different languages so LightNet can treat them as translations of each other.",
    },
    adminConfig.experimental.useCategoriesField && {
      name: "categories",
      label: "Categories",
      required: false,
      widget: "relation",
      multiple: true,
      collection: "categories",
      display_fields: ["{{slug}}"],
      search_fields: ["{{slug}}"],
    },
    {
      name: "description",
      label: "Description",
      widget: "markdown",
      hint: "Write a short description in the content language.",
      required: false,
      editor_components: [],
      buttons: [
        "heading-two",
        "heading-three",
        "heading-four",
        "heading-five",
        "heading-six",
        "bold",
        "italic",
        "bulleted-list",
        "numbered-list",
        "quote",
        "link",
      ],
    },
  ].filter(isDefined),
}

function getFileStorage() {
  const externalFileStorage = adminConfig.experimental.fileStorage
  if (!externalFileStorage) {
    return {
      media_folder: projectPath("public/files"),
      public_folder: "/files",
      hint: `Upload a file up to ${adminConfig.maxFileSize} MB.`,
      media_libraries: {
        default: {
          config: {
            max_file_size: adminConfig.maxFileSize * 1_000_000,
            transformations: {},
          },
        },
      },
    }
  }

  return {
    media_libraries: {
      default: false,
      cloudflare_r2: {
        ...externalFileStorage,
        access_key_id: externalFileStorage.accessKeyId,
        account_id: externalFileStorage.accountId,
        public_url: externalFileStorage.publicUrl,
      },
    },
  }
}

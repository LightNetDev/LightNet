import type { Collection } from "@sveltia/cms"
import config from "virtual:lightnet/config"
import sveltiaAdminConfig from "virtual:lightnet/sveltiaAdminConfig"

import { inlineTranslation } from "../../utils/inline-translation"
import { projectPath } from "../../utils/path"
import { languagesSelect } from "./languages"

export const mediaItemCollection: Collection = {
  name: "media",
  label: "Media Items",
  description:
    "Add content entries to the media library. Examples: a book PDF, a YouTube link. [Read documentation](https://docs.lightnet.community/content/media-items/)",
  label_singular: "Media Item",
  folder: projectPath("src/content/media"),
  create: true,
  preview_path: `${config.defaultLocale}/media/{{filename}}`,
  format: "json",
  slug: "{{fields._slug}}",
  sortable_fields: ["slug", "dateCreated", "language"],
  summary: "{{title}} ({{slug}})",
  view_groups: [
    { label: "Language", field: "language", pattern: ".*" },
    { label: "Type", field: "type", pattern: ".*" },
  ],
  fields: [
    { name: "title", label: "Title", widget: "string" },
    {
      name: "type",
      label: "Type",
      widget: "relation",
      collection: "media-types",
      value_field: "{{slug}}",
      display_fields: [`{{label.${config.defaultLocale}}} ({{slug}})`],
    },
    languagesSelect(),
    {
      name: "image",
      label: "Image",
      widget: "image",
      choose_url: false,
      media_folder: "./images",
      accept: "image/png, image/jpeg, image/webp",
      hint: "When you upload an image, it is automatically resized (up to 2048 pixels) and saved in a web-friendly format.",
    },
    {
      name: "content",
      label: "Content",
      widget: "list",
      hint: "Add files or weblinks. First item in the list is the main content.",
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
            inlineTranslation({
              name: "label",
              label: "Label",
              hint: "Optional. Defaults to the file name, for example 'bible' from 'bible.pdf'.",
              required: false,
              collapsed: "auto",
            }),
          ],
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
            inlineTranslation({
              name: "label",
              label: "Label",
              required: false,
              hint: "Optional. Defaults to the file name or link domain, for example 'youtube.com'.",
              collapsed: "auto",
            }),
          ],
        },
      ],
    },
    {
      name: "dateCreated",
      label: "Date Created",
      widget: "datetime",
      time_format: false,
      required: true,
      default: "{{now}}",
      picker_utc: true,
      hint: "The date this item was added to this media library.",
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
      field: { label: "Name", name: "name", widget: "string" },
    },
    {
      name: "commonId",
      label: "Common ID",
      widget: "string",
      required: false,
      hint: "Optional: Use a shared Common ID to link translated versions of a media item.",
    },
    {
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
      required: false,
      editor_components: [],
      buttons: [
        "heading-one",
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
  ],
}

function getFileStorage() {
  const externalFileStorage = sveltiaAdminConfig.experimental?.fileStorage
  if (!externalFileStorage) {
    return {
      media_folder: projectPath("public/files"),
      public_folder: "/files",
      hint: `Maximum file size is ${sveltiaAdminConfig.maxFileSize} MB.`,
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

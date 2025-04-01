import type { APIRoute } from "astro"
import { getCollection } from "astro:content"
import { resolveDefaultLocale } from "lightnet/i18n"
import userConfig from "virtual:lightnet/decapAdminUserConfig"
import YAML from "yaml"

export const GET: APIRoute = () => {
  return new Response(YAML.stringify(config))
}

const toSnakeCase = (object?: Record<string, unknown>) => {
  if (!object) {
    return object
  }
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(object)) {
    result[key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)] =
      value
  }
  return result
}

const defaultLocale = resolveDefaultLocale(userConfig)

const categories = (await getCollection("categories")).map(({ id }) => id)

const local_backend = import.meta.env.MODE !== "production"
const backend =
  local_backend || !userConfig.backend
    ? { name: "git-gateway" }
    : toSnakeCase(userConfig.backend)

export const config = {
  local_backend,
  backend,
  media_folder: "public/files",
  public_folder: "/files",
  editor: { preview: false },
  site_url: userConfig.site,
  search: false,
  collections: [
    {
      name: "media",
      label: "Media",
      label_singular: "Media Item",
      folder: "src/content/media",
      create: true,
      preview_path: `${defaultLocale}/media/{{filename}}`,
      format: "json",
      sortable_fields: [
        "commit_date",
        "commonId",
        "commit_author",
        "dateCreated",
        "language",
      ],
      slug: "{{commonId}}--{{language}}",
      summary: "{{filename}}",
      view_groups: [
        { label: "Language", field: "language", pattern: ".*" },
        { label: "Type", field: "type", pattern: ".*" },
      ],
      fields: [
        { name: "title", label: "Title", widget: "string" },
        {
          name: "commonId",
          label: "Common ID",
          widget: "string",
          hint: "The english title, all lowercase, words separated with hyphens. This is WITHOUT the language (eg. --en) suffix.",
        },
        {
          name: "type",
          label: "Type",
          widget: "relation",
          collection: "media-types",
          value_field: "{{slug}}",
          search_fields: ["{{slug}}"],
        },
        {
          name: "language",
          label: "Language",
          widget: "select",
          options: userConfig.languages.map(({ code }) => code),
        },
        {
          name: "authors",
          label: "Authors",
          label_singular: "Author",
          required: false,
          widget: "list",
          summary: "{{fields.name}}",
          field: { label: "Name", name: "name", widget: "string" },
        },
        {
          name: "image",
          label: "Image",
          widget: "image",
          choose_url: false,
          media_folder: userConfig.imagesFolder,
          pattern: [
            "\\.(jpg|png|jpeg|webp)$",
            "Unsupported image format. Supported formats are jpg, png, webp",
          ],
        },
        {
          name: "dateCreated",
          label: "Created on",
          widget: "datetime",
          format: "YYYY-MM-DD",
          picker_utc: true,
          hint: "When has this item been created on this library?",
        },
        {
          name: "categories",
          label: "Categories",
          required: false,
          widget: "select",
          multiple: true,
          options: categories,
        },
        {
          name: "collections",
          label: "Collections",
          widget: "list",
          required: false,
          summary: "{{fields.collection}}",
          fields: [
            {
              name: "collection",
              label: "Collection",
              widget: "relation",
              collection: "media-collections",
              value_field: "{{slug}}",
              search_fields: ["{{slug}}"],
            },
            {
              name: "index",
              label: "Index",
              hint: "The position of the media item inside the collection",
              required: false,
              widget: "number",
              value_type: "int",
            },
          ],
        },
        {
          name: "content",
          label: "Content",
          widget: "list",
          hint: "Upload your files or paste URLs. First item in the list is the main content.",
          min: 1,
          // max is required for min to work :( https://github.com/decaporg/decap-cms/issues/4733
          max: 50,
          summary: "{{fields.url}}",
          fields: [
            {
              name: "url",
              label: "Url",
              widget: "file",
              hint: `Maximum file size is ${userConfig.maxFileSize} MB.`,
              media_library: {
                config: { max_file_size: userConfig.maxFileSize * 1000000 },
              },
            },
          ],
        },
        {
          name: "description",
          label: "Description",
          required: false,
          widget: "markdown",
        },
      ],
    },
    {
      name: "media-collections",
      label: "Media Collections",
      label_singular: "Media Collection",
      create: true,
      folder: "src/content/media-collections",
      format: "json",
      slug: "{{label}}",
      fields: [
        {
          name: "label",
          label: "Label",
          widget: "string",
        },
      ],
    },
    {
      name: "media-types",
      label: "Media Types",
      label_singular: "Media Type",
      folder: "src/content/media-types",
      summary: "{{filename}}",
      hide: true,
      format: "json",
      fields: [
        {
          name: "label",
          label: "Label",
          widget: "string",
        },
        {
          name: "icon",
          label: "Icon",
          widget: "string",
          hint: "Find icons on https://pictogrammers.com/library/mdi/. Prefix icon name with 'mdi--'",
        },
      ],
    },
  ],
}

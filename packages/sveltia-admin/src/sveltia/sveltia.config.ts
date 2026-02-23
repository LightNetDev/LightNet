import type { CmsConfig } from "@sveltia/cms"
import lightnetConfig from "virtual:lightnet/config"
import sveltiaAdminConfig from "virtual:lightnet/sveltiaAdminConfig"

import { configCollections } from "./collections/config"
import { contentCollections } from "./collections/content"

export const config: CmsConfig = {
  backend: sveltiaAdminConfig.backend ?? {
    name: "github",
    // Sveltia CMS uses repo as unique site identifier for IndexedDB
    // https://github.com/sveltia/sveltia-cms/issues/630
    repo: lightnetConfig.site,
  },
  media_folder: `${sveltiaAdminConfig.siteRootInRepo}public/files`,
  public_folder: "/files",
  media_libraries: {
    stock_assets: {
      providers: [],
    },
    default: {
      config: {
        slugify_filename: true,
        max_file_size: sveltiaAdminConfig.maxFileSize * 1024 * 1024,
        transformations: {
          raster_image: {
            format: "webp",
            quality: 85,
            width: 2048,
            height: 2048,
          },
          svg: {
            optimize: true,
          },
        },
      },
    },
  },
  editor: { preview: false },
  site_url: lightnetConfig.site,
  output: {
    omit_empty_optional_fields: true,
  },
  slug: {
    clean_accents: true,
    maxlength: 60,
  },
  collections: [
    ...configCollections,
    {
      divider: true,
    },
    ...contentCollections,
  ],
}

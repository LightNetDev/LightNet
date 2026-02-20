import type { CmsConfig } from "@sveltia/cms"
import lightnetConfig from "virtual:lightnet/config"
import sveltiaAdminConfig from "virtual:lightnet/sveltiaAdminConfig"

import { categoriesCollection } from "./collections/categories"
import { languagesCollection } from "./collections/languages"
import { mediaCollectionCollection } from "./collections/media-collections"
import { mediaItemCollection } from "./collections/media-items"
import { mediaTypeCollection } from "./collections/media-types"

export const config: CmsConfig = {
  backend: sveltiaAdminConfig.backend ?? {
    name: "github",
    repo: lightnetConfig.site,
  },
  media_folder: `${sveltiaAdminConfig.baseFolder}public/files`,
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
    languagesCollection,
    {
      divider: true,
    },
    categoriesCollection,
    mediaItemCollection,
    mediaTypeCollection,
    mediaCollectionCollection,
  ],
}

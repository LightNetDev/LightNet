import type { CmsConfig } from "@sveltia/cms"
import { site } from "astro:config/server"
import sveltiaAdminConfig from "virtual:lightnet/sveltiaAdminConfig"

import lightnetLogo from "../assets/lightnet-logo.svg?url"
import { contentCollections } from "./collections/content"
import { projectPath } from "./utils/path"

export const config: CmsConfig = {
  backend: sveltiaAdminConfig.backend ?? {
    name: "github",
    // Sveltia CMS uses repo as unique site identifier for IndexedDB
    // https://github.com/sveltia/sveltia-cms/issues/630
    repo: site,
  },
  media_folder: projectPath("src/assets"),
  public_folder: "/src/assets",
  app_title: "LightNet Admin",
  logo: {
    src: lightnetLogo,
  },
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
  site_url: site,
  output: {
    omit_empty_optional_fields: true,
  },
  slug: {
    clean_accents: true,
    maxlength: 60,
  },
  collections: [...contentCollections],
}

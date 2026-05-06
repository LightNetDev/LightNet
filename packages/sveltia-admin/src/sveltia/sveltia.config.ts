import type { Backend, CmsConfig } from "@sveltia/cms"
import { site } from "astro:config/server"
import sveltiaAdminConfig from "virtual:lightnet/sveltiaAdminConfig"

import lightnetLogo from "../assets/lightnet-logo.svg?url"
import { contentCollections } from "./collections/content"
import { defineLanguagesCollection } from "./collections/content/languages"
import { projectPath } from "./utils/path"

export function getConfig(
  siteUrl = process.env.LIGHTNET_DEV_SITE_URL ?? site,
): CmsConfig {
  return {
    backend: getBackend(),
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
      all: {
        slugify_filename: true,
      },
      default: {
        config: {
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
    site_url: siteUrl,
    output: {
      omit_empty_optional_fields: true,
    },
    slug: {
      clean_accents: true,
      encoding: "ascii",
      maxlength: 60,
    },
    collections: [...contentCollections],
    singletons: [defineLanguagesCollection()].filter((c) => !!c),
  }
}

function getBackend(): Backend {
  const { backend } = sveltiaAdminConfig

  if (!backend) {
    return {
      name: "github",
      repo: createLocalRepoPath(),
    }
  }

  if (backend.name === "github") {
    return {
      ...backend,
      base_url: backend.baseUrl,
    }
  }

  if (backend.name === "gitlab") {
    return {
      ...backend,
      app_id: backend.appId,
      auth_type: backend.authType,
    }
  }
  return backend
}

// Sveltia CMS uses repo as unique site identifier for IndexedDB
// https://github.com/sveltia/sveltia-cms/issues/630
// Also it expects repo in format <org>/<repo>
// We do not want to require setting a path for local only settings so we generate
// our path from site url.
function createLocalRepoPath() {
  return (
    (site ?? "")
      .replace(/^https?:\/\//, "")
      .replaceAll("/", "-")
      .replaceAll(".", "-") + "/local-repository"
  )
}

export const config = getConfig()

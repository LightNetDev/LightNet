import { access, mkdir, readdir } from "node:fs/promises"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

import sharp from "sharp"

import type { DecapAdminUserConfig } from "./integration"

export async function vitePluginExportAdminImages(
  {
    srcDir,
    outDir,
  }: {
    srcDir: URL
    outDir: URL
  },
  config: DecapAdminUserConfig,
) {
  return {
    name: "vite-plugin-lightnet-decap-admin-images",
    writeBundle: async () =>
      exportAdminImages(
        fileURLToPath(srcDir),
        fileURLToPath(outDir),
        config.path,
        config.imagesFolder,
      ),
  }
}

async function exportAdminImages(
  srcDir: string,
  outDir: string,
  adminPath: string,
  imageFolder: string,
) {
  const imageDir = join(srcDir, "content", "media", imageFolder)
  const outImageDir = join(outDir, adminPath, imageFolder)

  try {
    await access(outImageDir)
  } catch {
    await mkdir(outImageDir, { recursive: true })
  }

  const files = await readdir(imageDir)
  if (!files) {
    return console.error("Unable to scan directory")
  }
  await Promise.allSettled(
    files.map((file) => {
      if (
        ![".jpg", ".jpeg", ".png", ".webp"].find((suffix) =>
          file.endsWith(suffix),
        )
      ) {
        return
      }
      const imagePath = join(imageDir, file)
      return sharp(imagePath)
        .resize(335, 135, { fit: "contain", background: "#fff" })
        .extend({ bottom: 15, background: "#fff" })
        .toFile(join(outImageDir, file))
    }),
  )
}

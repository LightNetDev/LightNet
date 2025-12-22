import { type MediaItem } from "../../types/media-item"
import { writeFile, writeJson } from "./file-system"

export const updateMediaItem = async (id: string, item: MediaItem) => {
  const imagePath = await saveImage(item.image)
  await Promise.all(item.content.map(saveContentFile))
  return writeJson(
    `/src/content/media/${id}.json`,
    mapToContentSchema(item, imagePath),
  )
}

const ensureRelativePath = (path: string) => {
  const trimmed = path.trim()
  if (!trimmed) {
    return ""
  }
  if (trimmed.startsWith("./")) {
    return trimmed
  }
  return `./${trimmed}`
}

const saveImage = async (image: MediaItem["image"]) => {
  const relativePath = ensureRelativePath(image?.path ?? "")
  if (!relativePath || !image?.file) {
    return relativePath
  }
  await writeFile(
    `/src/content/media/${relativePath.replace(/^\.\//, "")}`,
    await image.file.arrayBuffer(),
    image.file.type || "application/octet-stream",
  )
  return relativePath
}

const saveContentFile = async ({ url, file }: MediaItem["content"][number]) => {
  if (!file) {
    return
  }
  const path = `/public/${url.replace(/^\//, "")}`
  return writeFile(
    path,
    await file.arrayBuffer(),
    file.type || "application/octet-stream",
  )
}

const mapToContentSchema = (item: MediaItem, imagePath: string) => {
  return {
    ...item,
    image: imagePath,
    authors: flatten(item.authors),
    // Remove uploaded file from content.
    // eslint-disable-next-line unused-imports/no-unused-vars
    content: item.content.map(({ file, ...content }) => content),
    categories: flatten(item.categories),
  }
}

const flatten = <TValue>(valueArray: { value: TValue }[]) => {
  return valueArray.map(({ value }) => value)
}

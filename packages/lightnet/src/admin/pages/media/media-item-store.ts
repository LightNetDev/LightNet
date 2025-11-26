import { type MediaItem } from "../../types/media-item"
import { writeFile, writeJson } from "./file-system"

export const updateMediaItem = async (id: string, item: MediaItem) => {
  const imagePath = await saveImage(item.image)
  return writeJson(
    `/src/content/media/${id}.json`,
    mapToContentSchema(item, imagePath),
  )
}

const ensureRelativeImagePath = (path: string) => {
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
  const relativePath = ensureRelativeImagePath(image?.path ?? "")
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

const mapToContentSchema = (item: MediaItem, imagePath: string) => {
  return {
    ...item,
    image: imagePath,
    authors: flatten(item.authors),
    categories: flatten(item.categories),
  }
}

const flatten = <TValue>(valueArray: { value: TValue }[]) => {
  return valueArray.map(({ value }) => value)
}

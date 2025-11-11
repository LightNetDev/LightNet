import { type MediaItem } from "../../types/media-item"
import { writeJson } from "./file-system"

export const updateMediaItem = async (id: string, item: MediaItem) => {
  return writeJson(`/src/content/media/${id}.json`, mapToContentSchema(item))
}

const mapToContentSchema = (item: MediaItem) => {
  return {
    ...item,
    authors: flatten(item.authors),
    categories: flatten(item.categories),
  }
}

const flatten = <TValue>(valueArray: { value: TValue }[]) => {
  return valueArray.map(({ value }) => value)
}

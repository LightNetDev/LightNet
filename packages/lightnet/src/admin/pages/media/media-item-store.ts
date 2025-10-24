import { mediaItemSchema, type MediaItem } from "../../types/media-item"
import { writeJson } from "./file-system"

export const loadMediaItem = (id: string) =>
  fetch(`/api/media/${id}.json`)
    .then((response) => response.json())
    .then((json) => mediaItemSchema.parse(json.content))

export const updateMediaItem = async (id: string, item: MediaItem) => {
  return writeJson(`/src/content/media/${id}.json`, item)
}

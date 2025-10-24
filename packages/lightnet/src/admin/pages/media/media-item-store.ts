import type { MediaItem } from "../../types/media-item"
import { writeJson } from "./file-system"

export const loadMediaItem = (id: string) =>
  fetch(`/api/media/${id}.json`)
    .then((response) => response.json())
    .then((json) => json.content)

export const updateMediaItem = async (id: string, partialItem: MediaItem) => {
  const mediaItem = await loadMediaItem(id)
  const updated = { ...mediaItem, ...partialItem }
  return writeJson(`/src/content/media/${id}.json`, updated)
}

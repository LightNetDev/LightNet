export function MediaItemStore() {
  const loadMediaItem = (id: string) =>
    fetch(`/api/media/${id}.json`)
      .then((response) => response.json())
      .then((json) => json.data)

  const updateMediaItem = async (id: string, partialItem: any) => {
    const mediaItem = await loadMediaItem(id)
    const updated = { ...mediaItem, ...partialItem }
    const path = `src/content/media/${id}.json`
    await fetch(`/api/internal/fs/writeText?path=${encodeURIComponent(path)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated, null, 2),
    })
  }

  return {
    loadMediaItem,
    updateMediaItem,
  }
}

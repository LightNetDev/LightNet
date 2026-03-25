import { pathWithBase } from "lightnet/utils"

const parseCachedUser = () => {
  try {
    const cachedUser = localStorage.getItem("sveltia-cms.user")
    return cachedUser ? JSON.parse(cachedUser) : undefined
  } catch {
    return undefined
  }
}

export default {
  shouldShow: () => {
    if (import.meta.env.DEV) {
      return true
    }

    const cachedUser = parseCachedUser()
    return (
      typeof cachedUser === "object" &&
      cachedUser !== null &&
      typeof cachedUser.backendName === "string"
    )
  },
  createHref: (mediaId: string) =>
    `${pathWithBase("/admin")}#/collections/media/entries/${encodeURIComponent(mediaId)}`,
}

import { QueryClient, useQuery } from "@tanstack/react-query"
import React from "react"

import { useAppForm } from "../../components/form"
import { MediaItemStore } from "./MediaItemStore"

const { loadMediaItem, updateMediaItem } = MediaItemStore()
const queryClient = new QueryClient()

export default function EditForm() {
  const mediaId = React.useMemo(() => {
    if (typeof window === "undefined")
      throw new Error("Cannot read media id of undefined window")
    const params = new URLSearchParams(window.location.search)
    const id = params.get("id")
    if (!id) throw new Error("No media id in query params")
    return id
  }, [])
  const { data: mediaItem, isLoading } = useQuery(
    {
      queryKey: ["mediaItem", mediaId],
      queryFn: async () => {
        return loadMediaItem(mediaId)
      },
    },
    queryClient,
  )
  const form = useAppForm({
    defaultValues: {
      title: mediaItem?.title ?? "",
    },
    onSubmit: async ({ value }) => {
      await updateMediaItem(mediaId, value)
    },
  })

  if (isLoading) {
    return null
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="flex flex-col items-start gap-6"
    >
      <form.AppField
        name="title"
        validators={{
          onChange: (value) => !value.value && "Field must not be empty",
        }}
        children={(field) => <field.TextField label="Title" />}
      />
      <form.AppForm>
        <form.SubmitButton label="Save" />
      </form.AppForm>
    </form>
  )
}

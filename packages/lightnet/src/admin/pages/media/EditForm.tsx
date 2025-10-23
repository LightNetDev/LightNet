import { QueryClient, useQuery } from "@tanstack/react-query"

import { useAppForm } from "../../components/form"
import { loadMediaItem, updateMediaItem } from "./media-item-store"

const queryClient = new QueryClient()

export default function EditForm({ mediaId }: { mediaId: string }) {
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

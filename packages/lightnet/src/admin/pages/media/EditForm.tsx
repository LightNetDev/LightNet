import { useAppForm } from "../../components/form"
import { updateMediaItem } from "./media-item-store"
import type { MediaItem } from "../../types/media-item"

export default function EditForm({
  mediaId,
  mediaItem,
}: {
  mediaId: string
  mediaItem: MediaItem
}) {
  const form = useAppForm({
    defaultValues: {
      title: mediaItem.title,
    },
    onSubmit: async ({ value }) => {
      await updateMediaItem(mediaId, value)
    },
  })

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

import { revalidateLogic } from "@tanstack/react-form"

import { showToastById } from "../../../components/showToast"
import Toast from "../../../components/Toast"
import { useAppForm } from "../../components/form"
import { type MediaItem, mediaItemSchema } from "../../types/media-item"
import { updateMediaItem } from "./media-item-store"

export default function EditForm({
  mediaId,
  mediaItem,
}: {
  mediaId: string
  mediaItem: MediaItem
}) {
  const form = useAppForm({
    defaultValues: mediaItem,
    validators: {
      onDynamic: mediaItemSchema,
    },
    validationLogic: revalidateLogic({
      mode: "blur",
      modeAfterSubmission: "change",
    }),
    onSubmit: async ({ value }) => {
      await updateMediaItem(mediaId, { ...mediaItem, ...value })
    },
    onSubmitInvalid: () => {
      showToastById("invalid-form-data-toast")
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="flex flex-col items-start gap-4"
    >
      <form.AppField
        name="commonId"
        children={(field) => <field.TextField label="Common ID" />}
      />
      <form.AppField
        name="title"
        children={(field) => <field.TextField label="Title" />}
      />
      <form.AppForm>
        <form.SubmitButton />
        <Toast id="invalid-form-data-toast" variant="error">
          <div className="font-bold text-gray-700">Invalid form data</div>
          Check the fields and try again.
        </Toast>
      </form.AppForm>
    </form>
  )
}

import { revalidateLogic } from "@tanstack/react-form"

import { showToastById } from "../../../components/showToast"
import Toast from "../../../components/Toast"
import {
  createI18n,
  type I18nConfig,
  I18nContext,
} from "../../../i18n/react/i18n-context"
import { useAppForm } from "../../components/form"
import { type MediaItem, mediaItemSchema } from "../../types/media-item"
import { updateMediaItem } from "./media-item-store"

export default function EditForm({
  mediaId,
  mediaItem,
  i18nConfig,
}: {
  mediaId: string
  mediaItem: MediaItem
  i18nConfig: I18nConfig
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
  const i18n = createI18n(i18nConfig)

  return (
    <I18nContext.Provider value={i18n}>
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
            <div className="font-bold text-gray-700">
              {i18n.t("ln.admin.toast.invalid-data.title")}
            </div>
            {i18n.t("ln.admin.toast.invalid-data.hint")}
          </Toast>
        </form.AppForm>
      </form>
    </I18nContext.Provider>
  )
}

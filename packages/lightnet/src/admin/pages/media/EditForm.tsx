import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import {
  createI18n,
  type I18nConfig,
  I18nContext,
} from "../../../i18n/react/i18n-context"
import Input from "../../components/form/Input"
import Select from "../../components/form/Select"
import SubmitButton from "../../components/form/SubmitButton"
import { type MediaItem, mediaItemSchema } from "../../types/media-item"
import Authors from "./fields/Authors"
import { updateMediaItem } from "./media-item-store"

type SelectOption = { id: string; labelText: string }

export default function EditForm({
  mediaId,
  mediaItem,
  i18nConfig,
  mediaTypes,
  languages,
}: {
  mediaId: string
  mediaItem: MediaItem
  i18nConfig: I18nConfig
  mediaTypes: SelectOption[]
  languages: SelectOption[]
  categories: SelectOption[]
}) {
  const { handleSubmit, control } = useForm({
    defaultValues: mediaItem,
    mode: "onTouched",
    resolver: zodResolver(mediaItemSchema),
  })
  const onSubmit = handleSubmit(
    async (data) => await updateMediaItem(mediaId, { ...mediaItem, ...data }),
  )
  const i18n = createI18n(i18nConfig)
  return (
    <I18nContext.Provider value={i18n}>
      <form onSubmit={onSubmit}>
        <Input name="title" label="ln.admin.title" control={control} />
        <Input
          name="commonId"
          label="ln.admin.common-id"
          hint="ln.admin.common-id-hint"
          control={control}
        />
        <Select
          name="type"
          label="ln.type"
          options={mediaTypes}
          control={control}
        />
        <Select
          name="language"
          label="ln.language"
          options={languages}
          control={control}
        />
        <Authors control={control} />
        <Input
          name="dateCreated"
          label="ln.admin.created-on"
          hint="ln.admin.created-on-hint"
          type="date"
          control={control}
        />

        <SubmitButton className="mt-8" control={control} />
      </form>
    </I18nContext.Provider>
  )
}

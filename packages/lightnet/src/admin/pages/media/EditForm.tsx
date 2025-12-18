import { zodResolver } from "@hookform/resolvers/zod"
import type { KeyboardEvent } from "react"
import { useForm } from "react-hook-form"

import {
  createI18n,
  type I18nConfig,
  I18nContext,
} from "../../../i18n/react/i18n-context"
import Input from "../../components/form/Input"
import MarkdownEditor from "../../components/form/MarkdownEditor"
import Select from "../../components/form/Select"
import SubmitButton from "../../components/form/SubmitButton"
import { type MediaItem, mediaItemSchema } from "../../types/media-item"
import Authors from "./fields/Authors"
import Categories from "./fields/Categories"
import Collections from "./fields/Collections"
import Image from "./fields/Image"
import { updateMediaItem } from "./media-item-store"
import Content from "./fields/Content"

type SelectOption = { id: string; labelText: string }

export default function EditForm({
  mediaId,
  mediaItem,
  i18nConfig,
  mediaTypes,
  languages,
  categories,
  collections,
}: {
  mediaId: string
  mediaItem: MediaItem
  i18nConfig: I18nConfig
  mediaTypes: SelectOption[]
  languages: SelectOption[]
  categories: SelectOption[]
  collections: SelectOption[]
}) {
  const { handleSubmit, control } = useForm({
    defaultValues: mediaItem,
    mode: "onTouched",
    shouldFocusError: true,
    resolver: zodResolver(mediaItemSchema),
  })

  const preventSubmitOnEnter = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key === "Enter" && !(event.target instanceof HTMLButtonElement)) {
      event.preventDefault()
    }
  }

  const onSubmit = handleSubmit(
    async (data) => await updateMediaItem(mediaId, { ...mediaItem, ...data }),
  )
  const i18n = createI18n(i18nConfig)
  return (
    <I18nContext.Provider value={i18n}>
      <form
        className="flex flex-col"
        onSubmit={onSubmit}
        onKeyDown={preventSubmitOnEnter}
      >
        <div className="mb-8 flex items-end justify-between">
          <h1 className="text-3xl">{i18n.t("ln.admin.edit-media-item")}</h1>
          <SubmitButton control={control} />
        </div>

        <Input
          name="title"
          label="ln.admin.title"
          required
          control={control}
          defaultValue={mediaItem.title}
        />
        <Select
          name="type"
          label="ln.type"
          required
          options={mediaTypes}
          control={control}
          defaultValue={mediaItem.type}
        />
        <Select
          name="language"
          label="ln.language"
          required
          defaultValue={mediaItem.language}
          options={languages}
          control={control}
        />
        <Image
          control={control}
          defaultValue={mediaItem.image}
          mediaId={mediaId}
        />
        <Content control={control} defaultValue={mediaItem.content} />
        <Input
          name="dateCreated"
          label="ln.admin.date-created"
          hint="ln.admin.date-created-hint"
          type="date"
          required
          defaultValue={mediaItem.dateCreated}
          control={control}
        />
        <Input
          name="commonId"
          label="ln.admin.common-id"
          required
          hint="ln.admin.common-id-hint"
          control={control}
          defaultValue={mediaItem.commonId}
        />
        <Authors control={control} defaultValue={mediaItem.authors} />
        <Categories
          categories={categories}
          control={control}
          defaultValue={mediaItem.categories}
        />
        <Collections
          collections={collections}
          control={control}
          defaultValue={mediaItem.collections}
        />
        <MarkdownEditor
          control={control}
          name="description"
          label="ln.admin.description"
        />
        <SubmitButton className="mt-8 self-end" control={control} />
      </form>
    </I18nContext.Provider>
  )
}

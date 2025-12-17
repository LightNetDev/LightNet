import { type Control } from "react-hook-form"

import { useI18n } from "../../../../i18n/react/use-i18n"
import DynamicArray from "../../../components/form/DynamicArray"
import Input from "../../../components/form/Input"
import type { MediaItem } from "../../../types/media-item"

export default function Authors({
  control,
  defaultValue,
}: {
  control: Control<MediaItem>
  defaultValue: MediaItem["authors"]
}) {
  const { t } = useI18n()
  return (
    <DynamicArray
      control={control}
      name="authors"
      label="ln.admin.authors"
      renderElement={(index) => (
        <Input
          name={`authors.${index}.value`}
          preserveHintSpace={false}
          placeholder={t("ln.admin.author-name")}
          required
          control={control}
          defaultValue={defaultValue[index]?.value}
        />
      )}
      addButton={{
        label: "ln.admin.add-author",
        onClick: (append, index) =>
          append({ value: "" }, { focusName: `authors.${index}.value` }),
      }}
    />
  )
}

import { type Control } from "react-hook-form"

import DynamicArray from "../../../components/form/DynamicArray"
import type { MediaItem } from "../../../types/media-item"
import Input from "../../../components/form/Input"

export default function Authors({
  control,
  defaultValue,
}: {
  control: Control<MediaItem>
  defaultValue: MediaItem["authors"]
}) {
  return (
    <DynamicArray
      control={control}
      name="authors"
      label="ln.admin.authors"
      renderElement={(index) => (
        <Input
          name={`authors.${index}.value`}
          preserveHintSpace={false}
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

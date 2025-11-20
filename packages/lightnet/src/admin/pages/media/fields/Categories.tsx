import { type Control } from "react-hook-form"

import ErrorMessage from "../../../components/form/atoms/ErrorMessage"
import DynamicArray from "../../../components/form/DynamicArray"
import { useFieldError } from "../../../components/form/hooks/use-field-error"
import type { MediaItem } from "../../../types/media-item"
import Select from "../../../components/form/Select"

export default function Categories({
  control,
  categories,
  defaultValue,
}: {
  control: Control<MediaItem>
  defaultValue: MediaItem["categories"]
  categories: { id: string; labelText: string }[]
}) {
  return (
    <DynamicArray
      control={control}
      name="categories"
      label="ln.categories"
      renderElement={(index) => (
        <Select
          options={categories}
          control={control}
          name={`categories.${index}.value`}
          defaultValue={defaultValue[index]?.value}
          preserveHintSpace={false}
        />
      )}
      addButton={{
        label: "ln.admin.add-category",
        onClick: (append, index) =>
          append({ value: "" }, { focusName: `categories.${index}.value` }),
      }}
    />
  )
}

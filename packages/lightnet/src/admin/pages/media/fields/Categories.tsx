import { type Control } from "react-hook-form"

import ErrorMessage from "../../../components/form/atoms/ErrorMessage"
import DynamicArray from "../../../components/form/DynamicArray"
import { useFieldError } from "../../../components/form/hooks/use-field-error"
import type { MediaItem } from "../../../types/media-item"

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
        <CategorySelect
          categories={categories}
          control={control}
          index={index}
          defaultValue={defaultValue[index]?.value}
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

function CategorySelect({
  control,
  categories,
  defaultValue,
  index,
}: {
  control: Control<MediaItem>
  categories: { id: string; labelText: string }[]
  defaultValue?: string
  index: number
}) {
  const name = `categories.${index}.value` as const
  const errorMessage = useFieldError({ name, control })
  return (
    <>
      <select
        {...control.register(name)}
        id={name}
        defaultValue={defaultValue}
        aria-invalid={!!errorMessage}
        className={`dy-select dy-select-bordered text-base shadow-sm ${errorMessage ? "dy-select-error" : ""}`}
      >
        {categories.map(({ id, labelText }) => (
          <option key={id} value={id}>
            {labelText}
          </option>
        ))}
      </select>
      <ErrorMessage message={errorMessage} />
    </>
  )
}

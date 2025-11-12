import { type Control } from "react-hook-form"

import ErrorMessage from "../../../components/form/atoms/ErrorMessage"
import DynamicArray from "../../../components/form/DynamicArray"
import { useFieldError } from "../../../components/form/hooks/use-field-error"
import type { MediaItem } from "../../../types/media-item"

export default function Categories({
  control,
  categories,
}: {
  control: Control<MediaItem>
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
  index,
}: {
  control: Control<MediaItem>
  categories: { id: string; labelText: string }[]
  index: number
}) {
  const name = `categories.${index}.value` as const
  const errorMessage = useFieldError({ name, control })
  return (
    <>
      <select
        {...control.register(name)}
        id={name}
        aria-invalid={!!errorMessage}
        className={`dy-select dy-select-bordered bg-gray-200 text-base shadow-sm ${errorMessage ? "dy-select-error" : ""}`}
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

import { type Control } from "react-hook-form"

import ErrorMessage from "../../../components/form/atoms/ErrorMessage"
import DynamicArray from "../../../components/form/DynamicArray"
import { useFieldError } from "../../../components/form/hooks/use-field-error"
import type { MediaItem } from "../../../types/media-item"

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
        <AuthorInput
          index={index}
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

function AuthorInput({
  index,
  control,
  defaultValue,
}: {
  index: number
  control: Control<MediaItem>
  defaultValue?: string
}) {
  const name = `authors.${index}.value` as const
  const errorMessage = useFieldError({ name, control })
  return (
    <>
      <input
        className={`dy-input dy-input-bordered shadow-inner ${errorMessage ? "dy-input-error" : ""}`}
        aria-invalid={!!errorMessage}
        defaultValue={defaultValue}
        {...control.register(name)}
      />
      <ErrorMessage message={errorMessage} />
    </>
  )
}

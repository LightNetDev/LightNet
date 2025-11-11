import { type Control } from "react-hook-form"

import ErrorMessage from "../../../components/form/atoms/ErrorMessage"
import DynamicArray from "../../../components/form/DynamicArray"
import { useFieldError } from "../../../components/form/hooks/use-field-error"
import type { MediaItem } from "../../../types/media-item"

export default function Authors({ control }: { control: Control<MediaItem> }) {
  return (
    <DynamicArray
      control={control}
      name="authors"
      label="ln.admin.authors"
      renderElement={(index) => <AuthorInput index={index} control={control} />}
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
}: {
  index: number
  control: Control<MediaItem>
}) {
  const name = `authors.${index}.value` as const
  const errorMessage = useFieldError({ name, control })
  return (
    <>
      <input
        className={`dy-input dy-input-sm grow ${errorMessage ? "dy-input-error" : ""}`}
        aria-invalid={!!errorMessage}
        {...control.register(name)}
      />
      <ErrorMessage message={errorMessage} />
    </>
  )
}

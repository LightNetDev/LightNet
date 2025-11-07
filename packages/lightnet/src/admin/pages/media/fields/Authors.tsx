import {
  type Control,
  type FieldValues,
  type Path,
  useFieldArray,
  type UseFormRegister,
  type UseFormSetFocus,
} from "react-hook-form"

import type { MediaItem } from "../../../types/media-item"

export default function Authors({
  control,
  register,
  setFocus,
}: {
  control: Control<MediaItem>
  setFocus: UseFormSetFocus<MediaItem>
  register: UseFormRegister<MediaItem>
}) {
  const { fields, append, remove } = useStringArray({
    name: "authors",
    control,
  })
  return (
    <div className="flex w-full flex-col gap-2 divide-y divide-gray-300">
      {fields.map((author, index) => (
        <div className="flex w-full gap-4">
          <input
            className="dy-input grow"
            key={author.id}
            {...register(`authors.${index}`)}
          />
          <button type="button" onClick={() => remove(index)}>
            Delete
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => {
          append("")
          setTimeout(() => setFocus(`authors.${fields.length}`))
        }}
      >
        + Add Author
      </button>
    </div>
  )
}

function useStringArray<TFieldValues extends FieldValues>({
  name,
  control,
}: {
  name: Path<TFieldValues>
  control: Control<TFieldValues>
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: name as any,
  })
  return {
    fields,
    append(value: string) {
      append(value as any)
    },
    remove,
  }
}

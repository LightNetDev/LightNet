import { type Control } from "react-hook-form"

import ErrorMessage from "../../../components/form/atoms/ErrorMessage"
import Label from "../../../components/form/atoms/Label"
import DynamicArray from "../../../components/form/DynamicArray"
import { useFieldError } from "../../../components/form/hooks/use-field-error"
import type { MediaItem } from "../../../types/media-item"

export default function Collections({
  control,
  collections,
}: {
  control: Control<MediaItem>
  collections: { id: string; labelText: string }[]
}) {
  return (
    <DynamicArray
      control={control}
      name="collections"
      label="ln.admin.collections"
      renderElement={(index) => (
        <div className="flex w-full flex-col py-2">
          <CollectionSelect
            collections={collections}
            control={control}
            index={index}
          />
          <CollectionIndex control={control} index={index} />
        </div>
      )}
      addButton={{
        label: "ln.admin.add-collection",
        onClick: (append, index) =>
          append(
            { collection: "" },
            { focusName: `collections.${index}.collection` },
          ),
      }}
    />
  )
}

function CollectionSelect({
  control,
  collections,
  index,
}: {
  control: Control<MediaItem>
  collections: { id: string; labelText: string }[]
  index: number
}) {
  const name = `collections.${index}.collection` as const
  const errorMessage = useFieldError({ name, control })
  return (
    <>
      <Label for={name} label="ln.admin.name" size="xs" />
      <select
        {...control.register(name)}
        id={name}
        aria-invalid={!!errorMessage}
        className={`dy-select dy-select-bordered text-base shadow-sm ${errorMessage ? "dy-select-error" : ""}`}
      >
        {collections.map(({ id, labelText }) => (
          <option key={id} value={id}>
            {labelText}
          </option>
        ))}
      </select>
      <ErrorMessage message={errorMessage} />
    </>
  )
}

function CollectionIndex({
  control,
  index,
}: {
  control: Control<MediaItem>
  index: number
}) {
  const name = `collections.${index}.index` as const
  const errorMessage = useFieldError({ name, control })
  return (
    <>
      <Label
        for={name}
        label="ln.admin.position-in-collection"
        size="xs"
        className="mt-3"
      />
      <input
        className={`dy-input dy-input-bordered shadow-inner ${errorMessage ? "dy-input-error" : ""}`}
        aria-invalid={!!errorMessage}
        type="number"
        step={1}
        {...control.register(name, {
          setValueAs: (value) => (value === "" ? undefined : Number(value)),
        })}
      />
      <ErrorMessage message={errorMessage} />
    </>
  )
}

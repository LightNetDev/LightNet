import { type Control } from "react-hook-form"

import DynamicArray from "../../../components/form/DynamicArray"
import Input from "../../../components/form/Input"
import Select from "../../../components/form/Select"
import type { MediaItem } from "../../../types/media-item"

export default function Collections({
  control,
  collections,
  defaultValue,
}: {
  control: Control<MediaItem>
  collections: { id: string; labelText: string }[]
  defaultValue: MediaItem["collections"]
}) {
  return (
    <DynamicArray
      control={control}
      name="collections"
      label="ln.admin.collections"
      renderElement={(index) => (
        <div className="flex w-full flex-col gap-4 py-2">
          <Select
            options={collections}
            label="ln.admin.name"
            labelSize="small"
            preserveHintSpace={false}
            name={`collections.${index}.collection`}
            control={control}
            defaultValue={defaultValue[index]?.collection}
          />
          <Input
            type="number"
            control={control}
            label="ln.admin.position-in-collection"
            labelSize="small"
            step={1}
            min={0}
            preserveHintSpace={false}
            defaultValue={defaultValue[index]?.index}
            {...control.register(`collections.${index}.index`, {
              setValueAs: (value) => (value === "" ? undefined : Number(value)),
            })}
          />
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

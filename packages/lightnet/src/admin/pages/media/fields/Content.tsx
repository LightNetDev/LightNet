import { type Control } from "react-hook-form"

import DynamicArray from "../../../components/form/DynamicArray"
import Input from "../../../components/form/Input"
import type { MediaItem } from "../../../types/media-item"

export default function Content({
  control,
  defaultValue,
}: {
  control: Control<MediaItem>
  defaultValue: MediaItem["content"]
}) {
  return (
    <DynamicArray
      control={control}
      name="content"
      required
      label="Content (TODO translation)"
      renderElement={(index) => (
        <div className="flex w-full flex-col gap-6">
          <Input
            control={control}
            label="URL (TODO translation)"
            labelSize="small"
            required
            preserveHintSpace={false}
            defaultValue={defaultValue[index]?.url}
            {...control.register(`content.${index}.url`)}
          />
          <Input
            control={control}
            label="Label (TODO translation)"
            labelSize="small"
            preserveHintSpace={false}
            defaultValue={defaultValue[index]?.label}
            {...control.register(`content.${index}.label`)}
          />
        </div>
      )}
      addButton={{
        label: "Add Link (TODO translation)",
        onClick: (append, index) =>
          append({ url: "" }, { focusName: `content.${index}.url` }),
      }}
    />
  )
}

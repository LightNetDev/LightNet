import { type Control } from "react-hook-form"

import ErrorMessage from "../../../components/form/atoms/ErrorMessage"
import DynamicArray from "../../../components/form/DynamicArray"
import type { MediaItem } from "../../../types/media-item"

export default function Authors({ control }: { control: Control<MediaItem> }) {
  return (
    <DynamicArray
      control={control}
      name="authors"
      label="ln.admin.authors"
      renderElement={(index) => (
        <>
          <input
            className="dy-input dy-input-sm grow"
            {...control.register(`authors.${index}.value`)}
          />
          <ErrorMessage name={`authors.${index}.value`} control={control} />
        </>
      )}
      addButton={{
        label: "ln.admin.add-author",
        onClick: (append, index) =>
          append({ value: "" }, { focusName: `authors.${index}.value` }),
      }}
    />
  )
}

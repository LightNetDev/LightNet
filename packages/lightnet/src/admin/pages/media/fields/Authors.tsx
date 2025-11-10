import {
  type Control,
  type FieldValues,
  type Path,
  useFieldArray,
  type UseFormRegister,
  type UseFormSetFocus,
} from "react-hook-form"

import Icon from "../../../../components/Icon"
import { useI18n } from "../../../../i18n/react/useI18n"
import ErrorMessage from "../../../components/form/atoms/ErrorMessage"
import Hint from "../../../components/form/atoms/Hint"
import Label from "../../../components/form/atoms/Label"
import type { MediaItem } from "../../../types/media-item"

export default function Authors({ control }: { control: Control<MediaItem> }) {
  const { fields, append, remove } = useFieldArray({
    name: "authors",
    control,
  })
  const { t } = useI18n()
  return (
    <fieldset key="authors">
      <legend>
        <Label label="ln.admin.authors" />
      </legend>
      <div className="flex w-full flex-col divide-y divide-gray-300 rounded-lg border border-gray-300">
        {fields.map((author, index) => (
          <div className="p-2" key={author.id}>
            <div className="flex w-full items-center gap-2">
              <input
                className="dy-input dy-input-sm grow"
                {...control.register(`authors.${index}.value`)}
              />
              <button
                className="flex items-center p-2 text-gray-600 hover:text-gray-900"
                type="button"
                onClick={() => remove(index)}
              >
                <Icon
                  className="mdi--remove"
                  ariaLabel={t("ln.admin.remove")}
                />
              </button>
            </div>
            <ErrorMessage
              name={`authors.${index}.value`}
              index={index}
              control={control}
            />
          </div>
        ))}
        <button
          type="button"
          className="p-4 text-sm font-bold text-gray-600 hover:bg-gray-200"
          onClick={() => {
            append(
              { value: "" },
              { focusName: `authors.${fields.length}.value` },
            )
          }}
        >
          {t("ln.admin.add-author")}
        </button>
      </div>
      <ErrorMessage name="authors" control={control} />
      <Hint />
    </fieldset>
  )
}

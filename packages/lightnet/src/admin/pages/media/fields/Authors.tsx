import {
  type Control,
  type FieldError,
  type FieldValues,
  type Merge,
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

export default function Authors({
  control,
  register,
  error,
  setFocus,
}: {
  control: Control<MediaItem>
  error?: Merge<FieldError, (FieldError | undefined)[]>
  setFocus: UseFormSetFocus<MediaItem>
  register: UseFormRegister<MediaItem>
}) {
  const { fields, append, remove } = useStringArray({
    name: "authors",
    control,
  })
  const { t } = useI18n()
  return (
    <fieldset>
      <legend>
        <Label label="Authors" />
      </legend>
      <div className="flex w-full flex-col divide-y divide-gray-300 rounded-lg border border-gray-300">
        {fields.map((author, index) => (
          <div className="px-2 py-4" key={author.id}>
            <div className="flex w-full items-center gap-4">
              <input
                className="dy-input dy-input-sm grow"
                {...register(`authors.${index}`)}
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
            <ErrorMessage message={error?.at?.(index)?.message} />
          </div>
        ))}
        <button
          type="button"
          className="p-6 text-sm font-bold text-gray-600 hover:bg-gray-200"
          onClick={() => {
            append("")
            setTimeout(() => setFocus(`authors.${fields.length}`))
          }}
        >
          {t("ln.admin.add-author")}
        </button>
      </div>
      <ErrorMessage message={error?.message} />
      <Hint />
    </fieldset>
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

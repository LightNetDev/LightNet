import type { ReactNode } from "react"
import {
  type ArrayPath,
  type Control,
  type FieldValues,
  useFieldArray,
  type UseFieldArrayAppend,
} from "react-hook-form"

import Icon from "../../../components/Icon"
import { useI18n } from "../../../i18n/react/use-i18n"
import ErrorMessage from "./atoms/ErrorMessage"
import Hint from "./atoms/Hint"
import Label from "./atoms/Label"
import { useFieldError } from "./hooks/use-field-error"

export default function DynamicArray<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  hint,
  renderElement,
  addButton,
}: {
  name: ArrayPath<TFieldValues>
  label: string
  hint?: string
  control: Control<TFieldValues>
  renderElement: (index: number) => ReactNode
  addButton: {
    label: string
    onClick: (
      append: UseFieldArrayAppend<TFieldValues, ArrayPath<TFieldValues>>,
      elementIndex: number,
    ) => void
  }
}) {
  const { fields, append, remove } = useFieldArray({
    name,
    control,
  })
  const { t } = useI18n()
  const errorMessage = useFieldError({ control, name })
  return (
    <fieldset key={name}>
      <legend>
        <Label label={label} />
      </legend>

      <div className="flex w-full flex-col divide-y divide-gray-300 rounded-lg rounded-ss-none border border-gray-300 bg-gray-100 shadow-sm">
        {fields.map((field, index) => (
          <div className="flex w-full items-center gap-2 p-2" key={field.id}>
            <div className="flex grow flex-col">{renderElement(index)}</div>
            <button
              className="flex items-center rounded-md p-2 text-gray-600 transition-colors ease-in-out hover:text-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700"
              type="button"
              onClick={() => remove(index)}
            >
              <Icon className="mdi--remove" ariaLabel={t("ln.admin.remove")} />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="rounded-b-lg p-4 text-sm font-bold text-gray-500 transition-colors ease-in-out hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700"
          onClick={() => {
            addButton.onClick(append, fields.length)
          }}
        >
          {t(addButton.label)}
        </button>
      </div>
      <ErrorMessage message={errorMessage} />
      <Hint preserveSpace={true} label={hint} />
    </fieldset>
  )
}

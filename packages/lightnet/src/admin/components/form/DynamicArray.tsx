import type { ReactNode } from "react"
import {
  type ArrayPath,
  type Control,
  type FieldValues,
  useFieldArray,
  type UseFieldArrayAppend,
} from "react-hook-form"

import Icon from "../../../components/Icon"
import { useI18n } from "../../../i18n/react/useI18n"
import ErrorMessage from "./atoms/ErrorMessage"
import Hint from "./atoms/Hint"
import Legend from "./atoms/Legend"

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
  return (
    <fieldset key={name}>
      <Legend label={label} />
      <div className="flex w-full flex-col divide-y divide-gray-300 rounded-lg border border-gray-300">
        {fields.map((field, index) => (
          <div className="p-2" key={field.id}>
            <div className="flex w-full items-center gap-2">
              <div className="flex grow flex-col">{renderElement(index)}</div>
              <button
                className="flex items-center p-2 text-gray-600 hover:text-rose-800"
                type="button"
                onClick={() => remove(index)}
              >
                <Icon
                  className="mdi--remove"
                  ariaLabel={t("ln.admin.remove")}
                />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="p-4 text-sm font-bold text-gray-600 hover:bg-gray-200"
          onClick={() => {
            addButton.onClick(append, fields.length)
          }}
        >
          {t(addButton.label)}
        </button>
      </div>
      <ErrorMessage name={name} control={control} />
      <Hint hint={hint} />
    </fieldset>
  )
}

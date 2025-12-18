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
import { useFieldDirty } from "./hooks/use-field-dirty"
import { useFieldError } from "./hooks/use-field-error"
import { getBorderClass } from "./utils/get-border-class"

export default function DynamicArray<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  required = false,
  hint,
  renderElement,
  renderAddButton,
}: {
  name: ArrayPath<TFieldValues>
  required?: boolean
  label: string
  hint?: string
  control: Control<TFieldValues>
  renderElement: (index: number) => ReactNode
  renderAddButton: (args: {
    addElement: UseFieldArrayAppend<TFieldValues, ArrayPath<TFieldValues>>
    index: number
  }) => ReactNode
}) {
  const { fields, append, remove, swap } = useFieldArray({
    name,
    control,
  })
  const errorMessage = useFieldError({ control, name })
  const isDirty = useFieldDirty({ control, name })
  return (
    <fieldset key={name}>
      <legend>
        <Label
          required={required}
          label={label}
          isDirty={isDirty}
          isInvalid={!!errorMessage}
        />
      </legend>

      <div
        className={`flex w-full flex-col gap-1 rounded-xl rounded-ss-none ${getBorderClass({ isDirty, errorMessage })} bg-slate-200 p-1 shadow-inner`}
      >
        {fields.map((field, index) => (
          <div
            className="w-full gap-2 rounded-xl bg-slate-50 px-2 pb-4 shadow-sm"
            key={field.id}
          >
            <div className="-me-2 flex justify-end">
              <ItemActionButton
                icon="mdi--arrow-up"
                label="ln.admin.move-up"
                disabled={index === 0}
                onClick={() => swap(index, index - 1)}
              />
              <ItemActionButton
                icon="mdi--arrow-down"
                label="ln.admin.move-down"
                disabled={index === fields.length - 1}
                onClick={() => swap(index, index + 1)}
              />
              <ItemActionButton
                icon="mdi--remove"
                label="ln.admin.remove"
                onClick={() => remove(index)}
                className="hover:!text-rose-800"
              />
            </div>

            {renderElement(index)}
          </div>
        ))}
        <div className="flex flex-col items-center py-2">
          {renderAddButton({ addElement: append, index: fields.length })}
        </div>
      </div>
      <ErrorMessage message={errorMessage} />
      <Hint preserveSpace={true} label={hint} />
    </fieldset>
  )
}

function ItemActionButton({
  label,
  icon,
  onClick,
  disabled = false,
  className,
}: {
  label: string
  icon: string
  disabled?: boolean
  onClick: () => void
  className?: string
}) {
  const { t } = useI18n()
  return (
    <button
      className={`flex items-center rounded-xl p-2 text-slate-600 transition-colors ease-in-out hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 disabled:text-slate-300 ${className}`}
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      <Icon className={icon} ariaLabel={t(label)} />
    </button>
  )
}

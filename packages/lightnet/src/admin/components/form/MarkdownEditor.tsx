import { lazy, Suspense } from "react"
import { type Control, type FieldValues, type Path } from "react-hook-form"

import ErrorMessage from "./atoms/ErrorMessage"
import Hint from "./atoms/Hint"
import Label from "./atoms/Label"
import { useFieldDirty } from "./hooks/use-field-dirty"
import { useFieldError } from "./hooks/use-field-error"
import { getBorderClass } from "./utils/get-border-class"

const LazyLoadedMarkdownEditor = lazy(
  () => import("./LazyLoadedMarkdownEditor"),
)

export default function MarkdownEditor<TFieldValues extends FieldValues>({
  control,
  name,
  required = false,
  label,
  hint,
}: {
  name: Path<TFieldValues>
  label: string
  required?: boolean
  hint?: string
  control: Control<TFieldValues>
}) {
  const isDirty = useFieldDirty({ control, name })
  const errorMessage = useFieldError({ control, name })

  return (
    <fieldset key={name} className="group">
      <legend>
        <Label
          required={required}
          label={label}
          isDirty={isDirty}
          isInvalid={!!errorMessage}
        />
      </legend>

      <div
        className={`overflow-hidden rounded-lg rounded-ss-none ${getBorderClass({ isDirty, errorMessage, focusWithin: true })} shadow-sm`}
      >
        <Suspense
          fallback={
            <div className="h-[22.75rem] w-full bg-slate-50">
              <div className="h-10 bg-slate-100"></div>
            </div>
          }
        >
          <LazyLoadedMarkdownEditor
            control={control as Control<any>}
            name={name}
          />
        </Suspense>
      </div>
      <ErrorMessage message={errorMessage} />
      <Hint preserveSpace={true} label={hint} />
    </fieldset>
  )
}

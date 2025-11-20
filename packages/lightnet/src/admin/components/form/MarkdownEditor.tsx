import { lazy, Suspense } from "react"
import { type Control, type FieldValues, type Path } from "react-hook-form"

import ErrorMessage from "./atoms/ErrorMessage"
import Hint from "./atoms/Hint"
import Label from "./atoms/Label"
import { useFieldDirty } from "./hooks/use-field-dirty"
import { useFieldError } from "./hooks/use-field-error"

const LazyLoadedMarkdownEditor = lazy(
  () => import("./LazyLoadedMarkdownEditor"),
)

export default function MarkdownEditor<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  hint,
}: {
  name: Path<TFieldValues>
  label: string
  hint?: string
  control: Control<TFieldValues>
}) {
  const isDirty = useFieldDirty({ control, name })
  const errorMessage = useFieldError({ control, name })

  return (
    <fieldset key={name} className="group">
      <legend>
        <Label label={label} isDirty={isDirty} isInvalid={!!errorMessage} />
      </legend>

      <div
        className={`overflow-hidden rounded-lg rounded-ss-none border border-gray-300 shadow-sm group-focus-within:border-blue-700 group-focus-within:ring-1 group-focus-within:ring-blue-700 ${isDirty && !errorMessage ? "border-gray-700" : ""} ${errorMessage ? "border-rose-800" : ""}`}
      >
        <Suspense
          fallback={
            <div className="h-[22.75rem] w-full bg-gray-50">
              <div className="h-10 bg-gray-100"></div>
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

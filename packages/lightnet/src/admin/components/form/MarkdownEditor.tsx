import { lazy, Suspense } from "react"
import { type Control, type FieldValues, type Path } from "react-hook-form"

import ErrorMessage from "./atoms/ErrorMessage"
import Hint from "./atoms/Hint"
import Legend from "./atoms/Legend"
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
  const errorMessage = useFieldError({ control, name })

  return (
    <fieldset key={name}>
      <Legend label={label} />
      <div
        className={`overflow-hidden rounded-lg border border-gray-300 shadow-sm ${errorMessage ? "border-rose-800" : ""}`}
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
      <Hint label={hint} />
    </fieldset>
  )
}

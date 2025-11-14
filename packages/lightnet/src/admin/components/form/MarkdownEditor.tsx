import { lazy, Suspense } from "react"
import { type Control, type FieldValues, type Path } from "react-hook-form"

import Hint from "./atoms/Hint"
import Legend from "./atoms/Legend"

const InternalMarkdownEditor = lazy(() => import("./InternalMarkdownEditor"))

export default function MarkdownEditor<TFieldValues extends FieldValues>({
  control,
  defaultValue,
  name,
  label,
  hint,
}: {
  name: Path<TFieldValues>
  label: string
  hint?: string
  control: Control<TFieldValues>
  defaultValue?: string
}) {
  return (
    <fieldset key={name}>
      <Legend label={label} />
      <div className="overflow-hidden rounded-lg border border-gray-300 shadow-sm">
        <Suspense
          fallback={
            <div className="h-[22.75rem] w-full bg-gray-50">
              <div className="h-10 bg-gray-100"></div>
            </div>
          }
        >
          <InternalMarkdownEditor
            control={control as Control<any>}
            name={name}
            defaultValue={defaultValue}
          />
        </Suspense>
      </div>

      <Hint label={hint} />
    </fieldset>
  )
}

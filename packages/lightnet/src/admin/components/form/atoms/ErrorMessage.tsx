import { type Control } from "react-hook-form"

import { useI18n } from "../../../../i18n/react/useI18n"
import { useFieldError } from "../hooks/use-field-error"

export default function ErrorMessage({
  name,
  control,
  index,
}: {
  name: string
  index?: number
  control: Control<any>
}) {
  const { t } = useI18n()
  const error = useFieldError({ control, name, index })

  if (!error?.message) {
    return null
  }

  return (
    <p className="my-2 flex flex-col gap-1 text-sm text-rose-800" role="alert">
      {t(error.message)}
    </p>
  )
}

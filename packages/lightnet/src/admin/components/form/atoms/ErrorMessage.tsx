import { useFormState, type Control } from "react-hook-form"
import { ErrorMessage as RhfErrorMessage } from "@hookform/error-message"

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
  const { errors } = useFormState({ control, name })
  return (
    <RhfErrorMessage
      errors={errors}
      name={name}
      render={({ message }) => {
        if (!message) {
          return null
        }
        return (
          <p
            className="my-2 flex flex-col gap-1 text-sm text-rose-800"
            role="alert"
          >
            {t(message)}
          </p>
        )
      }}
    />
  )
}

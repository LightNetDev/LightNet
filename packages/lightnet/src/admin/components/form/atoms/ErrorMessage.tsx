import { ErrorMessage as RhfErrorMessage } from "@hookform/error-message"
import { type Control, useFormState } from "react-hook-form"

import { useI18n } from "../../../../i18n/react/useI18n"

export default function ErrorMessage({
  name,
  control,
}: {
  name: string
  control: Control<any>
}) {
  const { t } = useI18n()
  const { errors } = useFormState({ control, name, exact: true })
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

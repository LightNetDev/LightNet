import type { FieldError } from "react-hook-form"

import { useI18n } from "../../../../i18n/react/useI18n"

export default function ErrorMessage({ error }: { error?: FieldError }) {
  const { t } = useI18n()
  if (!error?.message) return null

  return (
    <p className="my-2 flex flex-col gap-1 text-sm text-rose-800" role="alert">
      {t(error.message)}
    </p>
  )
}

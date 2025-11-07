import { useI18n } from "../../../../i18n/react/useI18n"

export default function ErrorMessage({ message }: { message?: string }) {
  const { t } = useI18n()
  if (!message) return null

  return (
    <p className="my-2 flex flex-col gap-1 text-sm text-rose-800" role="alert">
      {t(message)}
    </p>
  )
}

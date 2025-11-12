import { useI18n } from "../../../../i18n/react/useI18n"

export default function Label({
  label,
  for: htmlFor,
}: {
  label: string
  for: string
}) {
  const { t } = useI18n()
  return (
    <label
      htmlFor={htmlFor}
      className="pb-2 text-sm font-bold uppercase text-gray-500"
    >
      {t(label)}
    </label>
  )
}

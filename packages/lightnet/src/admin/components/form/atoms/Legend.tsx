import { useI18n } from "../../../../i18n/react/useI18n"

export default function Label({ label }: { label: string }) {
  const { t } = useI18n()
  return (
    <legend className="pb-2 text-sm font-bold uppercase text-gray-600">
      {t(label)}
    </legend>
  )
}

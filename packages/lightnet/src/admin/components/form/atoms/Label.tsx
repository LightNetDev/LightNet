import { useI18n } from "../../../../i18n/react/useI18n"

export default function Label({ label }: { label: string }) {
  const { t } = useI18n()
  return (
    <div className="dy-label">
      <span className="text-sm font-bold uppercase text-gray-600">
        {t(label)}
      </span>
    </div>
  )
}

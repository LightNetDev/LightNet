import { useI18n } from "../../../../i18n/react/useI18n"

export default function Hint({
  label,
  preserveSpace,
}: {
  label?: string
  preserveSpace: boolean
}) {
  const { t } = useI18n()
  if (!preserveSpace && !label) {
    return null
  }
  return (
    <div className="flex h-8 w-full items-start justify-end p-2">
      {label && <span className="dy-label-text-alt">{t(label)}</span>}
    </div>
  )
}

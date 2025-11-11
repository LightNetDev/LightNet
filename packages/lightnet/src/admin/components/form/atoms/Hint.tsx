import { useI18n } from "../../../../i18n/react/useI18n"

export default function Hint({ hint }: { hint?: string }) {
  const { t } = useI18n()
  return (
    <div className="flex h-12 w-full items-start justify-end p-2">
      {hint && <span className="dy-label-text-alt">{t(hint)}</span>}
    </div>
  )
}

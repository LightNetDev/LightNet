import IconChevronRight from "~icons/mdi/chevron-right.jsx"

import { useI18n } from "../../../i18n/react/use-i18n"

export default function LoadingSkeleton() {
  const { direction } = useI18n()
  const iconDirectionClass = direction === "rtl" ? "scale-x-[-1]" : ""

  return (
    <ul>
      {Array.from({ length: 8 }, (_, index) => (
        <li
          key={index}
          className="flex h-52 animate-pulse items-center overflow-hidden py-2 sm:h-64"
        >
          <div className="h-36 w-36 shrink-0 rounded-md bg-gray-200"></div>
          <div className="ms-5 flex grow flex-col gap-3">
            <div className="h-4 w-1/2 rounded-md bg-gray-200 md:h-6"></div>
            <div className="h-4 w-3/4 rounded-md bg-gray-200 md:h-6"></div>
            <div className="h-4 w-5/6 rounded-md bg-gray-200 md:h-6"></div>
          </div>
          <IconChevronRight
            aria-hidden="true"
            className={`my-auto me-4 ms-2 hidden h-6 w-6 shrink-0 text-gray-300 sm:block ${iconDirectionClass}`}
          />
        </li>
      ))}
    </ul>
  )
}

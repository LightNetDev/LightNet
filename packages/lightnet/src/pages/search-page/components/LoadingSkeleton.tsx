import Icon from "../../../components/Icon"
import { useI18n } from "../../../i18n/react/use-i18n"

export default function LoadingSkeleton() {
  const { direction } = useI18n()
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
          <Icon
            className="my-auto me-4 ms-2 hidden shrink-0 text-2xl text-gray-300 mdi--chevron-right sm:block"
            flipIcon={direction === "rtl"}
            ariaLabel=""
          />
        </li>
      ))}
    </ul>
  )
}

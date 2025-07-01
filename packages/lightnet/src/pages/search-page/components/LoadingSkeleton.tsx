import Icon from "../../../components/Icon"

export default function LoadingSkeleton({ direction }: { direction: string }) {
  return (
    <div className="flex h-52 animate-pulse items-center overflow-hidden py-2 transition-colors ease-in-out sm:h-64 md:rounded-sm">
      <div className="h-36 w-36 shrink-0 rounded-sm bg-gray-200"></div>
      <div className="ms-5 flex grow flex-col gap-3">
        <div className="h-4 w-1/2 rounded-md bg-gray-200 md:h-6"></div>
        <div className="h-4 w-3/4 rounded-md bg-gray-200 md:h-6"></div>
        <div className="h-4 w-5/6 rounded-md bg-gray-200 md:h-6"></div>
      </div>
      <Icon
        className="mdi--chevron-right my-auto me-4 ms-2 hidden shrink-0 text-2xl text-gray-300 sm:block"
        flipIcon={direction === "rtl"}
        ariaLabel=""
      />
    </div>
  )
}

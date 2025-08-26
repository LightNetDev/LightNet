import type { ReactNode } from "react"

type ImageStyle = "default" | "book"

type Props = {
  children: ReactNode
  style?: ImageStyle
  className?: string
}

const rounded: { [key in ImageStyle]: string } = {
  default: "rounded-md",
  book: "rounded-sm",
}

export default function CoverImageDecorator(props: Props) {
  const { children, style = "default", className = "" } = props
  return (
    <div
      className={`relative overflow-hidden ${rounded[style]} shadow-md ${className}`}
    >
      {children}
      {style === "book" && (
        <span className="absolute start-[1%] top-0 h-full w-[2%] bg-gradient-to-r from-gray-500/20 to-transparent" />
      )}
    </div>
  )
}

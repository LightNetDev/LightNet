/**
 * Icon Component.
 *
 * @param className containing a lucide icon name prefixed with 'lucide--'
 * @param ariaLabel accessibility label to be added e.g. for people using a screen reader. Empty string will hide the icon from a screen reader.
 * @param flipIcon if set to true this will mirror the icon along its x-axis. Useful for RTL layouts.
 * @see https://lucide.dev/icons/ for available icons
 * @returns icon
 */
export default function Icon({
  className,
  ariaLabel,
  flipIcon,
}: {
  className: string
  ariaLabel: string
  flipIcon?: boolean
}) {
  return (
    <span
      className={`iconify text-2xl ${className} ${flipIcon && "scale-x-[-1]"}`}
      aria-label={ariaLabel || undefined}
      aria-hidden={!ariaLabel}
      role={ariaLabel ? "img" : undefined}
    />
  )
}

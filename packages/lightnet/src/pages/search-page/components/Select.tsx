type Props = {
  label: string
  initialValue: string | undefined
  valueChange: (value: string) => void
  options: { id: string; labelText: string }[]
}

export default function Select({
  label,
  initialValue,
  valueChange,
  options,
}: Props) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-xs font-bold uppercase text-gray-600">
        {label}
      </span>
      <div className="rounded-2xl border border-gray-300 bg-white px-3 py-2 outline outline-2 outline-offset-2 outline-transparent transition-all ease-in-out focus-within:outline-gray-300">
        <select
          className="h-6 w-full min-w-0 bg-white text-base leading-6 focus:outline-none md:text-sm"
          value={initialValue}
          onChange={(e) => valueChange(e.currentTarget.value)}
        >
          {options.map(({ id, labelText }) => (
            <option key={id} value={id}>
              {labelText}
            </option>
          ))}
        </select>
      </div>
    </label>
  )
}

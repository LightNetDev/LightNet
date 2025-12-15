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
    <label>
      <span className="mb-1 mt-2 block text-xs font-bold uppercase text-gray-600">
        {label}
      </span>
      <div className="rounded-2xl border border-gray-300 bg-white px-4 py-3 shadow-sm outline outline-2 outline-offset-2 outline-transparent transition-all ease-in-out focus-within:outline-gray-300 sm:p-2">
        <select
          className="w-full bg-white focus:outline-none sm:text-sm"
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

type Props = {
  label: string
  initialValue: string
  valueChange: (value: string) => void
  options: { id: string; label: string }[]
}

export default function Select({
  label,
  initialValue,
  valueChange,
  options,
}: Props) {
  return (
    <label className="dy-form-control">
      <span className="mb-1 mt-2 block text-xs font-bold uppercase text-gray-500">
        {label}
      </span>
      <select
        className="dy-select dy-select-bordered sm:dy-select-sm w-full"
        value={initialValue}
        onChange={(e) => valueChange(e.currentTarget.value)}
      >
        {options.map(({ id, label }) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </select>
    </label>
  )
}

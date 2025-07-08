type Props = {
  label: string
  initialValue: string | undefined
  valueChange: (value: string) => void
  options: { id: string; name: string }[]
}

export default function Select({
  label,
  initialValue,
  valueChange,
  options,
}: Props) {
  return (
    <label className="dy-form-control">
      <span className="my-2 block text-xs font-bold uppercase text-gray-500">
        {label}
      </span>
      <select
        className="dy-select dy-select-bordered sm:dy-select-sm w-full rounded-xl"
        value={initialValue}
        onChange={(e) => valueChange(e.currentTarget.value)}
      >
        {options.map(({ id, name }) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
    </label>
  )
}

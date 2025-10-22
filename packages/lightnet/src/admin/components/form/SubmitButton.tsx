import { useFormContext } from "./form-context"

export default function SubmitButton({ label }: { label: string }) {
  const form = useFormContext()
  return (
    <form.Subscribe
      selector={(state) => [state.canSubmit, state.isSubmitting]}
      children={([canSubmit, isSubmitting]) => (
        <button
          className="flex min-w-52 items-center justify-center gap-2 rounded-2xl bg-gray-800 px-6 py-3 font-bold uppercase text-gray-100 shadow-sm hover:bg-gray-950 hover:text-gray-300 disabled:bg-gray-600"
          type="submit"
          disabled={!canSubmit || isSubmitting}
        >
          {label}
        </button>
      )}
    />
  )
}

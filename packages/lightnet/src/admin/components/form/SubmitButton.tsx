import { useFormContext } from "./form-context"

export default function SubmitButton({ label }: { label: string }) {
  const form = useFormContext()
  return (
    <form.Subscribe
      selector={(state) => [state.canSubmit, state.isSubmitting]}
      children={([canSubmit]) => (
        <button
          className="dy-btn dy-btn-primary"
          type="submit"
          disabled={!canSubmit}
        >
          {label}
        </button>
      )}
    />
  )
}

export default function SubmitButton({ label }: { label: string }) {
  return (
    <button className="dy-btn dy-btn-primary" type="submit">
      {label}
    </button>
  )
}

import React from "react"
import { useAppForm } from "../../components/form/hook"

export default function EditPage() {
  const form = useAppForm({
    defaultValues: {
      title: "",
    },
    validators: {
      onChange: ({ value }) => !value.title && "You need to set a title",
    },
    onSubmit: ({ value }) => {
      console.log("submit", value)
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <h1>Edit media item</h1>
      {/* Components are bound to `form` and `field` to ensure extreme type safety */}
      {/* Use `form.AppField` to render a component bound to a single field */}
      <form.AppField
        name="title"
        children={(field) => <field.TextField label="Title" />}
      />
      {/* Components in `form.AppForm` have access to the form context */}
      <form.AppForm>
        <form.SubmitButton label="Save" />
      </form.AppForm>
    </form>
  )
}

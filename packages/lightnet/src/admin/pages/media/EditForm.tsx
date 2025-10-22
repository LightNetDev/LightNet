import React from "react"
import { useAppForm } from "../../components/form"

export default function EditForm() {
  const form = useAppForm({
    defaultValues: {
      title: "",
    },
    onSubmit: ({ value }) => {
      console.log("submit", value)
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="flex flex-col items-start gap-6"
    >
      <form.AppField
        name="title"
        validators={{
          onChange: (value) => !value.value && "Field must not be empty",
        }}
        children={(field) => <field.TextField label="Title" />}
      />
      <form.AppForm>
        <form.SubmitButton label="Save" />
      </form.AppForm>
    </form>
  )
}

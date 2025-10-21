import { createFormHook } from "@tanstack/react-form"
import TextField from "./TextField"
import SubmitButton from "./SubmitButton"
import { fieldContext, formContext } from "./form-context"

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    TextField,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
})

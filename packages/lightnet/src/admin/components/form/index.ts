import { createFormHook } from "@tanstack/react-form"

import { fieldContext, formContext } from "./form-context"
import SubmitButton from "./SubmitButton"
import TextField from "./TextField"

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

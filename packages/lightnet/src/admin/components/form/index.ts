import { createFormHook } from "@tanstack/react-form"

import { fieldContext, formContext } from "./form-context"
import SubmitButton from "./SubmitButton"
import TextInput from "./TextInput"

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    TextInput,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
})

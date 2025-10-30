import { createFormHook } from "@tanstack/react-form"

import { fieldContext, formContext } from "./form-context"
import Input from "./Input"
import SubmitButton from "./SubmitButton"

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    Input,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
})

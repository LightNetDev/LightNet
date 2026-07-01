export const isDefined = <TInput>(
  input: TInput | undefined | false,
): input is TInput => {
  return input !== false && input !== undefined
}

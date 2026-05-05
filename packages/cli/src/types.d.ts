type Translation = {
  type: "built-in" | "user" | "map"
  key: string
  values: Record<string, string | undefined>
}

type Languages = {
  defaultLocale: string
  locales: string[]
}

import { expect, test } from "vitest"

import { resolveCurrentLocaleFromPathname } from "../../src/i18n/resolve-current-locale"

test("Should resolve current locale from localized path", () => {
  const currentLocale = resolveCurrentLocaleFromPathname({
    pathname: "/de/media",
    locales: ["en", "de"],
    defaultLocale: "en",
  })

  expect(currentLocale).toBe("de")
})

test("Should fallback to default locale for unlocalized path", () => {
  const currentLocale = resolveCurrentLocaleFromPathname({
    pathname: "/admin",
    locales: ["en", "de"],
    defaultLocale: "en",
  })

  expect(currentLocale).toBe("en")
})

test("Should fallback to default locale for root path", () => {
  const currentLocale = resolveCurrentLocaleFromPathname({
    pathname: "/",
    locales: ["en", "de"],
    defaultLocale: "en",
  })

  expect(currentLocale).toBe("en")
})

test("Should fallback to default locale for unsupported locale-like segment", () => {
  const currentLocale = resolveCurrentLocaleFromPathname({
    pathname: "/de-AT/media",
    locales: ["en", "de"],
    defaultLocale: "en",
  })

  expect(currentLocale).toBe("en")
})

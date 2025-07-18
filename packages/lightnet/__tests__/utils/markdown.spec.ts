import { expect, test } from "vitest"

import { markdownToText } from "../../src/utils/markdown"

test("Should remove '\\' to force new lines", () => {
  expect(markdownToText("a\\\nb\\ \nc")).toBe("a\nb \nc")
})

test("Should remove <br> to force new lines", () => {
  expect(markdownToText("a <br> b<br>\nc")).toBe("a b \nc")
})

test("Should remove double white space", () => {
  expect(markdownToText("a  b")).toBe("a b")
})

test("Should remove triple white space", () => {
  expect(markdownToText("a   b")).toBe("a b")
})

test("Should remove escape character '\\'", () => {
  // eslint-disable-next-line no-useless-escape
  expect(markdownToText("a \\\* \\\# b")).toBe("a * # b")
})

test("Should remove headers", () => {
  expect(markdownToText("# H1\n## H2 words#")).toBe("H1\nH2 words#")
})

test("Should remove inline modifiers", async () => {
  expect(markdownToText("this is **some bold** and _italic_ text")).toBe(
    "this is some bold and italic text",
  )
})

test("Should remove list", () => {
  expect(markdownToText("- this is **bold**\n- this is normal")).toBe(
    "this is bold\nthis is normal",
  )
})

test("Should convert links", () => {
  expect(markdownToText("some [link](https://link.com?foo)")).toBe("some link")
})

test("Should remove images", () => {
  expect(markdownToText("![a image](my-image.jpg)")).toBe("a image")
})

test("Should remove block quotes", () => {
  expect(markdownToText("> block quote\n>more quote")).toBe(
    "block quote\nmore quote",
  )
})

test("Should return undefined when markdown is undefined", () => {
  expect(markdownToText(undefined)).toBeUndefined()
})

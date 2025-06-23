import { marked } from "marked"

/**
 * Remove markdown syntax and return plain text.
 *
 * @param markdown string
 * @returns plain text
 */

export function markdownToText(markdown?: string) {
  if (!markdown) {
    return markdown
  }
  return (
    markdown
      // line breaks
      .replaceAll(/<br>/g, " ")
      //headers
      .replaceAll(/^#+ ?/gm, "")
      // lists
      .replaceAll(/^- /gm, "")
      // block quotes
      .replaceAll(/^>+ ?/gm, "")
      // bold and italics
      .replaceAll(/(?<!\\)[*_]/g, "")
      // images
      .replaceAll(/!\[(.*?)\]\(.*?\)/g, (_, imgAlt) => imgAlt)
      // links
      .replaceAll(/\[(.*?)\]\(.*?\)/g, (_, linkLabel) => linkLabel)
      // escape character '\'
      .replaceAll(/\\/g, "")
      // multi white spaces
      .replaceAll(/  +/g, " ")
  )
}

/**
 * Converts markdown to a html string
 *
 * @param markdown string
 * @returns html
 */
export function markdownToHtml(markdown?: string) {
  if (!markdown) {
    return markdown
  }
  return marked.parse(markdown)
}

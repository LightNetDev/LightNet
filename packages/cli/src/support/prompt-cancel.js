// @ts-check

import { cancel } from "@clack/prompts"

export class PromptCancelled extends Error {}

/**
 * @returns {never}
 */
export function cancelPrompt() {
  cancel("Operation cancelled.")
  throw new PromptCancelled()
}

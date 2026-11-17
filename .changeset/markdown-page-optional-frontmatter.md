---
"lightnet": patch
---

Make the `frontmatter` prop of `MarkdownPage` optional again. Custom layouts that use `MarkdownPage` from `lightnet/components` no longer fail `astro check` when they don't pass `frontmatter`.

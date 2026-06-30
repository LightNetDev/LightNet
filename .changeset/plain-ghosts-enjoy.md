---
"@lightnet/sveltia-admin": minor
---

Add experimental options to hide admin UI collections and fields:

- `experimental.useCategoriesCollection` (default: `true`): Enable editing `categories`.
- `experimental.useMediaCollectionsCollection` (default: `true`): Enable editing `media-collections`.
- `experimental.useMediaTypesCollection` (default: `true`): Enable editing `media-types`.
- `experimental.useContentLabelField` (default: `true`): Enable editing `content[].label` in the media item editor.
- `experimental.useDateCreatedField` (default: `true`): Enable editing `dateCreated` in the media item editor.
- `experimental.useCommonIdField` (default: `true`): Enable editing `commonId` in the media item editor.
- `experimental.useCategoriesField` (default: `true`): Enable editing categories in the media item editor.
- `experimental.useAuthorsField` (default: `true`): Enable editing authors in the media item editor.
- `experimental.useSlugField` (default: `true`): Enable slug field editor for new collection entries.

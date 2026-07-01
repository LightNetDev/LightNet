---
"@lightnet/sveltia-admin": minor
---

Add experimental options to hide/show admin UI collections and fields:

Hiding:

- `experimental.hideCategoriesCollection` (default: `false`): Hide `categories` collection.
- `experimental.hideMediaTypesCollection` (default: `false`): Hide `media-types` collection.
- `experimental.hideMediaCollectionsCollection` (default: `false`): Hide `media-collections` collection.
- `experimental.hideAuthorsField` (default: `false`): Hide authors field in the media item editor.
- `experimental.hideCategoriesField` (default: `false`): Hide categories field in the media item editor.

Showing:

- `experimental.showContentLabelField` (default: `true`): Show `content[].label` field in the media item editor.
- `experimental.showDateCreatedField` (default: `true`): Show `dateCreated` field in the media item editor.
- `experimental.showCommonIdField` (default: `true`): Show `commonId` field in the media item editor.
- `experimental.showSlugField` (default: `true`): Show `slug` field editor for new collection entries.

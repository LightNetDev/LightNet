---
"lightnet": major
---

Replace implicit string labels with explicit inline locale maps for config and content labels.

## Breaking change

Label fields no longer accept strings (including `x.*` or `ln.*` keys).  
They must now be locale maps with exact site locales.

String values passed to `t(...)` are now treated strictly as translation keys.
If a key is missing, LightNet throws a translation error.

Locale-map label objects can be passed directly to `t(...)`, and are resolved by
the current locale.

Example:

```json
{
  "label": {
    "en": "Hello",
    "de": "Hallo"
  }
}
```

## Migrating

1. Run:
   `npx @lightnet/cli migrate-to-v4 --locales <comma-separated-site-locales>`
2. Fix any unresolved translation keys printed by the script.
3. Ensure every label map contains all and only your configured site locales.

When adding a new site locale:
`npx @lightnet/cli add-site-locale --locale <new-locale> --source-locale <fallback-locale>`

Legacy migration subcommands were removed. Use `migrate-to-v4` for v4 label migration and `add-site-locale` for locale expansion.

`migrate-to-v4` now also removes migrated label translation keys from
`src/translations/*.yml` when safe. Keys still referenced elsewhere are kept
and reported.

## Updated fields

- Config: `title`, `logo.alt`, `languages[].label`, `mainMenu[].label`
- Content: `categories.label`, `media-collections.label`, `media-types.label`, `media[].content[].label`, `media-types.detailsPage.openActionLabel`

## Validation rules

- Locale-map keys must be valid BCP-47 tags.
- All configured site locales are required.
- Extra locale keys are rejected.
- Label values must be non-empty strings.

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
the current locale first, then the default locale.

Example:

```json
{
  "label": {
    "en": "Hello",
    "de": "Hallo"
  }
}
```

## Updated fields

- Config: `title`, `logo.alt`, `mainMenu[].label`
- Content: `languages.label`, `categories.label`, `media-collections.label`, `media-types.label`, `media[].content[].label`, `media-types.detailsPage.openActionLabel`

## Validation rules

- Locale-map keys must be valid BCP-47 tags.
- The default site locale is required.
- Other configured site locales are optional.
- Locale keys must be configured site locales.
- Extra locale keys are rejected.
- Label values must be non-empty strings.

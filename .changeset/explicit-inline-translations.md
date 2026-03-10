---
"lightnet": major
---

Label fields were changed from implicit string values to explicit inline locale maps across config and content. Translation lookups with `t(...)` now treat string inputs strictly as translation keys.

Example label map:

```json
{
  "label": {
    "en": "Hello",
    "de": "Hallo"
  }
}
```

## Breaking changes

- Label fields no longer accept plain strings (including `x.*` or `ln.*` values).
- Label fields must be locale maps scoped to configured site locales.
- `t("...")` now treats string input strictly as a translation key and throws when missing.

Updated fields:

- Config: `title`, `logo.alt`, `mainMenu[].label`
- Content: `languages.label`, `categories.label`, `media-collections.label`, `media-types.label`, `media[].content[].label`, `media-types.detailsPage.openActionLabel`

Validation rules:

- Locale-map keys must be valid BCP-47 tags.
- The default site locale is required.
- Other configured site locales are optional.
- Locale keys must be configured site locales.
- Extra locale keys are rejected.
- Label values must be non-empty strings.

## Migration

1. Convert label strings to locale maps in config.

```json
// before
{
  "title": "My Library",
  "mainMenu": [{ "href": "/about", "label": "About" }]
}

// after
{
  "title": { "en": "My Library" },
  "mainMenu": [{ "href": "/about", "label": { "en": "About" } }]
}
```

2. Convert content label fields to locale maps.

```json
// before
{
  "label": "Books"
}

// after
{
  "label": {
    "en": "Books",
    "de": "Bücher"
  }
}
```

3. Ensure keys passed as strings to `t(...)` exist in translation files.

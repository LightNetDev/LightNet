# LightNet v3 → v4 Migration Guide (Humans)

This guide is for **consumer projects** that depend on the `lightnet` npm package (e.g., a site like `sk8-ministry`). It explains what you need to change in your own repo when upgrading from LightNet v3 to v4.

**Important:** Do not edit files inside `node_modules/lightnet`.

---

**What Changed (Summary)**

1. **Labels are now explicit objects**
   - All label fields must use `{ type, key/text } (translated uses `key`, fixed uses `text`)`.
   - Fixed strings: `{ type: "fixed", text: "My Label" }`
   - Translated labels: `{ type: "translated", key: "someKey" }`

2. **Config `title` is now a label**
   - Your LightNet config `title` must be a label object.

3. **LightNet internal keys changed**
   - Internal keys now use `ln_` + camelCase instead of `ln.` dotted keys.
   - You only need to update usages in your project.

4. **User translation keys are camelized**
   - Keys like `home.bbq.sign-up-now` become `homeBbqSignUpNow`.

5. **Label helpers (recommended)**
   - Use `fixedLabel()` and `translatedLabel()` from `lightnet/utils`.

6. **Content files are YAML**
   - JSON content files must be converted to YAML.
   - `.yml` files must be renamed to `.yaml`.

---

**Before/After Examples**

**Label field (content YAML)**

```yaml
# v3
label: category.bible-studies

# v4
label:
  type: translated
  key: categoryBibleStudies
```

**Config title (`astro.config.mjs`)**

```js
// v3
lightnet({
  title: "site.title",
})

// v4
import { translatedLabel } from "lightnet/utils"

lightnet({
  title: translatedLabel("siteTitle"),
})
```

**LightNet internal key rename (usage only)**

```txt
ln.search.title  ->  ln_searchTitle
ln.details.open  ->  ln_detailsOpen
ln.404.page-not-found  ->  ln_404PageNotFound
```

**User key camelization**

```txt
home.bbq.sign-up-now  ->  homeBbqSignUpNow
category.bible-studies  ->  categoryBibleStudies
```

**JSON → YAML + .yml → .yaml**

```txt
src/content/media/book.json  ->  src/content/media/book.yaml
src/content/categories/foo.yml  ->  src/content/categories/foo.yaml
```

---

**Migration Steps (Human-Readable)**

1. Update your `astro.config.mjs`
   - Use `fixedLabel()` / `translatedLabel()` from `lightnet/utils`.
   - Ensure `title`, `languages[].label`, and `mainMenu[].label` are label objects.

2. Update translation keys in `src/translations/*.yaml`
   - Camelize all user keys (remove dots and hyphens).
   - Update references in pages, content, and config.

3. Update LightNet internal key usages
   - Replace `ln.*` with `ln_` + camelCase in your project code.

4. Update content labels
   - Replace `label: some.key` with the new label object form.

5. Convert content files
   - Convert JSON to YAML.
   - Rename `.yml` → `.yaml`.

---

**Verification (in your project)**

- `rg -n "ln\."` should return no results.
- `rg -n "\.yml$"` in `src/content` should return no results.
- `rg -n "\.json$"` in `src/content` should return no results.
- Run your project’s formatter/lint if applicable.

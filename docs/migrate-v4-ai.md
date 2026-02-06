# LightNet v3 → v4 Migration Guide (AI / Skill-Compatible)

## Purpose

Provide a deterministic, tool-friendly migration procedure for **consumer projects** that depend on the `lightnet` npm package. This guide is structured so it can be copied into a `SKILL.md` with minimal edits.

## Audience

AI coding agents operating on a **consumer repo** (e.g., a site like `sk8-ministry`) that imports `lightnet` via npm.

## Inputs

- Project root with `astro.config.mjs` (or `.ts`)
- `src/translations/*.yaml`
- `src/content/**`
- `src/pages/**` and `src/components/**`

## Outputs

- Updated config and content files compatible with LightNet v4
- Camelized user translation keys
- Updated internal LightNet key usages (`ln_` + camelCase)
- No `.json` content files, no `.yml` extensions

## Constraints

- **Do not edit** `node_modules/lightnet`.
- **Do not** modify LightNet’s internal translations or types.
- Only update the consumer project’s files.

## Steps

1. **Update `astro.config.mjs`**
   - Import helpers: `fixedLabel`, `translatedLabel` from `lightnet/utils`.
   - Ensure `title`, `languages[].label`, `mainMenu[].label` are label objects.

2. **Camelize user translation keys**
   - In `src/translations/*.yaml`, rename keys from dotted/hyphenated to camelCase.
   - Example: `home.bbq.sign-up-now` → `homeBbqSignUpNow`.

3. **Update key usages**
   - Replace old user keys in `src/pages/**`, `src/components/**`, and content files.
   - Replace internal LightNet keys `ln.*` with `ln_` + camelCase (usage only).
     - Example: `ln.search.title` → `ln_searchTitle`.

4. **Update content labels**
   - Replace `label: some.key` with:
     ```yaml
     label:
       type: translated
       key: someKey
     ```
   - For fixed strings:
     ```yaml
     label:
       type: fixed
       text: "Some Text"
     ```

5. **Migrate content file formats**
   - Convert any JSON content files to YAML.
   - Rename `.yml` to `.yaml`.

## Examples

**Config**

```js
import { translatedLabel } from "lightnet/utils"

lightnet({
  title: translatedLabel("siteTitle"),
  mainMenu: [{ href: "/", label: translatedLabel("ln_homeTitle") }],
})
```

**User translation key**

```yaml
# v3
home.bbq.sign-up-now: Sign Up Now

# v4
homeBbqSignUpNow: Sign Up Now
```

**Internal key usage**

```txt
ln.search.title  ->  ln_searchTitle
```

**Content label**

```yaml
label:
  type: translated
  key: categoryBibleStudies
```

## Verification

Run these in the consumer repo:

- `rg -n "ln\."` (should return nothing)
- `rg -n "\.yml$" src/content` (should return nothing)
- `rg -n "\.json$" src/content` (should return nothing)
- Run the project formatter/lint if applicable

## Extension Guidance

When new breaking changes are added in LightNet v4, extend this guide by:

1. Adding a new item to **Steps** in the correct order of dependency.
2. Adding or updating **Examples** for the new change.
3. Updating **Verification** if the change requires new checks.
4. Keeping all instructions scoped to consumer projects only.

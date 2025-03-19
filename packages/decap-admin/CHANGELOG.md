# @lightnet/decap-admin

## 2.4.2

### Patch Changes

- [#224](https://github.com/LightNetDev/LightNet/pull/224) [`bb11b47`](https://github.com/LightNetDev/LightNet/commit/bb11b47ec257208938d7cac8416ef95b9539d5a8) Thanks [@smn-cds](https://github.com/smn-cds)! - Remove decap-cms npm dependency.

## 2.4.1

### Patch Changes

- [#220](https://github.com/LightNetDev/LightNet/pull/220) [`e10c96f`](https://github.com/LightNetDev/LightNet/commit/e10c96fb850db6d043c9bc0c929170c271979492) Thanks [@smn-cds](https://github.com/smn-cds)! - Renames UI language to site language.

## 2.4.0

### Minor Changes

- [#210](https://github.com/LightNetDev/LightNet/pull/210) [`3c89941`](https://github.com/LightNetDev/LightNet/commit/3c89941d98875fd596331b8f97fc6ba0c6ccaca8) Thanks [@smn-cds](https://github.com/smn-cds)! - # Update translation system

  This update introduces major changes on our translation system.

  Changes:

  - Translations are now stored inside `.yml` files.
  - Added i18next as our translation engine
  - Translations now support a flat i18next syntax including (pluralization, contextualization, interpolation)
  - **astro.config.mjs** `language` config has been changed:
    - renamed `isDefaultLocale` to `isDefaultUILanguage`
    - added `isUILanguage` option to set other interface languages. Before this would have been implied by a defined `translations` property.
    - removed `translations` property. Translations are automatically loaded from `src/translations/*.yml` files. Imports can be removed.
    - added `fallbackLanguages` property. Each language can now define a fallback chain.
  - **Astro.locals.i18n.t** Removed `allowFixedStrings` option. We now allow fixed strings by default. `t()` will only fail if a translation key starts with `ln.` or `x.` and cannot be resolved.
  - Added `en` as a fallback language for all translations. This means after all user configured fallbacks LightNet will try resolve the label using the english translations.
  - Changed prefix for user defined translation keys from `custom.` to `x.`.
  - Changed translation keys:
    - `ln.header.a11y.open-main-menu` renamed to `ln.header.open-main-menu`
    - `ln.header.a11y.select-language` renamed to `ln.header.select-language`
    - `ln.common.a11y.external-link` renamed to `ln.external-link`
    - `ln.common.category` renamed to `ln.category_one` (using i18next pluralization)
    - `ln.common.categories` renamed to `ln.category_other` (using i18next pluralization)
    - `ln.common.language` renamed to `ln.language_one` (using i18next pluralization)
    - `ln.common.languages` renamed to `ln.language_other` (using i18next pluralization)
    - `ln.common.type` renamed to `ln.type_one` (using i18next pluralization)

## 2.3.4

### Patch Changes

- [#192](https://github.com/LightNetDev/LightNet/pull/192) [`986b2a3`](https://github.com/LightNetDev/LightNet/commit/986b2a37b7f3aa829708cc0e2ab8d15229b6bdbf) Thanks [@smn-cds](https://github.com/si-fab)! - Update dependencies.

## 2.3.3

### Patch Changes

- [#189](https://github.com/LightNetDev/lightnet/pull/189) [`1e4458a`](https://github.com/LightNetDev/lightnet/commit/1e4458a000684273337b7f9705c0e59fd98b36d2) Thanks [@smn-cds](https://github.com/si-fab)! - Rename "LightNet Library" to "LightNet"

## 2.3.2

### Patch Changes

- [#178](https://github.com/LightNetDev/lightnet/pull/178) [`71bf2cf`](https://github.com/LightNetDev/lightnet/commit/71bf2cf92450c74c1521dd235e2c87bf827c9cc6) Thanks [@smn-cds](https://github.com/si-fab)! - Breaking Change: Renames media-collection `name` property to `label`.

## 2.3.1

### Patch Changes

- [#176](https://github.com/LightNetDev/lightnet/pull/176) [`6b4a664`](https://github.com/LightNetDev/lightnet/commit/6b4a66490079b0688577e6052ab9d7f2d0686170) Thanks [@smn-cds](https://github.com/si-fab)! - Renamed default images folder from `\_images` to `images`.

  To update your project, rename the folder `src/\_images` to `src/images`.
  Also update all image paths inside your media content files.

  Alternatively, you can keep the old name `_images`. In this case, you need to set the `imagesFolder` config option in your `astro.config.mjs` file to `_images`.

## 2.3.0

### Minor Changes

- [#174](https://github.com/LightNetDev/lightnet/pull/174) [`bb011bf`](https://github.com/LightNetDev/lightnet/commit/bb011bfef8c2d7745e3c3417f7f6ef608867e184) Thanks [@smn-cds](https://github.com/si-fab)! - Update Astro to version 5.

  Fix your project by doing this:

  - move `/src/content/config.ts` to `/src/content.config.ts`.
  - update tsconfig.json to match the following:

  ```json
  {
    "extends": "astro/tsconfigs/strict",
    "include": [".astro/types.d.ts", "**/*"],
    "exclude": ["dist"]
  }
  ```

  - remove `src/env.d.ts`
  - add `// @ts-check` on top of `astro.config.mjs`

## 2.2.7

### Patch Changes

- [#158](https://github.com/LightNetDev/lightnet/pull/158) [`c7e752d`](https://github.com/LightNetDev/lightnet/commit/c7e752d0af37d3b8d70cfc4fba14e767537aec9e) Thanks [@smn-cds](https://github.com/si-fab)! - Simplify config format.

  This changes the structure of the language config. `locales`, `defaultLocale`, `translations` have been moved into
  the `languages` array.

  The redirecting `index.astro` on root level can now be removed.

## 2.2.6

### Patch Changes

- [#144](https://github.com/LightNetDev/lightnet/pull/144) [`fdb0c3b`](https://github.com/LightNetDev/lightnet/commit/fdb0c3be6156177b7c8e892272fd280a377024e6) Thanks [@smn-cds](https://github.com/si-fab)! - Fixes build on windows.

## 2.2.5

### Patch Changes

- [#140](https://github.com/LightNetDev/lightnet/pull/140) [`079dfdc`](https://github.com/LightNetDev/lightnet/commit/079dfdc54c9be4a71f890846ce1e82dd3d98699f) Thanks [@smn-cds](https://github.com/si-fab)! - Cleanup details pages export.

## 2.2.4

### Patch Changes

- [#130](https://github.com/LightNetDev/lightnet/pull/130) [`43f3aa2`](https://github.com/LightNetDev/lightnet/commit/43f3aa283f494daaa90708fac196ceaba5393545) Thanks [@smn-cds](https://github.com/si-fab)! - Fixes how slugs are generated for new media collections.

## 2.2.3

### Patch Changes

- [#128](https://github.com/LightNetDev/lightnet/pull/128) [`46af0e3`](https://github.com/LightNetDev/lightnet/commit/46af0e3ad00b16f60ad541e3c9d0a36647bf6bcd) Thanks [@smn-cds](https://github.com/si-fab)! - Renames collection `title` to `name`.

## 2.2.2

### Patch Changes

- [#127](https://github.com/LightNetDev/lightnet/pull/127) [`0adf355`](https://github.com/LightNetDev/lightnet/commit/0adf3555c21bd19120ef8982ca3f5d7e139f433b) Thanks [@smn-cds](https://github.com/si-fab)! - Support rtl text fragments.

## 2.2.1

### Patch Changes

- [#118](https://github.com/LightNetDev/lightnet/pull/118) [`7c406a0`](https://github.com/LightNetDev/lightnet/commit/7c406a0c4a555804249951a7a91dee3545b308b8) Thanks [@smn-cds](https://github.com/si-fab)! - Disables Decap's search, as this was not helpful and only confusing users.

## 2.2.0

### Minor Changes

- [#105](https://github.com/LightNetDev/lightnet/pull/105) [`d3079a7`](https://github.com/LightNetDev/lightnet/commit/d3079a750a93904132d3da87f2fc86fbc64d27c9) Thanks [@smn-cds](https://github.com/si-fab)! - Adds decap cms support for media collections.

## 2.1.0

### Minor Changes

- [#94](https://github.com/LightNetDev/lightnet/pull/94) [`4b26988`](https://github.com/LightNetDev/lightnet/commit/4b2698865fd70a153dd5f5313f3b4f1c71f34e42) Thanks [@smn-cds](https://github.com/si-fab)! - Removes categories from the core and moves them into a content collection.

## 2.0.14

### Patch Changes

- [#70](https://github.com/LightNetDev/lightnet/pull/70) [`01ff2fb`](https://github.com/LightNetDev/lightnet/commit/01ff2fb5a9b89ff9296cc597eedd59d99de03974) Thanks [@smn-cds](https://github.com/si-fab)! - Refactoring & dependency updates

## 2.0.13

### Patch Changes

- [#68](https://github.com/LightNetDev/lightnet/pull/68) [`2792858`](https://github.com/LightNetDev/lightnet/commit/2792858d4bb3bc6589f563c86ff6d35ce19a48e7) Thanks [@smn-cds](https://github.com/si-fab)! - Updates external dependencies.

## 2.0.12

### Patch Changes

- [#50](https://github.com/LightNetDev/lightnet/pull/50) [`1c74e36`](https://github.com/LightNetDev/lightnet/commit/1c74e36f94e0abeac86ad5078d4c86e13ff76342) Thanks [@smn-cds](https://github.com/si-fab)! - Revert back to use decap-cms as dependency.

## 2.0.11

### Patch Changes

- [#49](https://github.com/LightNetDev/lightnet/pull/49) [`bbcf432`](https://github.com/LightNetDev/lightnet/commit/bbcf4323047bbf5022abbc17bca64f236f9e4b0f) Thanks [@smn-cds](https://github.com/si-fab)! - Use decap-cms-app as dependency instead of decap-cms.

## 2.0.10

### Patch Changes

- [#25](https://github.com/LightNetDev/lightnet/pull/25) [`0b00c62`](https://github.com/LightNetDev/lightnet/commit/0b00c62bf8de20fc600ecff617a74aad6a3dddf1) Thanks [@smn-cds](https://github.com/si-fab)! - Fix await resizing of admin images during build.

- Updated dependencies [[`cc2aa25`](https://github.com/LightNetDev/lightnet/commit/cc2aa25d83547091072d9d963804b057bef4c488)]:
  - lightnet@2.0.22

## 2.0.9

### Patch Changes

- [#23](https://github.com/LightNetDev/lightnet/pull/23) [`44544e1`](https://github.com/LightNetDev/lightnet/commit/44544e103855a8fe18e2555f00725d2082ea11a5) Thanks [@smn-cds](https://github.com/si-fab)! - Do not hotlink Decap CMS code. But install it as an npm package.

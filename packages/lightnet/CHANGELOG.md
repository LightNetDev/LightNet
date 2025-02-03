# lightnet

## 2.15.3

### Patch Changes

- [#192](https://github.com/LightNetDev/LightNet/pull/192) [`986b2a3`](https://github.com/LightNetDev/LightNet/commit/986b2a37b7f3aa829708cc0e2ab8d15229b6bdbf) Thanks [@si-fab](https://github.com/si-fab)! - Update dependencies.

- [#192](https://github.com/LightNetDev/LightNet/pull/192) [`986b2a3`](https://github.com/LightNetDev/LightNet/commit/986b2a37b7f3aa829708cc0e2ab8d15229b6bdbf) Thanks [@si-fab](https://github.com/si-fab)! - Make details page main buttons more consistent.

## 2.15.2

### Patch Changes

- [#189](https://github.com/LightNetDev/lightnet/pull/189) [`1e4458a`](https://github.com/LightNetDev/lightnet/commit/1e4458a000684273337b7f9705c0e59fd98b36d2) Thanks [@si-fab](https://github.com/si-fab)! - Rename "LightNet Library" to "LightNet"

## 2.15.1

### Patch Changes

- [#185](https://github.com/LightNetDev/lightnet/pull/185) [`c04b9eb`](https://github.com/LightNetDev/lightnet/commit/c04b9ebb263aaab89d6d4a79862a7b0eb6dfcf33) Thanks [@si-fab](https://github.com/si-fab)! - Fix missing logo was failing the build.

## 2.15.0

### Minor Changes

- [#183](https://github.com/LightNetDev/lightnet/pull/183) [`9c0bb8d`](https://github.com/LightNetDev/lightnet/commit/9c0bb8d2508f8bfbb18dd224a36e7f5d75f89268) Thanks [@si-fab](https://github.com/si-fab)! - Makes logo config optional.

- [#183](https://github.com/LightNetDev/lightnet/pull/183) [`9c0bb8d`](https://github.com/LightNetDev/lightnet/commit/9c0bb8d2508f8bfbb18dd224a36e7f5d75f89268) Thanks [@si-fab](https://github.com/si-fab)! - Rename `Section` component properties

  - change property name `width` to `maxWidth`
  - change property value `content` to `prose`

- [#183](https://github.com/LightNetDev/lightnet/pull/183) [`9c0bb8d`](https://github.com/LightNetDev/lightnet/commit/9c0bb8d2508f8bfbb18dd224a36e7f5d75f89268) Thanks [@si-fab](https://github.com/si-fab)! - Add config option to change the size of the header logo.

- [#183](https://github.com/LightNetDev/lightnet/pull/183) [`9c0bb8d`](https://github.com/LightNetDev/lightnet/commit/9c0bb8d2508f8bfbb18dd224a36e7f5d75f89268) Thanks [@si-fab](https://github.com/si-fab)! - Improve validation of label properties.

  This adds more validation to `label` properties. They all support fixed strings. Currently we are not able to identify if a label value is a translation key or a fixed string. With this release, labels that start with `custom.` or `ln.` prefix will be treated as translation keys. They will fail the build if no translation is found.

  Prefixing custom translation strings with `custom.` is non mandatory but recommended as it improves validation.

  This is changed:

  - rename translate parameter `fallbackToKey` to `allowFixedStrings`.
  - change behavior of the translate function. If `allowFixedStrings` is set to `true`, return the translation key if no translation is found. But fail if the key starts with `custom.` or `ln.` prefix.
  - change example to reflect the new convention of prefixing custom translation keys with `custom.`.

- [#183](https://github.com/LightNetDev/lightnet/pull/183) [`9c0bb8d`](https://github.com/LightNetDev/lightnet/commit/9c0bb8d2508f8bfbb18dd224a36e7f5d75f89268) Thanks [@si-fab](https://github.com/si-fab)! - Implement `landscape` layout for Gallery component.

- [#183](https://github.com/LightNetDev/lightnet/pull/183) [`9c0bb8d`](https://github.com/LightNetDev/lightnet/commit/9c0bb8d2508f8bfbb18dd224a36e7f5d75f89268) Thanks [@si-fab](https://github.com/si-fab)! - Add Right-to-Left support

### Patch Changes

- [#183](https://github.com/LightNetDev/lightnet/pull/183) [`9c0bb8d`](https://github.com/LightNetDev/lightnet/commit/9c0bb8d2508f8bfbb18dd224a36e7f5d75f89268) Thanks [@si-fab](https://github.com/si-fab)! - Remove unused `withoutDefaultTopMargin` option from Section Component.

- [#183](https://github.com/LightNetDev/lightnet/pull/183) [`9c0bb8d`](https://github.com/LightNetDev/lightnet/commit/9c0bb8d2508f8bfbb18dd224a36e7f5d75f89268) Thanks [@si-fab](https://github.com/si-fab)! - Make Icon `className` a required property.

- [#183](https://github.com/LightNetDev/lightnet/pull/183) [`9c0bb8d`](https://github.com/LightNetDev/lightnet/commit/9c0bb8d2508f8bfbb18dd224a36e7f5d75f89268) Thanks [@si-fab](https://github.com/si-fab)! - Adds option to flip an icon.

- [#183](https://github.com/LightNetDev/lightnet/pull/183) [`9c0bb8d`](https://github.com/LightNetDev/lightnet/commit/9c0bb8d2508f8bfbb18dd224a36e7f5d75f89268) Thanks [@si-fab](https://github.com/si-fab)! - Improves error message for missing translations.

- [#183](https://github.com/LightNetDev/lightnet/pull/183) [`9c0bb8d`](https://github.com/LightNetDev/lightnet/commit/9c0bb8d2508f8bfbb18dd224a36e7f5d75f89268) Thanks [@si-fab](https://github.com/si-fab)! - Remove `lang` property from Section component.

- [#183](https://github.com/LightNetDev/lightnet/pull/183) [`9c0bb8d`](https://github.com/LightNetDev/lightnet/commit/9c0bb8d2508f8bfbb18dd224a36e7f5d75f89268) Thanks [@si-fab](https://github.com/si-fab)! - Improve visibility of Primary Button on Hightlight Section

- [#183](https://github.com/LightNetDev/lightnet/pull/183) [`9c0bb8d`](https://github.com/LightNetDev/lightnet/commit/9c0bb8d2508f8bfbb18dd224a36e7f5d75f89268) Thanks [@si-fab](https://github.com/si-fab)! - Require `ariaLabel` param on icons.

- [#183](https://github.com/LightNetDev/lightnet/pull/183) [`9c0bb8d`](https://github.com/LightNetDev/lightnet/commit/9c0bb8d2508f8bfbb18dd224a36e7f5d75f89268) Thanks [@si-fab](https://github.com/si-fab)! - Support fixed strings for category labels.

- [#183](https://github.com/LightNetDev/lightnet/pull/183) [`9c0bb8d`](https://github.com/LightNetDev/lightnet/commit/9c0bb8d2508f8bfbb18dd224a36e7f5d75f89268) Thanks [@si-fab](https://github.com/si-fab)! - Support fixed strings for media types.

## 2.14.2

### Patch Changes

- [#181](https://github.com/LightNetDev/lightnet/pull/181) [`d5ab239`](https://github.com/LightNetDev/lightnet/commit/d5ab239ae4ebae45d50c40c47c62e7891d316585) Thanks [@si-fab](https://github.com/si-fab)! - Rename HightlightSection link.label to link.text.

- [#181](https://github.com/LightNetDev/lightnet/pull/181) [`d5ab239`](https://github.com/LightNetDev/lightnet/commit/d5ab239ae4ebae45d50c40c47c62e7891d316585) Thanks [@si-fab](https://github.com/si-fab)! - Change language 'name' to be a 'label' that can be translated.

## 2.14.1

### Patch Changes

- [#180](https://github.com/LightNetDev/lightnet/pull/180) [`fcf7414`](https://github.com/LightNetDev/lightnet/commit/fcf741427c247c09412e58a3e255294f7b0e69cd) Thanks [@si-fab](https://github.com/si-fab)! - Rename media-type detailsPage.type to detailPage.layout

- [#178](https://github.com/LightNetDev/lightnet/pull/178) [`71bf2cf`](https://github.com/LightNetDev/lightnet/commit/71bf2cf92450c74c1521dd235e2c87bf827c9cc6) Thanks [@si-fab](https://github.com/si-fab)! - Breaking Change: Renames media-collection `name` property to `label`.

## 2.14.0

### Minor Changes

- [#176](https://github.com/LightNetDev/lightnet/pull/176) [`6b4a664`](https://github.com/LightNetDev/lightnet/commit/6b4a66490079b0688577e6052ab9d7f2d0686170) Thanks [@si-fab](https://github.com/si-fab)! - Rename `ImageSection` to `HighlightSection`

- [#176](https://github.com/LightNetDev/lightnet/pull/176) [`6b4a664`](https://github.com/LightNetDev/lightnet/commit/6b4a66490079b0688577e6052ab9d7f2d0686170) Thanks [@si-fab](https://github.com/si-fab)! - Breaking Change: Changes how translations are used.

  Previously you would do something like this:

  ```js
  const t = useTranslate(Astro.currentLocale)

  const translatedString = t("key")
  ```

  Now you do this:

  ```js
  const translatedString = Astro.locals.i18n.t("key")
  ```

- [#176](https://github.com/LightNetDev/lightnet/pull/176) [`6b4a664`](https://github.com/LightNetDev/lightnet/commit/6b4a66490079b0688577e6052ab9d7f2d0686170) Thanks [@si-fab](https://github.com/si-fab)! - Extend Astro.locals.i18n object

  Provide:

  - `defaultLocale`
  - `currentLocale`
  - `locales`

### Patch Changes

- [#176](https://github.com/LightNetDev/lightnet/pull/176) [`6b4a664`](https://github.com/LightNetDev/lightnet/commit/6b4a66490079b0688577e6052ab9d7f2d0686170) Thanks [@si-fab](https://github.com/si-fab)! - Renamed default images folder from `\_images` to `images`.

  To update your project, rename the folder `src/\_images` to `src/images`.
  Also update all image paths inside your media content files.

  Alternatively, you can keep the old name `_images`. In this case, you need to set the `imagesFolder` config option in your `astro.config.mjs` file to `_images`.

## 2.13.0

### Minor Changes

- [#174](https://github.com/LightNetDev/lightnet/pull/174) [`bb011bf`](https://github.com/LightNetDev/lightnet/commit/bb011bfef8c2d7745e3c3417f7f6ef608867e184) Thanks [@si-fab](https://github.com/si-fab)! - Update Astro to version 5.

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

### Patch Changes

- [#174](https://github.com/LightNetDev/lightnet/pull/174) [`bb011bf`](https://github.com/LightNetDev/lightnet/commit/bb011bfef8c2d7745e3c3417f7f6ef608867e184) Thanks [@si-fab](https://github.com/si-fab)! - Improve typings of `Hero` component.

## 2.12.1

### Patch Changes

- [#166](https://github.com/LightNetDev/lightnet/pull/166) [`41f92d3`](https://github.com/LightNetDev/lightnet/commit/41f92d3c21447623fd0545933087dbbcb790fb09) Thanks [@si-fab](https://github.com/si-fab)! - Allow fixed strings for main menu items.

- [#166](https://github.com/LightNetDev/lightnet/pull/166) [`41f92d3`](https://github.com/LightNetDev/lightnet/commit/41f92d3c21447623fd0545933087dbbcb790fb09) Thanks [@si-fab](https://github.com/si-fab)! - Automatically infer `isExternal` for main menu items.

## 2.12.0

### Minor Changes

- [#162](https://github.com/LightNetDev/lightnet/pull/162) [`c6aea9a`](https://github.com/LightNetDev/lightnet/commit/c6aea9acb836024da9f7bf5a8e474dfbf9aaec73) Thanks [@si-fab](https://github.com/si-fab)! - Adds `internalDomains` config option. To include domains that should not show as external e.g. for a large file server.

### Patch Changes

- [#162](https://github.com/LightNetDev/lightnet/pull/162) [`c6aea9a`](https://github.com/LightNetDev/lightnet/commit/c6aea9acb836024da9f7bf5a8e474dfbf9aaec73) Thanks [@si-fab](https://github.com/si-fab)! - Removes unused config openAction label for video details page.

## 2.11.3

### Patch Changes

- [#158](https://github.com/LightNetDev/lightnet/pull/158) [`c7e752d`](https://github.com/LightNetDev/lightnet/commit/c7e752d0af37d3b8d70cfc4fba14e767537aec9e) Thanks [@si-fab](https://github.com/si-fab)! - Simplify config format.

  This changes the structure of the language config. `locales`, `defaultLocale`, `translations` have been moved into
  the `languages` array.

  The redirecting `index.astro` on root level can now be removed.

## 2.11.2

### Patch Changes

- [#147](https://github.com/LightNetDev/lightnet/pull/147) [`4e4b6e3`](https://github.com/LightNetDev/lightnet/commit/4e4b6e356400ce548e014ee824e87845651bc9f8) Thanks [@si-fab](https://github.com/si-fab)! - Improved details page layout/behavior.

## 2.11.1

### Patch Changes

- [#141](https://github.com/LightNetDev/lightnet/pull/141) [`cd1a9a1`](https://github.com/LightNetDev/lightnet/commit/cd1a9a1fc7f85a503207d333c7cb0b17825782ef) Thanks [@si-fab](https://github.com/si-fab)! - Fixes missing download attribute in content section.

## 2.11.0

### Minor Changes

- [#135](https://github.com/LightNetDev/lightnet/pull/135) [`f67143d`](https://github.com/LightNetDev/lightnet/commit/f67143d500dc81760b740c4f27d04ad5f41d240f) Thanks [@si-fab](https://github.com/si-fab)! - Improve details page design. Allow for any number of content links on all pages.

### Patch Changes

- [#135](https://github.com/LightNetDev/lightnet/pull/135) [`f67143d`](https://github.com/LightNetDev/lightnet/commit/f67143d500dc81760b740c4f27d04ad5f41d240f) Thanks [@si-fab](https://github.com/si-fab)! - Restructure media types config.

- [#140](https://github.com/LightNetDev/lightnet/pull/140) [`079dfdc`](https://github.com/LightNetDev/lightnet/commit/079dfdc54c9be4a71f890846ce1e82dd3d98699f) Thanks [@si-fab](https://github.com/si-fab)! - Cleanup details pages export.

- [#135](https://github.com/LightNetDev/lightnet/pull/135) [`f67143d`](https://github.com/LightNetDev/lightnet/commit/f67143d500dc81760b740c4f27d04ad5f41d240f) Thanks [@si-fab](https://github.com/si-fab)! - Do not use Array.toSorted function as this is not widely available with nodejs.

## 2.10.1

### Patch Changes

- [#133](https://github.com/LightNetDev/lightnet/pull/133) [`ed8d0f4`](https://github.com/LightNetDev/lightnet/commit/ed8d0f41feb787e6cd36e38b6d4feb3b64053fa9) Thanks [@si-fab](https://github.com/si-fab)! - Vertically center align search result item content.

## 2.10.0

### Minor Changes

- [#130](https://github.com/LightNetDev/lightnet/pull/130) [`43f3aa2`](https://github.com/LightNetDev/lightnet/commit/43f3aa283f494daaa90708fac196ceaba5393545) Thanks [@si-fab](https://github.com/si-fab)! - Simplifies astro collection config by introducing a shared `LIGHTNET_COLLECTIONS` object.

## 2.9.8

### Patch Changes

- [#128](https://github.com/LightNetDev/lightnet/pull/128) [`46af0e3`](https://github.com/LightNetDev/lightnet/commit/46af0e3ad00b16f60ad541e3c9d0a36647bf6bcd) Thanks [@si-fab](https://github.com/si-fab)! - Renames collection `title` to `name`.

- [#128](https://github.com/LightNetDev/lightnet/pull/128) [`46af0e3`](https://github.com/LightNetDev/lightnet/commit/46af0e3ad00b16f60ad541e3c9d0a36647bf6bcd) Thanks [@si-fab](https://github.com/si-fab)! - Improves search config.

## 2.9.7

### Patch Changes

- [#125](https://github.com/LightNetDev/lightnet/pull/125) [`bf6ea58`](https://github.com/LightNetDev/lightnet/commit/bf6ea58e7bf02e2066e283ced97cc18423777071) Thanks [@si-fab](https://github.com/si-fab)! - Makes type icons on gallery even bigger.

- [#127](https://github.com/LightNetDev/lightnet/pull/127) [`0adf355`](https://github.com/LightNetDev/lightnet/commit/0adf3555c21bd19120ef8982ca3f5d7e139f433b) Thanks [@si-fab](https://github.com/si-fab)! - Support rtl text fragments.

## 2.9.6

### Patch Changes

- [#123](https://github.com/LightNetDev/lightnet/pull/123) [`a45a6dd`](https://github.com/LightNetDev/lightnet/commit/a45a6dd47e88f610ce1c81e943628dc1a073e5a5) Thanks [@si-fab](https://github.com/si-fab)! - Increases gallery type icon size.

## 2.9.5

### Patch Changes

- [#121](https://github.com/LightNetDev/lightnet/pull/121) [`4c6fed3`](https://github.com/LightNetDev/lightnet/commit/4c6fed36dea2ea26325bc847487860b419e299e0) Thanks [@si-fab](https://github.com/si-fab)! - Add type indicator on gallery titles.

## 2.9.4

### Patch Changes

- [#118](https://github.com/LightNetDev/lightnet/pull/118) [`7c406a0`](https://github.com/LightNetDev/lightnet/commit/7c406a0c4a555804249951a7a91dee3545b308b8) Thanks [@si-fab](https://github.com/si-fab)! - Adds more spacing on HomePage + makes it more consistent

- [#118](https://github.com/LightNetDev/lightnet/pull/118) [`7c406a0`](https://github.com/LightNetDev/lightnet/commit/7c406a0c4a555804249951a7a91dee3545b308b8) Thanks [@si-fab](https://github.com/si-fab)! - Fixes search is resetting the all languages filter on browser back navigation.

- [#118](https://github.com/LightNetDev/lightnet/pull/118) [`7c406a0`](https://github.com/LightNetDev/lightnet/commit/7c406a0c4a555804249951a7a91dee3545b308b8) Thanks [@si-fab](https://github.com/si-fab)! - Sorts UI language picker alphabetically.

- [#118](https://github.com/LightNetDev/lightnet/pull/118) [`7c406a0`](https://github.com/LightNetDev/lightnet/commit/7c406a0c4a555804249951a7a91dee3545b308b8) Thanks [@si-fab](https://github.com/si-fab)! - Sorts language, categories, types filter alphabetically

## 2.9.3

### Patch Changes

- [#116](https://github.com/LightNetDev/lightnet/pull/116) [`f913b5c`](https://github.com/LightNetDev/lightnet/commit/f913b5c200fd60333513120c10f76a5ee48336cd) Thanks [@si-fab](https://github.com/si-fab)! - Hides obsolete metadata and filter for types,categories,languages.

## 2.9.2

### Patch Changes

- [#114](https://github.com/LightNetDev/lightnet/pull/114) [`65acd41`](https://github.com/LightNetDev/lightnet/commit/65acd4154bd791f14d59e3842ad1d4a29774120c) Thanks [@si-fab](https://github.com/si-fab)! - Adds indicator of currently hovered gallery item.

- [#114](https://github.com/LightNetDev/lightnet/pull/114) [`65acd41`](https://github.com/LightNetDev/lightnet/commit/65acd4154bd791f14d59e3842ad1d4a29774120c) Thanks [@si-fab](https://github.com/si-fab)! - Changes border radius of gallery items.

- [#114](https://github.com/LightNetDev/lightnet/pull/114) [`65acd41`](https://github.com/LightNetDev/lightnet/commit/65acd4154bd791f14d59e3842ad1d4a29774120c) Thanks [@si-fab](https://github.com/si-fab)! - Increase title fonts on home screen, make them more consistent.

## 2.9.1

### Patch Changes

- [#112](https://github.com/LightNetDev/lightnet/pull/112) [`47bbd2b`](https://github.com/LightNetDev/lightnet/commit/47bbd2b7c10e6e3f0342109384a8fa7203e3ff2c) Thanks [@si-fab](https://github.com/si-fab)! - Renames searchPage config option from `filterByUILanguage` to `filterByLocale`.

## 2.9.0

### Minor Changes

- [#110](https://github.com/LightNetDev/lightnet/pull/110) [`eabc739`](https://github.com/LightNetDev/lightnet/commit/eabc739977a33d4921c68ddbe73eca3611a739e0) Thanks [@si-fab](https://github.com/si-fab)! - Adds option to filter search page by ui language by default.

- [#110](https://github.com/LightNetDev/lightnet/pull/110) [`eabc739`](https://github.com/LightNetDev/lightnet/commit/eabc739977a33d4921c68ddbe73eca3611a739e0) Thanks [@si-fab](https://github.com/si-fab)! - Adds details page export.

### Patch Changes

- [#110](https://github.com/LightNetDev/lightnet/pull/110) [`eabc739`](https://github.com/LightNetDev/lightnet/commit/eabc739977a33d4921c68ddbe73eca3611a739e0) Thanks [@si-fab](https://github.com/si-fab)! - Adds additional line for title on gallery view.

## 2.8.0

### Minor Changes

- [#108](https://github.com/LightNetDev/lightnet/pull/108) [`a4fa683`](https://github.com/LightNetDev/lightnet/commit/a4fa68330eb6a677a6e0826b8ba084962c977548) Thanks [@si-fab](https://github.com/si-fab)! - Adds support for filtering media items by language.

### Patch Changes

- [#108](https://github.com/LightNetDev/lightnet/pull/108) [`a4fa683`](https://github.com/LightNetDev/lightnet/commit/a4fa68330eb6a677a6e0826b8ba084962c977548) Thanks [@si-fab](https://github.com/si-fab)! - Adds support for translation keys as page titles and logo alts

- [#108](https://github.com/LightNetDev/lightnet/pull/108) [`a4fa683`](https://github.com/LightNetDev/lightnet/commit/a4fa68330eb6a677a6e0826b8ba084962c977548) Thanks [@si-fab](https://github.com/si-fab)! - Add customization options for Hero and ImageSection.

## 2.7.0

### Minor Changes

- [#102](https://github.com/LightNetDev/lightnet/pull/102) [`61a47b8`](https://github.com/LightNetDev/lightnet/commit/61a47b8562c992b7e7906a2e77bdf015315912e0) Thanks [@si-fab](https://github.com/si-fab)! - Adds media collections feature.

- [#102](https://github.com/LightNetDev/lightnet/pull/102) [`61a47b8`](https://github.com/LightNetDev/lightnet/commit/61a47b8562c992b7e7906a2e77bdf015315912e0) Thanks [@si-fab](https://github.com/si-fab)! - Removes sortBy and maxItems on gallery.

- [#106](https://github.com/LightNetDev/lightnet/pull/106) [`3d1d4a3`](https://github.com/LightNetDev/lightnet/commit/3d1d4a3306c25e907810c9ae684d5078ac753213) Thanks [@si-fab](https://github.com/si-fab)! - Adds custom details pages

- [#102](https://github.com/LightNetDev/lightnet/pull/102) [`61a47b8`](https://github.com/LightNetDev/lightnet/commit/61a47b8562c992b7e7906a2e77bdf015315912e0) Thanks [@si-fab](https://github.com/si-fab)! - Adds LightNet API layer.

## 2.6.0

### Minor Changes

- [#94](https://github.com/LightNetDev/lightnet/pull/94) [`4b26988`](https://github.com/LightNetDev/lightnet/commit/4b2698865fd70a153dd5f5313f3b4f1c71f34e42) Thanks [@si-fab](https://github.com/si-fab)! - Removes categories from the core and moves them into a content collection.

## 2.5.1

### Patch Changes

- [#92](https://github.com/LightNetDev/lightnet/pull/92) [`3ea503d`](https://github.com/LightNetDev/lightnet/commit/3ea503d3bee4d6de57f777d470965d880fa12b88) Thanks [@si-fab](https://github.com/si-fab)! - Use astro:content `reference` for a media item`s `type` attribute.

## 2.5.0

### Minor Changes

- [#81](https://github.com/LightNetDev/lightnet/pull/81) [`3c82584`](https://github.com/LightNetDev/lightnet/commit/3c82584f894b7df04823edde7c8d78c20ce402e6) Thanks [@si-fab](https://github.com/si-fab)! - Add gallery options: maxItems, sortBy, new layouts

## 2.4.5

### Patch Changes

- [#80](https://github.com/LightNetDev/lightnet/pull/80) [`16e1369`](https://github.com/LightNetDev/lightnet/commit/16e1369a7d65f077a83b3de567aab3c9245b3a35) Thanks [@si-fab](https://github.com/si-fab)! - Update dependencies

- [#75](https://github.com/LightNetDev/lightnet/pull/75) [`3f9088c`](https://github.com/LightNetDev/lightnet/commit/3f9088cc15f93a0005e9c53f417ec9ee3db69667) Thanks [@si-fab](https://github.com/si-fab)! - Allows to rewrite root to /[locale] without requiring a trailing slash.

## 2.4.4

### Patch Changes

- [#73](https://github.com/LightNetDev/lightnet/pull/73) [`2576496`](https://github.com/LightNetDev/lightnet/commit/25764969ba354dd4a57ed96cba61b5395b775d45) Thanks [@si-fab](https://github.com/si-fab)! - Fixes categories filter not beeing translated on search page.

## 2.4.3

### Patch Changes

- [#70](https://github.com/LightNetDev/lightnet/pull/70) [`01ff2fb`](https://github.com/LightNetDev/lightnet/commit/01ff2fb5a9b89ff9296cc597eedd59d99de03974) Thanks [@si-fab](https://github.com/si-fab)! - Refactoring & dependency updates

## 2.4.2

### Patch Changes

- [#68](https://github.com/LightNetDev/lightnet/pull/68) [`2792858`](https://github.com/LightNetDev/lightnet/commit/2792858d4bb3bc6589f563c86ff6d35ce19a48e7) Thanks [@si-fab](https://github.com/si-fab)! - Updates external dependencies.

## 2.4.1

### Patch Changes

- [#55](https://github.com/LightNetDev/lightnet/pull/55) [`61b158b`](https://github.com/LightNetDev/lightnet/commit/61b158ba4e3ceccb955f838e1adededfd889cbb0) Thanks [@si-fab](https://github.com/si-fab)! - Improve header title style.

## 2.4.0

### Minor Changes

- [#53](https://github.com/LightNetDev/lightnet/pull/53) [`b33cb3f`](https://github.com/LightNetDev/lightnet/commit/b33cb3f01aee824b45a7ca362d414dd2b8731073) Thanks [@si-fab](https://github.com/si-fab)! - Add `document` details page.

## 2.3.3

### Patch Changes

- [#44](https://github.com/LightNetDev/lightnet/pull/44) [`c76d792`](https://github.com/LightNetDev/lightnet/commit/c76d79257efa98e4eaf78ef7aa4e49d4d31b586d) Thanks [@si-fab](https://github.com/si-fab)! - Fix more results button styling.

- [#46](https://github.com/LightNetDev/lightnet/pull/46) [`e94dfc9`](https://github.com/LightNetDev/lightnet/commit/e94dfc9cbc97b20dbdf9eac25d56e6dec1c97c37) Thanks [@si-fab](https://github.com/si-fab)! - Fix share button margin was using old `class` prop.

## 2.3.2

### Patch Changes

- [#42](https://github.com/LightNetDev/lightnet/pull/42) [`033b41d`](https://github.com/LightNetDev/lightnet/commit/033b41dacd9d6247dd182099848b23e33482f0a8) Thanks [@si-fab](https://github.com/si-fab)! - Add keys for categories in result list.

- [#42](https://github.com/LightNetDev/lightnet/pull/42) [`033b41d`](https://github.com/LightNetDev/lightnet/commit/033b41dacd9d6247dd182099848b23e33482f0a8) Thanks [@si-fab](https://github.com/si-fab)! - Fix search input debounce.

- [#42](https://github.com/LightNetDev/lightnet/pull/42) [`033b41d`](https://github.com/LightNetDev/lightnet/commit/033b41dacd9d6247dd182099848b23e33482f0a8) Thanks [@si-fab](https://github.com/si-fab)! - Prefetch /api/search.json from all sites.

## 2.3.1

### Patch Changes

- [#40](https://github.com/LightNetDev/lightnet/pull/40) [`016269c`](https://github.com/LightNetDev/lightnet/commit/016269c6532b282551b689e434ff62af4fc31574) Thanks [@si-fab](https://github.com/si-fab)! - Add `/` to absolute paths for favicons and webmanifest.

- [#40](https://github.com/LightNetDev/lightnet/pull/40) [`016269c`](https://github.com/LightNetDev/lightnet/commit/016269c6532b282551b689e434ff62af4fc31574) Thanks [@si-fab](https://github.com/si-fab)! - Better support svg logos.

## 2.3.0

### Minor Changes

- [#38](https://github.com/LightNetDev/lightnet/pull/38) [`6b8e9dc`](https://github.com/LightNetDev/lightnet/commit/6b8e9dc997ef3c3cc5d02bbcceb7592d78c4f32d) Thanks [@si-fab](https://github.com/si-fab)! - Add support for favicons & webmanifest

### Patch Changes

- [#38](https://github.com/LightNetDev/lightnet/pull/38) [`6b8e9dc`](https://github.com/LightNetDev/lightnet/commit/6b8e9dc997ef3c3cc5d02bbcceb7592d78c4f32d) Thanks [@si-fab](https://github.com/si-fab)! - Rename `class` props to be called `className`. This will make our Astro components more consistent with React components.

## 2.2.0

### Minor Changes

- [#36](https://github.com/LightNetDev/lightnet/pull/36) [`d67316d`](https://github.com/LightNetDev/lightnet/commit/d67316da049dd0477dda901cacefac8a8e7db3cd) Thanks [@si-fab](https://github.com/si-fab)! - Provide path utils.

## 2.1.0

### Minor Changes

- [#34](https://github.com/LightNetDev/lightnet/pull/34) [`148d75e`](https://github.com/LightNetDev/lightnet/commit/148d75e602fe9b065cc9f984a7650e988baf400f) Thanks [@si-fab](https://github.com/si-fab)! - Add categories overview component.

### Patch Changes

- [#33](https://github.com/LightNetDev/lightnet/pull/33) [`eb11791`](https://github.com/LightNetDev/lightnet/commit/eb11791d2df3473d788c18876826f6eb0d150ad0) Thanks [@si-fab](https://github.com/si-fab)! - Remove media query export.

- [#28](https://github.com/LightNetDev/lightnet/pull/28) [`9ef7b82`](https://github.com/LightNetDev/lightnet/commit/9ef7b829484b279433cb2bd993de928dc7d86038) Thanks [@si-fab](https://github.com/si-fab)! - Preload react when a user visits any page.

- [#32](https://github.com/LightNetDev/lightnet/pull/32) [`66d7f11`](https://github.com/LightNetDev/lightnet/commit/66d7f11ddd93eb9aa84e0d0f56f72a5c52daaa1b) Thanks [@si-fab](https://github.com/si-fab)! - Hide translations menu when there is only one locale.

- [#30](https://github.com/LightNetDev/lightnet/pull/30) [`55deef9`](https://github.com/LightNetDev/lightnet/commit/55deef90e13048ac08aecd7c3b1799f9d7ed2a65) Thanks [@si-fab](https://github.com/si-fab)! - Load result images immediatelly when visiting the search page.

## 2.0.22

### Patch Changes

- [#27](https://github.com/LightNetDev/lightnet/pull/27) [`cc2aa25`](https://github.com/LightNetDev/lightnet/commit/cc2aa25d83547091072d9d963804b057bef4c488) Thanks [@si-fab](https://github.com/si-fab)! - Replace preact with react

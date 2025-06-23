# lightnet

## 3.4.6

### Patch Changes

- [#271](https://github.com/LightNetDev/LightNet/pull/271) [`1ad0515`](https://github.com/LightNetDev/LightNet/commit/1ad051587cdf68c34a919f414ad2b5c15ffd273e) Thanks [@smn-cds](https://github.com/smn-cds)! - Fix markdown sanitation for search result descriptions.

## 3.4.5

### Patch Changes

- [#266](https://github.com/LightNetDev/LightNet/pull/266) [`4aff54c`](https://github.com/LightNetDev/LightNet/commit/4aff54c7bdd9f9cef26006950cfe7222685fba6c) Thanks [@smn-cds](https://github.com/smn-cds)! - Improve build performance of details pages.

## 3.4.4

### Patch Changes

- [#263](https://github.com/LightNetDev/LightNet/pull/263) [`a0d6dc5`](https://github.com/LightNetDev/LightNet/commit/a0d6dc5750284fc26fe3e85497589376b44c3cce) Thanks [@smn-cds](https://github.com/smn-cds)! - Fixes error when all categories are removed through the Admin UI.

## 3.4.3

### Patch Changes

- [#259](https://github.com/LightNetDev/LightNet/pull/259) [`7e61913`](https://github.com/LightNetDev/LightNet/commit/7e61913cf49863807c25cfdb379a878e47642b03) Thanks [@smn-cds](https://github.com/smn-cds)! - Change language selector icon from "scripts" to "web" icon.

- [#259](https://github.com/LightNetDev/LightNet/pull/259) [`7e61913`](https://github.com/LightNetDev/LightNet/commit/7e61913cf49863807c25cfdb379a878e47642b03) Thanks [@smn-cds](https://github.com/smn-cds)! - Change icon of share button, make it consistent with open button.

## 3.4.2

### Patch Changes

- [#256](https://github.com/LightNetDev/LightNet/pull/256) [`3c005c1`](https://github.com/LightNetDev/LightNet/commit/3c005c10ed55061f00f7d9c74e03be879bd5bb85) Thanks [@smn-cds](https://github.com/smn-cds)! - Improve error messages.

## 3.4.1

### Patch Changes

- [#254](https://github.com/LightNetDev/LightNet/pull/254) [`46c0f7c`](https://github.com/LightNetDev/LightNet/commit/46c0f7c693a46a7a2e06e72c4a333368aa8f7485) Thanks [@smn-cds](https://github.com/smn-cds)! - Improve responsive image variants:

  - Improve image quality on search result items
  - Limit the size of the media list image
  - Streamline details page cover image variants
  - Streamline gallery image variants

## 3.4.0

### Minor Changes

- [#252](https://github.com/LightNetDev/LightNet/pull/252) [`9573e88`](https://github.com/LightNetDev/LightNet/commit/9573e88515f66ade87cb187b59abba498527c693) Thanks [@smn-cds](https://github.com/smn-cds)! - Add config logo option `replacesTitle`. This will hide the title from the header bar.

## 3.3.0

### Minor Changes

- [#250](https://github.com/LightNetDev/LightNet/pull/250) [`bc728aa`](https://github.com/LightNetDev/LightNet/commit/bc728aae93cdba4383167488536e5c6ab3654523) Thanks [@smn-cds](https://github.com/smn-cds)! - Introduce DetailsPage wrapper component

  ‼️ BREAKING CHANGE on experimental custom details page API.

  With this change all custom details pages need to be wrapped by
  a `DetailsPage` component. This component is exported by `@lightnet/experimental-details-page`.
  Previously custom details pages were automatically wrapped by LightNet.

  This is how to create a custom details page:

  ```astro
  ---
  import { DetailsPage } from "@lightNet/experimental-details-page"
  type Props = {
    mediaId
  }
  ---

  <DetailsPage mediaId={Astro.props.mediaId}>
    {/* Your custom details page components go here */}
  </DetailsPage>
  ```

## 3.2.0

### Minor Changes

- [#246](https://github.com/LightNetDev/LightNet/pull/246) [`7c59151`](https://github.com/LightNetDev/LightNet/commit/7c59151a0d2eb698eff9891d0ba780ab29a6efe5) Thanks [@smn-cds](https://github.com/smn-cds)! - Add config option to set a footer component.

## 3.1.2

### Patch Changes

- [#247](https://github.com/LightNetDev/LightNet/pull/247) [`6f926f7`](https://github.com/LightNetDev/LightNet/commit/6f926f7c51753907154c70ad6bcb335813f8829f) Thanks [@smn-cds](https://github.com/smn-cds)! - Fix invalid i18n config passed to Astro.

## 3.1.1

### Patch Changes

- [#243](https://github.com/LightNetDev/LightNet/pull/243) [`735e984`](https://github.com/LightNetDev/LightNet/commit/735e984ee00e67bc0d326e4e67efd45cf10b73e0) Thanks [@smn-cds](https://github.com/smn-cds)! - Fix open button label for websites

  Before website links e.g. https://wikipedia.org showed a "Download" button on the details page.
  With this fix they show a "Open" button.

## 3.1.0

### Minor Changes

- [#238](https://github.com/LightNetDev/LightNet/pull/238) [`3f1cdbc`](https://github.com/LightNetDev/LightNet/commit/3f1cdbcbf83d20bec83a4c6d3bf1b97ec76e72ee) Thanks [@smn-cds](https://github.com/smn-cds)! - Add Audio details page.

### Patch Changes

- [#238](https://github.com/LightNetDev/LightNet/pull/238) [`3f1cdbc`](https://github.com/LightNetDev/LightNet/commit/3f1cdbcbf83d20bec83a4c6d3bf1b97ec76e72ee) Thanks [@smn-cds](https://github.com/smn-cds)! - Update dependencies.

## 3.0.1

### Patch Changes

- [#236](https://github.com/LightNetDev/LightNet/pull/236) [`91776f2`](https://github.com/LightNetDev/LightNet/commit/91776f2998a5a98568b6d96815eeed44c03e0df5) Thanks [@smn-cds](https://github.com/smn-cds)! - Fix details components export.

## 3.0.0

### Major Changes

- [#234](https://github.com/LightNetDev/LightNet/pull/234) [`1cb0dc0`](https://github.com/LightNetDev/LightNet/commit/1cb0dc0ef2d7a3ecb5d2a37a36f2f2e8fa97a756) Thanks [@smn-cds](https://github.com/smn-cds)! - Renames custom details pages prop `slug` to `mediaId`.

- [#234](https://github.com/LightNetDev/LightNet/pull/234) [`1cb0dc0`](https://github.com/LightNetDev/LightNet/commit/1cb0dc0ef2d7a3ecb5d2a37a36f2f2e8fa97a756) Thanks [@smn-cds](https://github.com/smn-cds)! - Streamline handling of components. Make sure all components including a section are suffixed with `Section`.

  - Removes `Gallery` export
  - Adds `MediaGallerySection` that includes the section component
  - Renames `Hero` to `HeroSection`
  - Renames `CategoriesOverview` to `CategoriesSection`
  - Renames `MediaItemList` to `MediaList`

- [#234](https://github.com/LightNetDev/LightNet/pull/234) [`1cb0dc0`](https://github.com/LightNetDev/LightNet/commit/1cb0dc0ef2d7a3ecb5d2a37a36f2f2e8fa97a756) Thanks [@smn-cds](https://github.com/smn-cds)! - Improve Section

  - rename maxWidth values: `full` => `wide`, `prose` => `narrow`
  - add marginTop settings: `none`, `sm`, `lg`

### Minor Changes

- [#234](https://github.com/LightNetDev/LightNet/pull/234) [`1cb0dc0`](https://github.com/LightNetDev/LightNet/commit/1cb0dc0ef2d7a3ecb5d2a37a36f2f2e8fa97a756) Thanks [@smn-cds](https://github.com/smn-cds)! - Exports experimental details page components

- [#234](https://github.com/LightNetDev/LightNet/pull/234) [`1cb0dc0`](https://github.com/LightNetDev/LightNet/commit/1cb0dc0ef2d7a3ecb5d2a37a36f2f2e8fa97a756) Thanks [@smn-cds](https://github.com/smn-cds)! - Accept undefined media items on Gallery and List component.

- [#234](https://github.com/LightNetDev/LightNet/pull/234) [`1cb0dc0`](https://github.com/LightNetDev/LightNet/commit/1cb0dc0ef2d7a3ecb5d2a37a36f2f2e8fa97a756) Thanks [@smn-cds](https://github.com/smn-cds)! - Add VideoPlayer component

- [#234](https://github.com/LightNetDev/LightNet/pull/234) [`1cb0dc0`](https://github.com/LightNetDev/LightNet/commit/1cb0dc0ef2d7a3ecb5d2a37a36f2f2e8fa97a756) Thanks [@smn-cds](https://github.com/smn-cds)! - Add support for custom head components.

## 2.18.2

### Patch Changes

- [#232](https://github.com/LightNetDev/LightNet/pull/232) [`1ab5c4e`](https://github.com/LightNetDev/LightNet/commit/1ab5c4ea5d081d05f99f9e668e05e8cfd23a890d) Thanks [@smn-cds](https://github.com/smn-cds)! - Simplify plural rules.

## 2.18.1

### Patch Changes

- [#230](https://github.com/LightNetDev/LightNet/pull/230) [`afab19a`](https://github.com/LightNetDev/LightNet/commit/afab19a4aa365958289c99805bdf94c6bca978d3) Thanks [@smn-cds](https://github.com/smn-cds)! - Register uk and ru translations.

## 2.18.0

### Minor Changes

- [#228](https://github.com/LightNetDev/LightNet/pull/228) [`b3bb5cc`](https://github.com/LightNetDev/LightNet/commit/b3bb5cc97a4f14ccb46c68f9dcdbe73d74563452) Thanks [@smn-cds](https://github.com/smn-cds)! - Add builtin languages

  - Russian
  - Ukrainian

## 2.17.3

### Patch Changes

- [#226](https://github.com/LightNetDev/LightNet/pull/226) [`8983023`](https://github.com/LightNetDev/LightNet/commit/898302310969a3cd255441241c112f4a8f360789) Thanks [@smn-cds](https://github.com/smn-cds)! - Update dependencies.

## 2.17.2

### Patch Changes

- [#224](https://github.com/LightNetDev/LightNet/pull/224) [`bb11b47`](https://github.com/LightNetDev/LightNet/commit/bb11b47ec257208938d7cac8416ef95b9539d5a8) Thanks [@smn-cds](https://github.com/smn-cds)! - Revert Tailwind CSS back to v3.

## 2.17.1

### Patch Changes

- [#222](https://github.com/LightNetDev/LightNet/pull/222) [`00dd8e9`](https://github.com/LightNetDev/LightNet/commit/00dd8e95a80cdda53c52077ff4caa9c9f6b3b523) Thanks [@smn-cds](https://github.com/smn-cds)! - Fix contrast of more results button.

## 2.17.0

### Minor Changes

- [#220](https://github.com/LightNetDev/LightNet/pull/220) [`e10c96f`](https://github.com/LightNetDev/LightNet/commit/e10c96fb850db6d043c9bc0c929170c271979492) Thanks [@smn-cds](https://github.com/smn-cds)! - Update Tailwind CSS to v4

  - updates `tailwindcss` dependency to version ^4.
  - `@astro/tailwindcss` dependency has been replaced with `@tailwindcss/vite`
  - removes the use of `tailwind.config.js` inside site projects
  - astro config now supports setting `primaryColor` inside the lightnet integration
  - changes default `primaryColor` from `#E6B15C` (yellow-orange) to `#1E2939` (dark gray)

### Patch Changes

- [#220](https://github.com/LightNetDev/LightNet/pull/220) [`e10c96f`](https://github.com/LightNetDev/LightNet/commit/e10c96fb850db6d043c9bc0c929170c271979492) Thanks [@smn-cds](https://github.com/smn-cds)! - Renames UI language to site language.

## 2.16.3

### Patch Changes

- [#217](https://github.com/LightNetDev/LightNet/pull/217) [`c490b1f`](https://github.com/LightNetDev/LightNet/commit/c490b1f0d5d90e0284fba4cf1fe01af5efdf753e) Thanks [@smn-cds](https://github.com/smn-cds)! - Fixed missing translation for de.yml

## 2.16.2

### Patch Changes

- [#215](https://github.com/LightNetDev/LightNet/pull/215) [`6d963a7`](https://github.com/LightNetDev/LightNet/commit/6d963a76df071771bf96a616a4a45103fc068c98) Thanks [@smn-cds](https://github.com/smn-cds)! - Makes translation files imports more static

## 2.16.1

### Patch Changes

- [#213](https://github.com/LightNetDev/LightNet/pull/213) [`d78e4fd`](https://github.com/LightNetDev/LightNet/commit/d78e4fd0c60cef710f57ede45c204ad839ba7f0f) Thanks [@smn-cds](https://github.com/smn-cds)! - Fix loading of built in languages.

## 2.16.0

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

## 2.15.6

### Patch Changes

- [#200](https://github.com/LightNetDev/LightNet/pull/200) [`1cfec1b`](https://github.com/LightNetDev/LightNet/commit/1cfec1b0a0605541879fae86985daaa589a69c2a) Thanks [@smn-cds](https://github.com/si-fab)! - Rename content `name` property to content `label` property.
  Support translations keys as well.

## 2.15.5

### Patch Changes

- [#197](https://github.com/LightNetDev/LightNet/pull/197) [`71fbffc`](https://github.com/LightNetDev/LightNet/commit/71fbffcd9cbe5224ea7ee66a7a7b05e6ecb39d62) Thanks [@smn-cds](https://github.com/si-fab)! - Update dependencies.

## 2.15.4

### Patch Changes

- [#194](https://github.com/LightNetDev/LightNet/pull/194) [`3122a50`](https://github.com/LightNetDev/LightNet/commit/3122a50654b335c84033add33e036ff81e1bdc16) Thanks [@smn-cds](https://github.com/si-fab)! - Change header background color to be pure white.

## 2.15.3

### Patch Changes

- [#192](https://github.com/LightNetDev/LightNet/pull/192) [`986b2a3`](https://github.com/LightNetDev/LightNet/commit/986b2a37b7f3aa829708cc0e2ab8d15229b6bdbf) Thanks [@smn-cds](https://github.com/si-fab)! - Update dependencies.

- [#192](https://github.com/LightNetDev/LightNet/pull/192) [`986b2a3`](https://github.com/LightNetDev/LightNet/commit/986b2a37b7f3aa829708cc0e2ab8d15229b6bdbf) Thanks [@smn-cds](https://github.com/si-fab)! - Make details page main buttons more consistent.

## 2.15.2

### Patch Changes

- [#189](https://github.com/LightNetDev/lightnet/pull/189) [`1e4458a`](https://github.com/LightNetDev/lightnet/commit/1e4458a000684273337b7f9705c0e59fd98b36d2) Thanks [@smn-cds](https://github.com/si-fab)! - Rename "LightNet Library" to "LightNet"

## 2.15.1

### Patch Changes

- [#185](https://github.com/LightNetDev/lightnet/pull/185) [`c04b9eb`](https://github.com/LightNetDev/lightnet/commit/c04b9ebb263aaab89d6d4a79862a7b0eb6dfcf33) Thanks [@smn-cds](https://github.com/si-fab)! - Fix missing logo was failing the build.

## 2.15.0

### Minor Changes

- [#183](https://github.com/LightNetDev/lightnet/pull/183) [`9c0bb8d`](https://github.com/LightNetDev/lightnet/commit/9c0bb8d2508f8bfbb18dd224a36e7f5d75f89268) Thanks [@smn-cds](https://github.com/si-fab)! - Makes logo config optional.

- [#183](https://github.com/LightNetDev/lightnet/pull/183) [`9c0bb8d`](https://github.com/LightNetDev/lightnet/commit/9c0bb8d2508f8bfbb18dd224a36e7f5d75f89268) Thanks [@smn-cds](https://github.com/si-fab)! - Rename `Section` component properties

  - change property name `width` to `maxWidth`
  - change property value `content` to `prose`

- [#183](https://github.com/LightNetDev/lightnet/pull/183) [`9c0bb8d`](https://github.com/LightNetDev/lightnet/commit/9c0bb8d2508f8bfbb18dd224a36e7f5d75f89268) Thanks [@smn-cds](https://github.com/si-fab)! - Add config option to change the size of the header logo.

- [#183](https://github.com/LightNetDev/lightnet/pull/183) [`9c0bb8d`](https://github.com/LightNetDev/lightnet/commit/9c0bb8d2508f8bfbb18dd224a36e7f5d75f89268) Thanks [@smn-cds](https://github.com/si-fab)! - Improve validation of label properties.

  This adds more validation to `label` properties. They all support fixed strings. Currently we are not able to identify if a label value is a translation key or a fixed string. With this release, labels that start with `custom.` or `ln.` prefix will be treated as translation keys. They will fail the build if no translation is found.

  Prefixing custom translation strings with `custom.` is non mandatory but recommended as it improves validation.

  This is changed:

  - rename translate parameter `fallbackToKey` to `allowFixedStrings`.
  - change behavior of the translate function. If `allowFixedStrings` is set to `true`, return the translation key if no translation is found. But fail if the key starts with `custom.` or `ln.` prefix.
  - change example to reflect the new convention of prefixing custom translation keys with `custom.`.

- [#183](https://github.com/LightNetDev/lightnet/pull/183) [`9c0bb8d`](https://github.com/LightNetDev/lightnet/commit/9c0bb8d2508f8bfbb18dd224a36e7f5d75f89268) Thanks [@smn-cds](https://github.com/si-fab)! - Implement `landscape` layout for Gallery component.

- [#183](https://github.com/LightNetDev/lightnet/pull/183) [`9c0bb8d`](https://github.com/LightNetDev/lightnet/commit/9c0bb8d2508f8bfbb18dd224a36e7f5d75f89268) Thanks [@smn-cds](https://github.com/si-fab)! - Add Right-to-Left support

### Patch Changes

- [#183](https://github.com/LightNetDev/lightnet/pull/183) [`9c0bb8d`](https://github.com/LightNetDev/lightnet/commit/9c0bb8d2508f8bfbb18dd224a36e7f5d75f89268) Thanks [@smn-cds](https://github.com/si-fab)! - Remove unused `withoutDefaultTopMargin` option from Section Component.

- [#183](https://github.com/LightNetDev/lightnet/pull/183) [`9c0bb8d`](https://github.com/LightNetDev/lightnet/commit/9c0bb8d2508f8bfbb18dd224a36e7f5d75f89268) Thanks [@smn-cds](https://github.com/si-fab)! - Make Icon `className` a required property.

- [#183](https://github.com/LightNetDev/lightnet/pull/183) [`9c0bb8d`](https://github.com/LightNetDev/lightnet/commit/9c0bb8d2508f8bfbb18dd224a36e7f5d75f89268) Thanks [@smn-cds](https://github.com/si-fab)! - Adds option to flip an icon.

- [#183](https://github.com/LightNetDev/lightnet/pull/183) [`9c0bb8d`](https://github.com/LightNetDev/lightnet/commit/9c0bb8d2508f8bfbb18dd224a36e7f5d75f89268) Thanks [@smn-cds](https://github.com/si-fab)! - Improves error message for missing translations.

- [#183](https://github.com/LightNetDev/lightnet/pull/183) [`9c0bb8d`](https://github.com/LightNetDev/lightnet/commit/9c0bb8d2508f8bfbb18dd224a36e7f5d75f89268) Thanks [@smn-cds](https://github.com/si-fab)! - Remove `lang` property from Section component.

- [#183](https://github.com/LightNetDev/lightnet/pull/183) [`9c0bb8d`](https://github.com/LightNetDev/lightnet/commit/9c0bb8d2508f8bfbb18dd224a36e7f5d75f89268) Thanks [@smn-cds](https://github.com/si-fab)! - Improve visibility of Primary Button on Hightlight Section

- [#183](https://github.com/LightNetDev/lightnet/pull/183) [`9c0bb8d`](https://github.com/LightNetDev/lightnet/commit/9c0bb8d2508f8bfbb18dd224a36e7f5d75f89268) Thanks [@smn-cds](https://github.com/si-fab)! - Require `ariaLabel` param on icons.

- [#183](https://github.com/LightNetDev/lightnet/pull/183) [`9c0bb8d`](https://github.com/LightNetDev/lightnet/commit/9c0bb8d2508f8bfbb18dd224a36e7f5d75f89268) Thanks [@smn-cds](https://github.com/si-fab)! - Support fixed strings for category labels.

- [#183](https://github.com/LightNetDev/lightnet/pull/183) [`9c0bb8d`](https://github.com/LightNetDev/lightnet/commit/9c0bb8d2508f8bfbb18dd224a36e7f5d75f89268) Thanks [@smn-cds](https://github.com/si-fab)! - Support fixed strings for media types.

## 2.14.2

### Patch Changes

- [#181](https://github.com/LightNetDev/lightnet/pull/181) [`d5ab239`](https://github.com/LightNetDev/lightnet/commit/d5ab239ae4ebae45d50c40c47c62e7891d316585) Thanks [@smn-cds](https://github.com/si-fab)! - Rename HightlightSection link.label to link.text.

- [#181](https://github.com/LightNetDev/lightnet/pull/181) [`d5ab239`](https://github.com/LightNetDev/lightnet/commit/d5ab239ae4ebae45d50c40c47c62e7891d316585) Thanks [@smn-cds](https://github.com/si-fab)! - Change language 'name' to be a 'label' that can be translated.

## 2.14.1

### Patch Changes

- [#180](https://github.com/LightNetDev/lightnet/pull/180) [`fcf7414`](https://github.com/LightNetDev/lightnet/commit/fcf741427c247c09412e58a3e255294f7b0e69cd) Thanks [@smn-cds](https://github.com/si-fab)! - Rename media-type detailsPage.type to detailPage.layout

- [#178](https://github.com/LightNetDev/lightnet/pull/178) [`71bf2cf`](https://github.com/LightNetDev/lightnet/commit/71bf2cf92450c74c1521dd235e2c87bf827c9cc6) Thanks [@smn-cds](https://github.com/si-fab)! - Breaking Change: Renames media-collection `name` property to `label`.

## 2.14.0

### Minor Changes

- [#176](https://github.com/LightNetDev/lightnet/pull/176) [`6b4a664`](https://github.com/LightNetDev/lightnet/commit/6b4a66490079b0688577e6052ab9d7f2d0686170) Thanks [@smn-cds](https://github.com/si-fab)! - Rename `ImageSection` to `HighlightSection`

- [#176](https://github.com/LightNetDev/lightnet/pull/176) [`6b4a664`](https://github.com/LightNetDev/lightnet/commit/6b4a66490079b0688577e6052ab9d7f2d0686170) Thanks [@smn-cds](https://github.com/si-fab)! - Breaking Change: Changes how translations are used.

  Previously you would do something like this:

  ```js
  const t = useTranslate(Astro.currentLocale)

  const translatedString = t("key")
  ```

  Now you do this:

  ```js
  const translatedString = Astro.locals.i18n.t("key")
  ```

- [#176](https://github.com/LightNetDev/lightnet/pull/176) [`6b4a664`](https://github.com/LightNetDev/lightnet/commit/6b4a66490079b0688577e6052ab9d7f2d0686170) Thanks [@smn-cds](https://github.com/si-fab)! - Extend Astro.locals.i18n object

  Provide:

  - `defaultLocale`
  - `currentLocale`
  - `locales`

### Patch Changes

- [#176](https://github.com/LightNetDev/lightnet/pull/176) [`6b4a664`](https://github.com/LightNetDev/lightnet/commit/6b4a66490079b0688577e6052ab9d7f2d0686170) Thanks [@smn-cds](https://github.com/si-fab)! - Renamed default images folder from `\_images` to `images`.

  To update your project, rename the folder `src/\_images` to `src/images`.
  Also update all image paths inside your media content files.

  Alternatively, you can keep the old name `_images`. In this case, you need to set the `imagesFolder` config option in your `astro.config.mjs` file to `_images`.

## 2.13.0

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

### Patch Changes

- [#174](https://github.com/LightNetDev/lightnet/pull/174) [`bb011bf`](https://github.com/LightNetDev/lightnet/commit/bb011bfef8c2d7745e3c3417f7f6ef608867e184) Thanks [@smn-cds](https://github.com/si-fab)! - Improve typings of `Hero` component.

## 2.12.1

### Patch Changes

- [#166](https://github.com/LightNetDev/lightnet/pull/166) [`41f92d3`](https://github.com/LightNetDev/lightnet/commit/41f92d3c21447623fd0545933087dbbcb790fb09) Thanks [@smn-cds](https://github.com/si-fab)! - Allow fixed strings for main menu items.

- [#166](https://github.com/LightNetDev/lightnet/pull/166) [`41f92d3`](https://github.com/LightNetDev/lightnet/commit/41f92d3c21447623fd0545933087dbbcb790fb09) Thanks [@smn-cds](https://github.com/si-fab)! - Automatically infer `isExternal` for main menu items.

## 2.12.0

### Minor Changes

- [#162](https://github.com/LightNetDev/lightnet/pull/162) [`c6aea9a`](https://github.com/LightNetDev/lightnet/commit/c6aea9acb836024da9f7bf5a8e474dfbf9aaec73) Thanks [@smn-cds](https://github.com/si-fab)! - Adds `internalDomains` config option. To include domains that should not show as external e.g. for a large file server.

### Patch Changes

- [#162](https://github.com/LightNetDev/lightnet/pull/162) [`c6aea9a`](https://github.com/LightNetDev/lightnet/commit/c6aea9acb836024da9f7bf5a8e474dfbf9aaec73) Thanks [@smn-cds](https://github.com/si-fab)! - Removes unused config openAction label for video details page.

## 2.11.3

### Patch Changes

- [#158](https://github.com/LightNetDev/lightnet/pull/158) [`c7e752d`](https://github.com/LightNetDev/lightnet/commit/c7e752d0af37d3b8d70cfc4fba14e767537aec9e) Thanks [@smn-cds](https://github.com/si-fab)! - Simplify config format.

  This changes the structure of the language config. `locales`, `defaultLocale`, `translations` have been moved into
  the `languages` array.

  The redirecting `index.astro` on root level can now be removed.

## 2.11.2

### Patch Changes

- [#147](https://github.com/LightNetDev/lightnet/pull/147) [`4e4b6e3`](https://github.com/LightNetDev/lightnet/commit/4e4b6e356400ce548e014ee824e87845651bc9f8) Thanks [@smn-cds](https://github.com/si-fab)! - Improved details page layout/behavior.

## 2.11.1

### Patch Changes

- [#141](https://github.com/LightNetDev/lightnet/pull/141) [`cd1a9a1`](https://github.com/LightNetDev/lightnet/commit/cd1a9a1fc7f85a503207d333c7cb0b17825782ef) Thanks [@smn-cds](https://github.com/si-fab)! - Fixes missing download attribute in content section.

## 2.11.0

### Minor Changes

- [#135](https://github.com/LightNetDev/lightnet/pull/135) [`f67143d`](https://github.com/LightNetDev/lightnet/commit/f67143d500dc81760b740c4f27d04ad5f41d240f) Thanks [@smn-cds](https://github.com/si-fab)! - Improve details page design. Allow for any number of content links on all pages.

### Patch Changes

- [#135](https://github.com/LightNetDev/lightnet/pull/135) [`f67143d`](https://github.com/LightNetDev/lightnet/commit/f67143d500dc81760b740c4f27d04ad5f41d240f) Thanks [@smn-cds](https://github.com/si-fab)! - Restructure media types config.

- [#140](https://github.com/LightNetDev/lightnet/pull/140) [`079dfdc`](https://github.com/LightNetDev/lightnet/commit/079dfdc54c9be4a71f890846ce1e82dd3d98699f) Thanks [@smn-cds](https://github.com/si-fab)! - Cleanup details pages export.

- [#135](https://github.com/LightNetDev/lightnet/pull/135) [`f67143d`](https://github.com/LightNetDev/lightnet/commit/f67143d500dc81760b740c4f27d04ad5f41d240f) Thanks [@smn-cds](https://github.com/si-fab)! - Do not use Array.toSorted function as this is not widely available with nodejs.

## 2.10.1

### Patch Changes

- [#133](https://github.com/LightNetDev/lightnet/pull/133) [`ed8d0f4`](https://github.com/LightNetDev/lightnet/commit/ed8d0f41feb787e6cd36e38b6d4feb3b64053fa9) Thanks [@smn-cds](https://github.com/si-fab)! - Vertically center align search result item content.

## 2.10.0

### Minor Changes

- [#130](https://github.com/LightNetDev/lightnet/pull/130) [`43f3aa2`](https://github.com/LightNetDev/lightnet/commit/43f3aa283f494daaa90708fac196ceaba5393545) Thanks [@smn-cds](https://github.com/si-fab)! - Simplifies astro collection config by introducing a shared `LIGHTNET_COLLECTIONS` object.

## 2.9.8

### Patch Changes

- [#128](https://github.com/LightNetDev/lightnet/pull/128) [`46af0e3`](https://github.com/LightNetDev/lightnet/commit/46af0e3ad00b16f60ad541e3c9d0a36647bf6bcd) Thanks [@smn-cds](https://github.com/si-fab)! - Renames collection `title` to `name`.

- [#128](https://github.com/LightNetDev/lightnet/pull/128) [`46af0e3`](https://github.com/LightNetDev/lightnet/commit/46af0e3ad00b16f60ad541e3c9d0a36647bf6bcd) Thanks [@smn-cds](https://github.com/si-fab)! - Improves search config.

## 2.9.7

### Patch Changes

- [#125](https://github.com/LightNetDev/lightnet/pull/125) [`bf6ea58`](https://github.com/LightNetDev/lightnet/commit/bf6ea58e7bf02e2066e283ced97cc18423777071) Thanks [@smn-cds](https://github.com/si-fab)! - Makes type icons on gallery even bigger.

- [#127](https://github.com/LightNetDev/lightnet/pull/127) [`0adf355`](https://github.com/LightNetDev/lightnet/commit/0adf3555c21bd19120ef8982ca3f5d7e139f433b) Thanks [@smn-cds](https://github.com/si-fab)! - Support rtl text fragments.

## 2.9.6

### Patch Changes

- [#123](https://github.com/LightNetDev/lightnet/pull/123) [`a45a6dd`](https://github.com/LightNetDev/lightnet/commit/a45a6dd47e88f610ce1c81e943628dc1a073e5a5) Thanks [@smn-cds](https://github.com/si-fab)! - Increases gallery type icon size.

## 2.9.5

### Patch Changes

- [#121](https://github.com/LightNetDev/lightnet/pull/121) [`4c6fed3`](https://github.com/LightNetDev/lightnet/commit/4c6fed36dea2ea26325bc847487860b419e299e0) Thanks [@smn-cds](https://github.com/si-fab)! - Add type indicator on gallery titles.

## 2.9.4

### Patch Changes

- [#118](https://github.com/LightNetDev/lightnet/pull/118) [`7c406a0`](https://github.com/LightNetDev/lightnet/commit/7c406a0c4a555804249951a7a91dee3545b308b8) Thanks [@smn-cds](https://github.com/si-fab)! - Adds more spacing on HomePage + makes it more consistent

- [#118](https://github.com/LightNetDev/lightnet/pull/118) [`7c406a0`](https://github.com/LightNetDev/lightnet/commit/7c406a0c4a555804249951a7a91dee3545b308b8) Thanks [@smn-cds](https://github.com/si-fab)! - Fixes search is resetting the all languages filter on browser back navigation.

- [#118](https://github.com/LightNetDev/lightnet/pull/118) [`7c406a0`](https://github.com/LightNetDev/lightnet/commit/7c406a0c4a555804249951a7a91dee3545b308b8) Thanks [@smn-cds](https://github.com/si-fab)! - Sorts UI language picker alphabetically.

- [#118](https://github.com/LightNetDev/lightnet/pull/118) [`7c406a0`](https://github.com/LightNetDev/lightnet/commit/7c406a0c4a555804249951a7a91dee3545b308b8) Thanks [@smn-cds](https://github.com/si-fab)! - Sorts language, categories, types filter alphabetically

## 2.9.3

### Patch Changes

- [#116](https://github.com/LightNetDev/lightnet/pull/116) [`f913b5c`](https://github.com/LightNetDev/lightnet/commit/f913b5c200fd60333513120c10f76a5ee48336cd) Thanks [@smn-cds](https://github.com/si-fab)! - Hides obsolete metadata and filter for types,categories,languages.

## 2.9.2

### Patch Changes

- [#114](https://github.com/LightNetDev/lightnet/pull/114) [`65acd41`](https://github.com/LightNetDev/lightnet/commit/65acd4154bd791f14d59e3842ad1d4a29774120c) Thanks [@smn-cds](https://github.com/si-fab)! - Adds indicator of currently hovered gallery item.

- [#114](https://github.com/LightNetDev/lightnet/pull/114) [`65acd41`](https://github.com/LightNetDev/lightnet/commit/65acd4154bd791f14d59e3842ad1d4a29774120c) Thanks [@smn-cds](https://github.com/si-fab)! - Changes border radius of gallery items.

- [#114](https://github.com/LightNetDev/lightnet/pull/114) [`65acd41`](https://github.com/LightNetDev/lightnet/commit/65acd4154bd791f14d59e3842ad1d4a29774120c) Thanks [@smn-cds](https://github.com/si-fab)! - Increase title fonts on home screen, make them more consistent.

## 2.9.1

### Patch Changes

- [#112](https://github.com/LightNetDev/lightnet/pull/112) [`47bbd2b`](https://github.com/LightNetDev/lightnet/commit/47bbd2b7c10e6e3f0342109384a8fa7203e3ff2c) Thanks [@smn-cds](https://github.com/si-fab)! - Renames searchPage config option from `filterByUILanguage` to `filterByLocale`.

## 2.9.0

### Minor Changes

- [#110](https://github.com/LightNetDev/lightnet/pull/110) [`eabc739`](https://github.com/LightNetDev/lightnet/commit/eabc739977a33d4921c68ddbe73eca3611a739e0) Thanks [@smn-cds](https://github.com/si-fab)! - Adds option to filter search page by ui language by default.

- [#110](https://github.com/LightNetDev/lightnet/pull/110) [`eabc739`](https://github.com/LightNetDev/lightnet/commit/eabc739977a33d4921c68ddbe73eca3611a739e0) Thanks [@smn-cds](https://github.com/si-fab)! - Adds details page export.

### Patch Changes

- [#110](https://github.com/LightNetDev/lightnet/pull/110) [`eabc739`](https://github.com/LightNetDev/lightnet/commit/eabc739977a33d4921c68ddbe73eca3611a739e0) Thanks [@smn-cds](https://github.com/si-fab)! - Adds additional line for title on gallery view.

## 2.8.0

### Minor Changes

- [#108](https://github.com/LightNetDev/lightnet/pull/108) [`a4fa683`](https://github.com/LightNetDev/lightnet/commit/a4fa68330eb6a677a6e0826b8ba084962c977548) Thanks [@smn-cds](https://github.com/si-fab)! - Adds support for filtering media items by language.

### Patch Changes

- [#108](https://github.com/LightNetDev/lightnet/pull/108) [`a4fa683`](https://github.com/LightNetDev/lightnet/commit/a4fa68330eb6a677a6e0826b8ba084962c977548) Thanks [@smn-cds](https://github.com/si-fab)! - Adds support for translation keys as page titles and logo alts

- [#108](https://github.com/LightNetDev/lightnet/pull/108) [`a4fa683`](https://github.com/LightNetDev/lightnet/commit/a4fa68330eb6a677a6e0826b8ba084962c977548) Thanks [@smn-cds](https://github.com/si-fab)! - Add customization options for Hero and ImageSection.

## 2.7.0

### Minor Changes

- [#102](https://github.com/LightNetDev/lightnet/pull/102) [`61a47b8`](https://github.com/LightNetDev/lightnet/commit/61a47b8562c992b7e7906a2e77bdf015315912e0) Thanks [@smn-cds](https://github.com/si-fab)! - Adds media collections feature.

- [#102](https://github.com/LightNetDev/lightnet/pull/102) [`61a47b8`](https://github.com/LightNetDev/lightnet/commit/61a47b8562c992b7e7906a2e77bdf015315912e0) Thanks [@smn-cds](https://github.com/si-fab)! - Removes sortBy and maxItems on gallery.

- [#106](https://github.com/LightNetDev/lightnet/pull/106) [`3d1d4a3`](https://github.com/LightNetDev/lightnet/commit/3d1d4a3306c25e907810c9ae684d5078ac753213) Thanks [@smn-cds](https://github.com/si-fab)! - Adds custom details pages

- [#102](https://github.com/LightNetDev/lightnet/pull/102) [`61a47b8`](https://github.com/LightNetDev/lightnet/commit/61a47b8562c992b7e7906a2e77bdf015315912e0) Thanks [@smn-cds](https://github.com/si-fab)! - Adds LightNet API layer.

## 2.6.0

### Minor Changes

- [#94](https://github.com/LightNetDev/lightnet/pull/94) [`4b26988`](https://github.com/LightNetDev/lightnet/commit/4b2698865fd70a153dd5f5313f3b4f1c71f34e42) Thanks [@smn-cds](https://github.com/si-fab)! - Removes categories from the core and moves them into a content collection.

## 2.5.1

### Patch Changes

- [#92](https://github.com/LightNetDev/lightnet/pull/92) [`3ea503d`](https://github.com/LightNetDev/lightnet/commit/3ea503d3bee4d6de57f777d470965d880fa12b88) Thanks [@smn-cds](https://github.com/si-fab)! - Use astro:content `reference` for a media item`s `type` attribute.

## 2.5.0

### Minor Changes

- [#81](https://github.com/LightNetDev/lightnet/pull/81) [`3c82584`](https://github.com/LightNetDev/lightnet/commit/3c82584f894b7df04823edde7c8d78c20ce402e6) Thanks [@smn-cds](https://github.com/si-fab)! - Add gallery options: maxItems, sortBy, new layouts

## 2.4.5

### Patch Changes

- [#80](https://github.com/LightNetDev/lightnet/pull/80) [`16e1369`](https://github.com/LightNetDev/lightnet/commit/16e1369a7d65f077a83b3de567aab3c9245b3a35) Thanks [@smn-cds](https://github.com/si-fab)! - Update dependencies

- [#75](https://github.com/LightNetDev/lightnet/pull/75) [`3f9088c`](https://github.com/LightNetDev/lightnet/commit/3f9088cc15f93a0005e9c53f417ec9ee3db69667) Thanks [@smn-cds](https://github.com/si-fab)! - Allows to rewrite root to /[locale] without requiring a trailing slash.

## 2.4.4

### Patch Changes

- [#73](https://github.com/LightNetDev/lightnet/pull/73) [`2576496`](https://github.com/LightNetDev/lightnet/commit/25764969ba354dd4a57ed96cba61b5395b775d45) Thanks [@smn-cds](https://github.com/si-fab)! - Fixes categories filter not beeing translated on search page.

## 2.4.3

### Patch Changes

- [#70](https://github.com/LightNetDev/lightnet/pull/70) [`01ff2fb`](https://github.com/LightNetDev/lightnet/commit/01ff2fb5a9b89ff9296cc597eedd59d99de03974) Thanks [@smn-cds](https://github.com/si-fab)! - Refactoring & dependency updates

## 2.4.2

### Patch Changes

- [#68](https://github.com/LightNetDev/lightnet/pull/68) [`2792858`](https://github.com/LightNetDev/lightnet/commit/2792858d4bb3bc6589f563c86ff6d35ce19a48e7) Thanks [@smn-cds](https://github.com/si-fab)! - Updates external dependencies.

## 2.4.1

### Patch Changes

- [#55](https://github.com/LightNetDev/lightnet/pull/55) [`61b158b`](https://github.com/LightNetDev/lightnet/commit/61b158ba4e3ceccb955f838e1adededfd889cbb0) Thanks [@smn-cds](https://github.com/si-fab)! - Improve header title style.

## 2.4.0

### Minor Changes

- [#53](https://github.com/LightNetDev/lightnet/pull/53) [`b33cb3f`](https://github.com/LightNetDev/lightnet/commit/b33cb3f01aee824b45a7ca362d414dd2b8731073) Thanks [@smn-cds](https://github.com/si-fab)! - Add `document` details page.

## 2.3.3

### Patch Changes

- [#44](https://github.com/LightNetDev/lightnet/pull/44) [`c76d792`](https://github.com/LightNetDev/lightnet/commit/c76d79257efa98e4eaf78ef7aa4e49d4d31b586d) Thanks [@smn-cds](https://github.com/si-fab)! - Fix more results button styling.

- [#46](https://github.com/LightNetDev/lightnet/pull/46) [`e94dfc9`](https://github.com/LightNetDev/lightnet/commit/e94dfc9cbc97b20dbdf9eac25d56e6dec1c97c37) Thanks [@smn-cds](https://github.com/si-fab)! - Fix share button margin was using old `class` prop.

## 2.3.2

### Patch Changes

- [#42](https://github.com/LightNetDev/lightnet/pull/42) [`033b41d`](https://github.com/LightNetDev/lightnet/commit/033b41dacd9d6247dd182099848b23e33482f0a8) Thanks [@smn-cds](https://github.com/si-fab)! - Add keys for categories in result list.

- [#42](https://github.com/LightNetDev/lightnet/pull/42) [`033b41d`](https://github.com/LightNetDev/lightnet/commit/033b41dacd9d6247dd182099848b23e33482f0a8) Thanks [@smn-cds](https://github.com/si-fab)! - Fix search input debounce.

- [#42](https://github.com/LightNetDev/lightnet/pull/42) [`033b41d`](https://github.com/LightNetDev/lightnet/commit/033b41dacd9d6247dd182099848b23e33482f0a8) Thanks [@smn-cds](https://github.com/si-fab)! - Prefetch /api/search.json from all sites.

## 2.3.1

### Patch Changes

- [#40](https://github.com/LightNetDev/lightnet/pull/40) [`016269c`](https://github.com/LightNetDev/lightnet/commit/016269c6532b282551b689e434ff62af4fc31574) Thanks [@smn-cds](https://github.com/si-fab)! - Add `/` to absolute paths for favicons and webmanifest.

- [#40](https://github.com/LightNetDev/lightnet/pull/40) [`016269c`](https://github.com/LightNetDev/lightnet/commit/016269c6532b282551b689e434ff62af4fc31574) Thanks [@smn-cds](https://github.com/si-fab)! - Better support svg logos.

## 2.3.0

### Minor Changes

- [#38](https://github.com/LightNetDev/lightnet/pull/38) [`6b8e9dc`](https://github.com/LightNetDev/lightnet/commit/6b8e9dc997ef3c3cc5d02bbcceb7592d78c4f32d) Thanks [@smn-cds](https://github.com/si-fab)! - Add support for favicons & webmanifest

### Patch Changes

- [#38](https://github.com/LightNetDev/lightnet/pull/38) [`6b8e9dc`](https://github.com/LightNetDev/lightnet/commit/6b8e9dc997ef3c3cc5d02bbcceb7592d78c4f32d) Thanks [@smn-cds](https://github.com/si-fab)! - Rename `class` props to be called `className`. This will make our Astro components more consistent with React components.

## 2.2.0

### Minor Changes

- [#36](https://github.com/LightNetDev/lightnet/pull/36) [`d67316d`](https://github.com/LightNetDev/lightnet/commit/d67316da049dd0477dda901cacefac8a8e7db3cd) Thanks [@smn-cds](https://github.com/si-fab)! - Provide path utils.

## 2.1.0

### Minor Changes

- [#34](https://github.com/LightNetDev/lightnet/pull/34) [`148d75e`](https://github.com/LightNetDev/lightnet/commit/148d75e602fe9b065cc9f984a7650e988baf400f) Thanks [@smn-cds](https://github.com/si-fab)! - Add categories overview component.

### Patch Changes

- [#33](https://github.com/LightNetDev/lightnet/pull/33) [`eb11791`](https://github.com/LightNetDev/lightnet/commit/eb11791d2df3473d788c18876826f6eb0d150ad0) Thanks [@smn-cds](https://github.com/si-fab)! - Remove media query export.

- [#28](https://github.com/LightNetDev/lightnet/pull/28) [`9ef7b82`](https://github.com/LightNetDev/lightnet/commit/9ef7b829484b279433cb2bd993de928dc7d86038) Thanks [@smn-cds](https://github.com/si-fab)! - Preload react when a user visits any page.

- [#32](https://github.com/LightNetDev/lightnet/pull/32) [`66d7f11`](https://github.com/LightNetDev/lightnet/commit/66d7f11ddd93eb9aa84e0d0f56f72a5c52daaa1b) Thanks [@smn-cds](https://github.com/si-fab)! - Hide translations menu when there is only one locale.

- [#30](https://github.com/LightNetDev/lightnet/pull/30) [`55deef9`](https://github.com/LightNetDev/lightnet/commit/55deef90e13048ac08aecd7c3b1799f9d7ed2a65) Thanks [@smn-cds](https://github.com/si-fab)! - Load result images immediatelly when visiting the search page.

## 2.0.22

### Patch Changes

- [#27](https://github.com/LightNetDev/lightnet/pull/27) [`cc2aa25`](https://github.com/LightNetDev/lightnet/commit/cc2aa25d83547091072d9d963804b057bef4c488) Thanks [@smn-cds](https://github.com/si-fab)! - Replace preact with react

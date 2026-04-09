# @lightnet/sveltia-admin

## 4.0.3

### Patch Changes

- [#378](https://github.com/LightNetDev/LightNet/pull/378) [`bc3d294`](https://github.com/LightNetDev/LightNet/commit/bc3d2949baacb6c577770de18902ddbd04ede10f) Thanks [@smn-cds](https://github.com/smn-cds)! - Improve language admin ui label

- [#378](https://github.com/LightNetDev/LightNet/pull/378) [`bc3d294`](https://github.com/LightNetDev/LightNet/commit/bc3d2949baacb6c577770de18902ddbd04ede10f) Thanks [@smn-cds](https://github.com/smn-cds)! - Update dependencies

## 4.0.2

### Patch Changes

- [#374](https://github.com/LightNetDev/LightNet/pull/374) [`efcedcf`](https://github.com/LightNetDev/LightNet/commit/efcedcf6ef06e16e2b9151e14de8dd8337ff76da) Thanks [@smn-cds](https://github.com/smn-cds)! - Update dependencies

- [#374](https://github.com/LightNetDev/LightNet/pull/374) [`efcedcf`](https://github.com/LightNetDev/LightNet/commit/efcedcf6ef06e16e2b9151e14de8dd8337ff76da) Thanks [@smn-cds](https://github.com/smn-cds)! - Use ascii encoding for sveltia slugs

- [#374](https://github.com/LightNetDev/LightNet/pull/374) [`efcedcf`](https://github.com/LightNetDev/LightNet/commit/efcedcf6ef06e16e2b9151e14de8dd8337ff76da) Thanks [@smn-cds](https://github.com/smn-cds)! - Disable reorder from languages admin.

## 4.0.1

### Patch Changes

- [#368](https://github.com/LightNetDev/LightNet/pull/368) [`e47f57b`](https://github.com/LightNetDev/LightNet/commit/e47f57b620ef269f49341e976d71b50e42c23f8a) Thanks [@smn-cds](https://github.com/smn-cds)! - Limit published package contents to runtime files only.

## 4.0.0

### Major Changes

- [#361](https://github.com/LightNetDev/LightNet/pull/361) [`65b3eec`](https://github.com/LightNetDev/LightNet/commit/65b3eec5b68565237b46c6423d21257ad4747dce) Thanks [@smn-cds](https://github.com/smn-cds)! - The `imagesFolder` option was removed from `@lightnet/sveltia-admin`, and image fields now always use the content-adjacent `images` directory.

- [#361](https://github.com/LightNetDev/LightNet/pull/361) [`65b3eec`](https://github.com/LightNetDev/LightNet/commit/65b3eec5b68565237b46c6423d21257ad4747dce) Thanks [@smn-cds](https://github.com/smn-cds)! - The experimental Decap-based admin integration was replaced by `@lightnet/sveltia-admin`, which no longer accepts a `languages` option.

### Minor Changes

- [#361](https://github.com/LightNetDev/LightNet/pull/361) [`65b3eec`](https://github.com/LightNetDev/LightNet/commit/65b3eec5b68565237b46c6423d21257ad4747dce) Thanks [@smn-cds](https://github.com/smn-cds)! - Add an experimental `useLanguagesCollection` option to `sveltiaAdmin(...)` so sites can edit LightNet languages through a root-level `languages.json` file.
  To use it, move the `languages` array out of `lightnet(...)` into `languages.json`, import that file back into `astro.config.*`, and enable `experimental.useLanguagesCollection`.

### Patch Changes

- [#361](https://github.com/LightNetDev/LightNet/pull/361) [`65b3eec`](https://github.com/LightNetDev/LightNet/commit/65b3eec5b68565237b46c6423d21257ad4747dce) Thanks [@smn-cds](https://github.com/smn-cds)! - `commonId` is now optional for media items in both `lightnet` schema validation and `@lightnet/sveltia-admin`.

- [#361](https://github.com/LightNetDev/LightNet/pull/361) [`65b3eec`](https://github.com/LightNetDev/LightNet/commit/65b3eec5b68565237b46c6423d21257ad4747dce) Thanks [@smn-cds](https://github.com/smn-cds)! - Export `pathWithBase` from `lightnet/utils` and use that public entrypoint inside `@lightnet/sveltia-admin` so published installs resolve the media edit button controller correctly.

- [#361](https://github.com/LightNetDev/LightNet/pull/361) [`65b3eec`](https://github.com/LightNetDev/LightNet/commit/65b3eec5b68565237b46c6423d21257ad4747dce) Thanks [@smn-cds](https://github.com/smn-cds)! - Normalize `sveltiaAdmin({ path })` values before composing admin routes and config URLs so documented paths like `/admin` resolve correctly.

- [#361](https://github.com/LightNetDev/LightNet/pull/361) [`65b3eec`](https://github.com/LightNetDev/LightNet/commit/65b3eec5b68565237b46c6423d21257ad4747dce) Thanks [@smn-cds](https://github.com/smn-cds)! - Respect Astro `base` paths for Sveltia Admin URLs so the CMS config request and media edit-button links work correctly when a site is deployed under a subpath such as `/docs`.

- Updated dependencies [[`65b3eec`](https://github.com/LightNetDev/LightNet/commit/65b3eec5b68565237b46c6423d21257ad4747dce), [`65b3eec`](https://github.com/LightNetDev/LightNet/commit/65b3eec5b68565237b46c6423d21257ad4747dce), [`65b3eec`](https://github.com/LightNetDev/LightNet/commit/65b3eec5b68565237b46c6423d21257ad4747dce), [`65b3eec`](https://github.com/LightNetDev/LightNet/commit/65b3eec5b68565237b46c6423d21257ad4747dce), [`65b3eec`](https://github.com/LightNetDev/LightNet/commit/65b3eec5b68565237b46c6423d21257ad4747dce), [`65b3eec`](https://github.com/LightNetDev/LightNet/commit/65b3eec5b68565237b46c6423d21257ad4747dce), [`65b3eec`](https://github.com/LightNetDev/LightNet/commit/65b3eec5b68565237b46c6423d21257ad4747dce), [`65b3eec`](https://github.com/LightNetDev/LightNet/commit/65b3eec5b68565237b46c6423d21257ad4747dce), [`65b3eec`](https://github.com/LightNetDev/LightNet/commit/65b3eec5b68565237b46c6423d21257ad4747dce), [`65b3eec`](https://github.com/LightNetDev/LightNet/commit/65b3eec5b68565237b46c6423d21257ad4747dce), [`65b3eec`](https://github.com/LightNetDev/LightNet/commit/65b3eec5b68565237b46c6423d21257ad4747dce), [`65b3eec`](https://github.com/LightNetDev/LightNet/commit/65b3eec5b68565237b46c6423d21257ad4747dce), [`65b3eec`](https://github.com/LightNetDev/LightNet/commit/65b3eec5b68565237b46c6423d21257ad4747dce), [`65b3eec`](https://github.com/LightNetDev/LightNet/commit/65b3eec5b68565237b46c6423d21257ad4747dce), [`65b3eec`](https://github.com/LightNetDev/LightNet/commit/65b3eec5b68565237b46c6423d21257ad4747dce), [`65b3eec`](https://github.com/LightNetDev/LightNet/commit/65b3eec5b68565237b46c6423d21257ad4747dce), [`65b3eec`](https://github.com/LightNetDev/LightNet/commit/65b3eec5b68565237b46c6423d21257ad4747dce), [`65b3eec`](https://github.com/LightNetDev/LightNet/commit/65b3eec5b68565237b46c6423d21257ad4747dce), [`65b3eec`](https://github.com/LightNetDev/LightNet/commit/65b3eec5b68565237b46c6423d21257ad4747dce), [`65b3eec`](https://github.com/LightNetDev/LightNet/commit/65b3eec5b68565237b46c6423d21257ad4747dce)]:
  - lightnet@4.0.0

# @lightnet/cli

## 4.4.1

### Patch Changes

- [#431](https://github.com/LightNetDev/LightNet/pull/431) [`aa5968f`](https://github.com/LightNetDev/LightNet/commit/aa5968f26112f93121f03e7aafdfb04018186032) - Delete orphaned R2 objects from `check-files --fix --r2` in batches instead of spawning one rclone process per file.

- [#431](https://github.com/LightNetDev/LightNet/pull/431) [`aa5968f`](https://github.com/LightNetDev/LightNet/commit/aa5968f26112f93121f03e7aafdfb04018186032) - Show progress feedback while `check-files` and `check-links` perform long-running checks.

- [#431](https://github.com/LightNetDev/LightNet/pull/431) [`aa5968f`](https://github.com/LightNetDev/LightNet/commit/aa5968f26112f93121f03e7aafdfb04018186032) - Improve `check-files` performance by avoiding duplicate R2 listings and parallelizing independent filesystem work.

- [#431](https://github.com/LightNetDev/LightNet/pull/431) [`aa5968f`](https://github.com/LightNetDev/LightNet/commit/aa5968f26112f93121f03e7aafdfb04018186032) - Protect R2 objects referenced by media content links from `check-files --fix --r2` cleanup and warn that they should use upload content.

- [#431](https://github.com/LightNetDev/LightNet/pull/431) [`aa5968f`](https://github.com/LightNetDev/LightNet/commit/aa5968f26112f93121f03e7aafdfb04018186032) - Decode percent-encoded R2 public URLs when matching `check-files --r2` references against bucket objects.

## 4.4.0

### Minor Changes

- [#429](https://github.com/LightNetDev/LightNet/pull/429) [`00faa68`](https://github.com/LightNetDev/LightNet/commit/00faa6806bbdb74aef665d71b813449f2a15137f) - Add `check-translations --no-build` and `check-translations --build` support and improve CLI check commands.

### Patch Changes

- [#429](https://github.com/LightNetDev/LightNet/pull/429) [`00faa68`](https://github.com/LightNetDev/LightNet/commit/00faa6806bbdb74aef665d71b813449f2a15137f) - Rename `check-files --yes` to `check-files --no-confirm` for clearer unattended deletion.

## 4.3.0

### Minor Changes

- [#427](https://github.com/LightNetDev/LightNet/pull/427) [`d34539d`](https://github.com/LightNetDev/LightNet/commit/d34539dc21d8e37d25cf65233ba0837675062fd7) - Add a `lightnet check-links` command that validates media content URLs without downloading linked files.

- [#427](https://github.com/LightNetDev/LightNet/pull/427) [`d34539d`](https://github.com/LightNetDev/LightNet/commit/d34539dc21d8e37d25cf65233ba0837675062fd7) - check-translations will provide option to run `pnpm build`

### Patch Changes

- [#427](https://github.com/LightNetDev/LightNet/pull/427) [`d34539d`](https://github.com/LightNetDev/LightNet/commit/d34539dc21d8e37d25cf65233ba0837675062fd7) - Refactor check-files content storage handling.

- [#427](https://github.com/LightNetDev/LightNet/pull/427) [`d34539d`](https://github.com/LightNetDev/LightNet/commit/d34539dc21d8e37d25cf65233ba0837675062fd7) - Improve output of check-translations

## 4.2.0

### Minor Changes

- [#423](https://github.com/LightNetDev/LightNet/pull/423) [`30fabef`](https://github.com/LightNetDev/LightNet/commit/30fabef4897506cf4d0194b8883257de513ec452) - Add a new `lightnet check-files` command to validate orphaned and missing content files and thumbnails in LightNet site projects.

## 4.1.1

### Patch Changes

- [#404](https://github.com/LightNetDev/LightNet/pull/404) [`5acab49`](https://github.com/LightNetDev/LightNet/commit/5acab49ca79078edbba3868b9b7bce249b2fca8a) - Update dependencies.

## 4.1.0

### Minor Changes

- [#387](https://github.com/LightNetDev/LightNet/pull/387) [`d7969dc`](https://github.com/LightNetDev/LightNet/commit/d7969dcaa65417316b129f50602d3473813f52fe) Thanks [@smn-cds](https://github.com/smn-cds)! - Add check-translations script.

### Patch Changes

- [#387](https://github.com/LightNetDev/LightNet/pull/387) [`d7969dc`](https://github.com/LightNetDev/LightNet/commit/d7969dcaa65417316b129f50602d3473813f52fe) Thanks [@smn-cds](https://github.com/smn-cds)! - Update dependencies

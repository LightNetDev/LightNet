# @lightnet/cli

## 4.6.0

### Minor Changes

- [#439](https://github.com/LightNetDev/LightNet/pull/439) [`2572437`](https://github.com/LightNetDev/LightNet/commit/25724372a47ac8fcac1fd5959c442d6619f5b758) - Update `lightnet r2 cp` to support Unix-like file overwrite behavior and prompt before overwriting unless `-f` is provided.

- [#439](https://github.com/LightNetDev/LightNet/pull/439) [`2572437`](https://github.com/LightNetDev/LightNet/commit/25724372a47ac8fcac1fd5959c442d6619f5b758) - Allow `lightnet r2 cp` to copy files and prefixes inside the configured R2 bucket with `r2:` source and destination paths.

- [#439](https://github.com/LightNetDev/LightNet/pull/439) [`2572437`](https://github.com/LightNetDev/LightNet/commit/25724372a47ac8fcac1fd5959c442d6619f5b758) - Add `lightnet r2 mv` for moving and renaming files and prefixes inside the configured R2 bucket.

- [#439](https://github.com/LightNetDev/LightNet/pull/439) [`2572437`](https://github.com/LightNetDev/LightNet/commit/25724372a47ac8fcac1fd5959c442d6619f5b758) - Update `lightnet r2 rm` to use OS-style deletion flags with `-r` for recursive prefix removal and `-f` for skipping confirmation.

## 4.5.0

### Minor Changes

- [#437](https://github.com/LightNetDev/LightNet/pull/437) [`91446d3`](https://github.com/LightNetDev/LightNet/commit/91446d3102da0383dfffa836578c02286d0258c9) - Add `lightnet r2` commands for listing, deleting, and copying Cloudflare R2 files through the project R2 configuration.

## 4.4.2

### Patch Changes

- [#433](https://github.com/LightNetDev/LightNet/pull/433) [`dbde36e`](https://github.com/LightNetDev/LightNet/commit/dbde36e7a25bf6470783e9594260b666e09c2783) - Make `check-files` summaries clearer by explaining what was compared and what needs attention.

- [#433](https://github.com/LightNetDev/LightNet/pull/433) [`dbde36e`](https://github.com/LightNetDev/LightNet/commit/dbde36e7a25bf6470783e9594260b666e09c2783) - Handle Ctrl+C cancellation consistently for interactive `check-*` command prompts.

- [#433](https://github.com/LightNetDev/LightNet/pull/433) [`dbde36e`](https://github.com/LightNetDev/LightNet/commit/dbde36e7a25bf6470783e9594260b666e09c2783) - Replace `check-files --fix --no-confirm` with `check-files --fix-without-confirm` for non-interactive cleanup.

- [#433](https://github.com/LightNetDev/LightNet/pull/433) [`dbde36e`](https://github.com/LightNetDev/LightNet/commit/dbde36e7a25bf6470783e9594260b666e09c2783) - Treat warning-only `check-files` runs as successful when no local content file references are found.

- [#433](https://github.com/LightNetDev/LightNet/pull/433) [`dbde36e`](https://github.com/LightNetDev/LightNet/commit/dbde36e7a25bf6470783e9594260b666e09c2783) - Improve `check-files` and `check-links` output for long referenced paths and URLs.

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

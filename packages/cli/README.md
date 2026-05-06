# `@lightnet/cli`

Command-line tools for working with LightNet projects.

## Install

```bash
npm install --save-dev @lightnet/cli
```

You can also run the CLI without adding it to your project first:

```bash
npx @lightnet/cli --help
```

## Usage

The package exposes the `lightnet` binary:

```bash
lightnet <command> [options]
```

Get the full command list at any time with:

```bash
lightnet --help
```

## Commands

### `check-translations`

Checks the translation data produced by the latest LightNet build and reports
missing locale values.

```bash
lightnet check-translations
```

> [!NOTE]
> `check-translations` only validates translations that were actually used
> during the last build. For example, it would not report a missing category
> label translation if that category label was never referenced while building
> the site.

What it does:

- Reads the cached translation build output from `node_modules/.cache/lightnet/`
- Verifies every translation has values for every configured locale
- Groups missing translations by source to make follow-up work clearer

When to use it:

- After building a LightNet site
- In CI to catch incomplete translations before deploys
- While adding new locales or updating translation maps

Expected setup:

- Run your project build first so LightNet can generate its translation cache
  If the cache is missing, the command will fail and prompt you to run a build
  first.

# LightNet CLI

Command-line tools for working with LightNet sites. The CLI currently includes translation validation, file consistency checks, and media link availability checks.

## Install

```bash
pnpm add --D @lightnet/cli
```

## Exclude translation keys

Pass a space-separated list of exact keys to skip their completeness checks:

```bash
pnpm exec lightnet check-translations --exclude ln.details.edit custom.title
```

You can repeat `--exclude` to add more keys. Matching is case-sensitive and does
not support wildcards. Exclusions apply to built-in keys, user keys, and inline
translation-map paths. Stale override warnings are still reported for excluded
keys. Use `--build` to refresh the cache or `--no-build` to check the last build.

## LightNet CLI reference

See command-line tools reference documentation at:

https://docs.lightnet.community/resources/lightnet-cli-reference/

# `@lightnet/cli`

Command line tools for LightNet sites.

## Commands

- `lightnet-cli translations export <locale>`
- `lightnet-cli translations validate`

## Usage

Run commands from your LightNet project root.

```sh
npx @lightnet/cli translations export de
npx @lightnet/cli translations export de --missing-only
npx @lightnet/cli translations validate
npx @lightnet/cli translations validate --no-lightnet-builtins
```

## Notes

- The CLI supports `pnpm` and `npm`.
- Translation commands run a production Astro build by default.
- Use `--no-build` to reuse existing discovery artifacts from
  `node_modules/.cache/lightnet`.
- `translations export` writes YAML to `stdout`, so it can be piped into a file.

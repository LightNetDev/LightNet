# AGENTS

## Repo map

- `.changeset/`: changeset release descriptions.
- `packages/lightnet/`: core Astro integration, UI, content models, and i18n.
- `packages/cli/`: command-line tooling.
- `packages/sveltia-admin/`: Sveltia CMS based admin interface.
- `playground/`: example sites (useful for manual testing).

## Conventions

- External classes should be called `className`. For both Astro and React components.
- Keep UI simple and clean; take visual cues from Airbnb (spacious, calm, neutral).
- Layouts must work in both LTR and RTL (use logical properties and avoid left/right-only rules).

## Localization workflow

- Add new keys in `packages/lightnet/src/i18n/translations/en.yml` and `packages/lightnet/src/i18n/translations.ts`.
- Use `Astro.locals.i18n.t` in UI and avoid hard-coded strings.
- In Astro components direction and other information relevant for localization from `Astro.locals.i18n`.

## Commands

- `pnpm dev` (playground dev server)
- `pnpm build`
- `pnpm typecheck`
- `pnpm fmt` (run lint and prettier with auto-fix)
- `pnpm test` (unit tests for `packages/lightnet` and `packages/sveltia-admin`)
- `pnpm e2e` (end-to-end tests for `packages/lightnet`)

## Verification

- Always run `pnpm fmt` for every task that changes code or styles.
- Always run `pnpm typecheck` for every task that changes code or types.
- Always run unit tests with `pnpm test`.
- Only run end to end tests `pnpm e2e` when you are told to do so.

# AGENTS

This file guides AI assistants working in this repo. Keep changes aligned with LightNet patterns and tooling.
Primary use: feature development and bug fixes.

## Repo map

- `.changeset/`: changeset release descriptions.
- `packages/lightnet/`: core Astro integration, UI, content models, and i18n.
- `packages/cli/`: command-line tooling.
- `packages/sveltia-admin/`: Sveltia CMS based admin interface.
- `playground/`: example sites (useful for manual testing).

## Default scope

- UI work: start in `packages/lightnet/` (components, layouts, pages).
- Content models and i18n: start in `packages/lightnet/src/content/` and `packages/lightnet/src/i18n/`.
- CLI features or fixes: start in `packages/cli/`.

## Stack

- Astro 5 + TypeScript + Tailwind CSS.
- React 19
- Node 22+ (see `.nvmrc`); pnpm workspace.

## Conventions

- Follow existing formatting; Prettier is the source of truth (no semicolons).
- Prefer existing components/utilities before introducing new ones.
- Astro components use frontmatter and `class:list` for conditional classes.
- External classes should be called `className`. For both Astro and React components.
- UI strings should use `Astro.locals.i18n.t` with translation keys.
- Keep UI simple and clean; take visual cues from Airbnb (spacious, calm, neutral).
- Layouts must work in both LTR and RTL (use logical properties and avoid left/right-only rules).

## Files and assets

- Never edit files ignored by git (check `.gitignore` when in doubt).
- Do not add large files (e.g., images) unless explicitly asked.
- For `playground/`, reuse existing images instead of adding new ones.

## Content and i18n

- Schemas and helpers live in `packages/lightnet/src/content/`.
- Translation files live in `packages/lightnet/src/i18n/translations/`.
- Avoid hard-coded English in UI; add keys and update translations.
- During development, add missing translations to `packages/lightnet/src/i18n/translations/en.yml`.

## Localization workflow

- Add new keys in `packages/lightnet/src/i18n/translations/en.yml` and `packages/lightnet/src/i18n/translations.ts`.
- Use `Astro.locals.i18n.t` in UI and avoid hard-coded strings.
- In Astro components direction and other information relevant for localization from `Astro.locals.i18n`.

## Changesets

- Add a `.changeset/*.md` for changes that affect published packages.
- For major updates include instructions on how to update sites that depend on the published package.
- No changeset needed for playground-only changes.

## Commands

- `pnpm dev` (playground dev server)
- `pnpm build`
- `pnpm typecheck`
- `pnpm fmt` (run lint and prettier with auto-fix)
- `pnpm test` (unit tests for `packages/lightnet` and `packages/sveltia-admin`)
- `pnpm e2e` (end-to-end tests for `packages/lightnet`)

## Sveltia admin E2E

- Sveltia admin Playwright tests live in `packages/sveltia-admin/__e2e__/`.
- Regression coverage for `packages/sveltia-admin/__e2e__/` must stay inside the existing LightNet-backed fixtures (`admin-test-repo` and `admin-local-repo`) unless the user explicitly asks for a separate repro app or fixture site.
- Do not create standalone Astro repro projects, ad hoc admin apps, or extra fixture sites just to reproduce Sveltia admin bugs. Prefer extending the existing LightNet-backed fixtures and package-owned collection coverage.
- The `test-repo` backend does not auto-populate fixture files. The E2E harness must seed OPFS directory `sveltia-cms-test` from the existing `admin-test-repo` fixture before using `enterTestRepository()`.
- When adding or changing seeded Sveltia test data, update the E2E seeding manifest/helper so new `src/content/**`, content-adjacent assets, and other repo-backed files such as `languages.json` are copied into OPFS.
- Do not rely on persisted browser storage to make `test-repo` tests pass. Test-repo setup should be deterministic and recreated by the harness for each test session.
- The page-object pattern for Sveltia admin tests should stay thin and generic.
- Page objects should abstract Sveltia CMS UI mechanics only: collections, entries, editors, and field/widget interactions.
- Do not add LightNet domain language to the page-object API. Avoid methods like `createMediaItem`, `createCategory`, `selectLanguage`, or `addLinkContent`.
- Prefer generic flows such as `enterTestRepository`, `openCollection`, `createEntry`, `openEditor`, `save`, and `cancel`.
- Put LightNet-specific test intent in the specs or test-local helper functions, not in the page-object classes.
- Prefer label-based field accessors in tests, for example `getStringFieldByLabel("Slug")`.
- Use key-path-based field accessors only when needed for nested or repeated Sveltia fields where labels are ambiguous, such as list items or inline translation objects.
- Keep widget wrappers generic and named after Sveltia interaction types: string fields, relation fields, combobox fields, list fields, typed object fields, and file fields.
- If you add new page-object helpers, name them after UI behavior, not content-domain meaning.

## Verification

- Always run `pnpm fmt` for every task that changes code or styles.
- Always run `pnpm typecheck` for every task that changes code or types.
- Always run unit tests with `pnpm test` (this validates both `packages/lightnet` and `packages/sveltia-admin`).
- Only run end to end tests `pnpm e2e` when you are told to do so.
- If `pnpm fmt`, `pnpm typecheck`, or tests are not run, say so and why.

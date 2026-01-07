# AGENTS

This file guides AI assistants working in this repo. Keep changes aligned with LightNet patterns and tooling.
Primary use: feature development and bug fixes.

## Repo map

- `.changeset/`: changeset release descriptions.
- `packages/lightnet/`: core Astro integration, UI, content models, and i18n.
- `packages/cli/`: command-line tooling.
- `packages/decap-admin/`: deprecated Decap CMS integration. New experimental Admin UI lives in `packages/lightnet/admin`
- `playground/`: example sites (useful for manual testing).

## Default scope

- UI work: start in `packages/lightnet/` (components, layouts, pages).
- Content models and i18n: start in `packages/lightnet/src/content/` and `packages/lightnet/src/i18n/`.
- CLI features or fixes: start in `packages/cli/`.
- Admin work: start in `packages/lightnet/admin`.

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

## Changesets

- Add a `.changeset/*.md` for changes that affect published packages.
- No changeset needed for playground-only changes.

## Commands

- `pnpm dev` (playground dev server)
- `pnpm build`
- `pnpm typecheck`
- `pnpm fmt` (run lint and prettier with auto-fix)
- `pnpm test` or `pnpm e2e` (packages/lightnet)

## Verification

- Always run `pnpm fmt` for every task that changes code or styles.
- Only run tests when you are told to do so.
- If `pnpm fmt` or tests are not run, say so and why.

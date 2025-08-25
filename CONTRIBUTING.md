# Contributing to LightNet

Thank you for your interest in contributing to **LightNet**! 🎉
We welcome contributions of all kinds—whether you’re fixing a typo, writing documentation, improving tests, or adding new features.

This guide will help you get started and explains how to make your contributions effective and easy to review.

## Table of contents

1. [Ways to contribute](#ways-to-contribute)
2. [Quickstart for new contributors](#quickstart-for-new-contributors)
3. [Development setup](#development-setup)
4. [Making changes](#making-changes)
5. [Testing](#testing)
6. [Translations](#translations)
7. [Understanding LightNet](#understanding-lightnet)
8. [Thank you](#thank-you)

## Ways to contribute

There are many ways to help LightNet grow:

- **Report bugs**: [Open an issue](https://github.com/LightNetDev/LightNet/issues/new/choose).
- **Fix issues**: Browse [open issues](https://github.com/LightNetDev/LightNet/issues) (look for [“good first issue”](https://github.com/LightNetDev/LightNet/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)).
- **Improve docs**: Fix typos, clarify instructions, or add examples.
- **Translate**: Add or improve UI translations.
- **Review pull requests**: Help maintain quality by reviewing contributions from others.

> 💡 **Tip for beginners:** New to GitHub? Check out [GitHub’s Hello World guide](https://docs.github.com/en/get-started/quickstart/hello-world).

## Quickstart for new contributors

1. **Fork** the repo from [LightNet on GitHub](https://github.com/LightNetDev/LightNet).
2. **Clone** your fork locally:

   ```sh
   git clone https://github.com/YOUR-USERNAME/lightnet.git
   cd lightnet
   ```

3. **Install dependencies** (requires Node.js 22+ and pnpm):

   ```sh
   pnpm install
   ```

4. **Start the dev server**:

   ```sh
   pnpm dev
   ```

   Open [http://localhost:4321](http://localhost:4321) to preview changes.

## Development setup

### Prerequisites

- **Node.js**: v22+ (use version in [`.nvmrc`](./.nvmrc))
- **pnpm**: version specified in `packageManager` inside [`package.json`](./package.json)

### Recommended editor

We recommend **VS Code** with these extensions:

- [Astro](https://marketplace.visualstudio.com/items?itemName=astro-build.astro-vscode)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

> A `.vscode/extensions.json` file is included to help set this up.

### Repo structure

This is a **monorepo**, containing:

- `packages/` → Core LightNet packages
- `playground/` → Example playground sites

## Making changes

### Workflow

1. Create a branch for your changes:

   ```sh
   git checkout -b feature/my-change
   ```

2. Make edits and commit them (clear, descriptive messages encouraged).
3. Run checks:

   ```sh
   pnpm format
   pnpm lint --fix
   ```

4. Add a [changeset](https://github.com/changesets/changesets/blob/main/docs/adding-a-changeset.md#i-am-in-a-multi-package-repository-a-mono-repo) if your change affects published packages:

   ```sh
   pnpm changeset
   ```

5. Push your branch and open a pull request (PR).

### PR guidelines

- Link related issues in your PR description.
- Include screenshots for UI changes if applicable.
- Keep PRs focused and small when possible.

## Testing

### Visual testing

Run the dev server to see changes live:

```sh
pnpm dev
```

### Unit tests

Located in [`packages/lightnet/__tests__/`](./packages/lightnet/__tests__/).
Run with:

```sh
cd packages/lightnet
pnpm test
```

### End-to-end (E2E) tests

Located in [`packages/lightnet/__e2e__/`](./packages/lightnet/__e2e__/).
Run with:

```sh
cd packages/lightnet
pnpm e2e
```

> Use E2E tests sparingly—they are slower than unit tests, but great for testing real browser interactions.

## Translations

LightNet’s UI supports multiple languages.

- Translation files live in: [`packages/lightnet/src/i18n/translations`](./packages/lightnet/src/i18n/translations/)
- Add or edit YAML files to improve translations.
- Test locally by running:

  ```sh
  pnpm dev
  ```

  Then switch languages in the UI.

## Understanding LightNet

LightNet’s core lives in the [packages/lightnet](packages/lightnet) workspace and is exposed as an Astro integration. The entry point `exports/index.ts` re‑exports the integration function and its configuration types. During `astro:config:setup`, the integration injects all built‑in routes (root, search, details, API endpoints), registers middleware, and augments the project’s Vite and i18n settings.

Content is modeled with Zod schemas under `src/content`. `LIGHTNET_COLLECTIONS` wires these schemas into Astro’s content collection system, allowing LightNet to query categories, media, media types, and collections in a consistent way. A middleware in `src/i18n/locals.ts` attaches translation helpers and locale metadata to Astro.locals, so any component can access locals.i18n without extra imports. For example, the `/api/search.json` endpoint reads all media entries via `getMediaItems()` and returns a pre‑sorted search index.

Directory overview

- `src/astro-integration/` – integration setup, config schema, Vite plugin.
- `src/content/` – Zod schemas and helpers for categories, media items, media types, and collections.
- `src/pages/` – Astro pages and API handlers (RootRoute, SearchPageRoute, DetailsPageRoute, api/search.ts, api/versions.ts).
- `src/components/` & `src/layouts/` – reusable UI blocks.
- `src/i18n/` – translation files and locale utilities.
- `__tests__/` & `__e2e__/` – Vitest and Playwright test suites.

## Thank you ❤️

Every contribution—big or small—helps make LightNet better.
We deeply appreciate your time, effort, and creativity.

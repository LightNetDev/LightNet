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
8. [Understanding the Admin UI](#understanding-the-admin-ui)
9. [Thank you](#thank-you)

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

4. **Install Playwright browsers** if you plan to run E2E tests:

   ```sh
   pnpm playwright:install
   ```

5. **Start the dev server**:

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
   pnpm fmt
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
Before your first run, install the Playwright browsers from the repo root:

```sh
pnpm playwright:install
```

Then run the tests from the repo root:

```sh
pnpm e2e
# Testing Admin UI
pnpm e2e:admin
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

LightNet’s core lives in [`packages/lightnet`](./packages/lightnet/). It is published as an Astro integration, so most behavior starts in [`packages/lightnet/src/astro-integration/integration.ts`](./packages/lightnet/src/astro-integration/integration.ts), where the integration wires itself into Astro.

At `astro:config:setup`, LightNet does most of its bootstrapping work. It injects built-in routes such as the homepage, search page, details page, and internal API endpoints; registers i18n middleware; and adds supporting integrations and Vite config. If you are changing how LightNet starts up, adds routes, or reads user config, this is usually the first place to inspect.

The other big piece is content. LightNet treats categories, media items, media types, and media collections as Astro content collections backed by Zod schemas. Those schemas and query helpers live in [`packages/lightnet/src/content/`](./packages/lightnet/src/content/). If you are changing what content is allowed, how entries are validated, or how media is queried, start there.

Localization is built into the request lifecycle. [`packages/lightnet/src/i18n/locals.ts`](./packages/lightnet/src/i18n/locals.ts) attaches translation helpers and locale metadata to `Astro.locals.i18n`, which lets Astro components and pages call `Astro.locals.i18n.t(...)` without extra setup. If a UI change introduces new text, add translation keys in [`packages/lightnet/src/i18n/translations/en.yml`](./packages/lightnet/src/i18n/translations/en.yml) and wire them through the existing i18n utilities.

If you are not sure where to start, use this rule of thumb:

- UI and page behavior: [`packages/lightnet/src/components/`](./packages/lightnet/src/components/), [`packages/lightnet/src/layouts/`](./packages/lightnet/src/layouts/), and [`packages/lightnet/src/pages/`](./packages/lightnet/src/pages/)
- Content schemas and queries: [`packages/lightnet/src/content/`](./packages/lightnet/src/content/)
- Localization: [`packages/lightnet/src/i18n/`](./packages/lightnet/src/i18n/)
- Integration and config wiring: [`packages/lightnet/src/astro-integration/`](./packages/lightnet/src/astro-integration/)
- Tests: [`packages/lightnet/__tests__/`](./packages/lightnet/__tests__/) and [`packages/lightnet/__e2e__/`](./packages/lightnet/__e2e__/)

## Understanding the Admin UI

LightNet’s admin UI lives in [`packages/sveltia-admin`](./packages/sveltia-admin) and is published as `@lightnet/sveltia-admin`. Like the main package, it is an Astro integration. The main entry point is [`packages/sveltia-admin/src/astro-integration/integration.ts`](./packages/sveltia-admin/src/astro-integration/integration.ts), which injects the admin route and the generated `config.json` endpoint used by Sveltia CMS.

Most admin behavior is driven by configuration rather than page components. The Sveltia collection definitions live in [`packages/sveltia-admin/src/sveltia/collections/content/`](./packages/sveltia-admin/src/sveltia/collections/content/), where LightNet’s categories, media items, media types, collections, and languages are mapped into editable CMS collections. If you are changing which fields appear in the admin UI or how content is represented there, start in that folder.

For contributor workflows, keep tests close to the behavior you change. Unit coverage lives in [`packages/sveltia-admin/__tests__/`](./packages/sveltia-admin/__tests__/), and browser coverage lives in [`packages/sveltia-admin/__e2e__/`](./packages/sveltia-admin/__e2e__/). The admin E2E suite uses the existing LightNet-backed fixtures, so prefer extending those fixtures instead of creating a separate repro app.

## Thank you ❤️

Every contribution—big or small—helps make LightNet better.
We deeply appreciate your time, effort, and creativity.

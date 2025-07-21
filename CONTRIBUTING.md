# Contributor Manual

We welcome contributions of any size and contributors of any skill level.
As an open source project, we believe in giving back to our contributors.
We are happy to help with guidance on PRs, technical writing, and turning any feature idea into a reality.

> **Tip for new contributors:**
> Take a look at [GitHub's Docs](https://docs.github.com/en/get-started/quickstart/hello-world) for helpful information on working with GitHub.

This document is an active work in progress — like LightNet itself!

## Types of contributions

There are lots of ways to contribute to LightNet.

Maintaining LightNet requires writing Astro code, as well as addressing accessibility, styling, and UX concerns.
Help writing docs, catching typos and errors, as well as translating docs into other languages is always welcome.

You can also get involved by leaving feedback on [issues](https://github.com/LightNetDev/LightNet/issues) or reviewing [pull requests](https://github.com/LightNetDev/LightNet/pulls) by other contributors.

We encourage you to:

- [**Open an issue**](https://github.com/LightNetDev/LightNet/issues/new/choose) to let us know of bugs & other issues in LightNet or propose a new feature.

- [**Look at existing issues**](https://github.com/LightNetDev/LightNet/issues) (especially those labelled [“good first issue”](https://github.com/LightNetDev/LightNet//issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22+)) to find ways to contribute.

- **Make a pull request (PR)** to address an open issue or to fix obvious problems.
  Read more about [making a PR in GitHub’s docs](https://docs.github.com/en/get-started/quickstart/contributing-to-projects)

- [**Review existing PRs**](https://github.com/LightNetDev/LightNet/pulls) to help us merge contributions sooner.

- [**Add or update translations**](#translations). We need help translating LightNet’s UI.

## About this repo

This repo is a “monorepo,” meaning it contains several projects in one. It contains the LightNet examples site in [`examples/`](./examples/) and the packages that make up LightNet in [`packages/`](./packages/).

### Setting up a development environment

**Prerequisites:** Developing LightNet requires [Node.js](https://nodejs.org/en) (use the version inside the [.nvmrc](./.nvmrc) file) and [pnpm](https://pnpm.io/) (use the version from `packageManager` inside the [package.json](./package.json) file). Make sure you have these installed before following these steps.

**Code Editor:** We recommend using VS-Code with these extensions:

- [Astro](https://marketplace.visualstudio.com/items?itemName=astro-build.astro-vscode) adds support for working with Astro projects.
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) adds TailwindCSS support.
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) checks the code style of your files while editing them.
- [Prettier - Code formatting](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) reformats your code according to the formatting config.

1. **Fork LightNet** to your personal GitHub account by clicking <kbd>Fork</kbd> on the [main LightNet repo page](https://github.com/lightnetdev/lightnet).

2. **Clone your fork** of LightNet to your computer. Replace `YOUR-USERNAME` in the command below with your GitHub username to clone in a Terminal:

   ```sh
   git clone https://github.com/YOUR-USERNAME/lightnet.git
   ```

3. **Change directory** to the cloned repo:

   ```sh
   cd lightnet
   ```

4. **Install dependencies** with `pnpm`:

   ```sh
   pnpm i
   ```

### Making a Pull Request

When making a pull request containing changes impacting users to LightNet or any related packages (`packages/*`), be sure to [add a changeset](https://github.com/changesets/changesets/blob/main/docs/adding-a-changeset.md#i-am-in-a-multi-package-repository-a-mono-repo) that will describe the changes to users.
Non-package (`examples/*`) changes do not need changesets.

```sh
pnpm changeset
```

Before opening your pull request, format your code and fix any lint errors:

```sh
pnpm format
pnpm lint --fix
```

## Testing

### Testing visual changes while you work

Run the Astro dev server on the sk8-ministries site to see how changes you make impact a project using LightNet.

To do this run `pnpm dev` from the root of the repsitory:

```sh
pnpm dev
```

You should then be able to open <http://localhost:4321> and see your changes.

### Unit tests

The LightNet package includes unit tests in [`packages/lightnet/__tests__/`](./packages/lightnet/__tests__/), which are run using [Vitest](https://vitest.dev/).

To run tests, move into the LightNet package and then run `pnpm test`:

```sh
cd packages/lightnet
pnpm test
```

This will run tests and then listen for changes, re-running tests when files change.

### End-to-end (E2E) tests

LightNet also includes E2E tests in [`packages/lightnet/__e2e__/`](./packages/lightnet/__e2e__/), which are run using [Playwright](https://playwright.dev/).

To run these tests, move into the LightNet package and then run `pnpm e2e`:

```sh
cd packages/lightnet
pnpm e2e
```

#### Test fixtures

Each subdirectory of `packages/lightnet/__e2e__/fixtures` should contain the basic files needed to run LightNet (`package.json`, `astro.config.mjs`, a content collection configuration in `src/content.config.ts` and some content to render in `src/content/media/`).

The `lightnetTest()` helper can be used in a test file to define the fixture which will be built and loaded in a preview server during a set of tests.

```ts
// packages/lightnet/__e2e__/feature.test.ts
import { lightnetTest } from "./test-utils"

const test = await lightnetTest("./fixtures/basics/")
```

This allows you to run tests against different combinations of Astro and LightNet configuration options for various content.

#### When to add E2E tests?

E2E are most useful for testing what happens on a page after it has been loaded by a browser. They run slower than unit tests so they should be used sparingly when unit tests aren’t sufficient.

## Translations

Translations help make LightNet accessible to more people.

### Translating LightNet’s UI

LightNet’s UI comes with some built-in text elements. For example, the search page has a heading of “Search” and the language filter on this page shows “All languages” labels. LightNet aims to provide these in as many languages as possible.

Help out by adding or updating translation files in [`packages/lightnet/src/i18n/translations`](./packages/lightnet/src/i18n/translations/).
In this folder you find more information on how to contribute translations.

## Understanding LightNet

- LightNet is built as an Astro integration.
  Read the [Astro Integration API docs](https://docs.astro.build/en/reference/integrations-reference/) to learn more about how integrations work.

  The LightNet integration is exported from [`packages/lightnet/exports/index.ts`](./packages/lightnet/exports/index.ts).
  It sets up LightNet’s routing logic, parses user config, and adds configuration to a LightNet user’s Astro project.

- LightNet consumes a user’s content from the [content collection](https://docs.astro.build/en/guides/content-collections/) folder.

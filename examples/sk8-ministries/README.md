# Sk8 Ministries Example

This example showcases LightNet´s capabilities with a fictional skateboard ministry.
View it online at [sk8-ministries.pages.dev](https://sk8-ministries.pages.dev/).

Use this example to explore how to build a LightNet site or as a starting point for your own site. To **create a local copy**, run the following from your terminal:

```sh
npm create astro@latest -- --template LightNetDev/lightnet/examples/sk8-ministries
```

## 🚀 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 🖥️ Admin UI

To run the Admin UI locally, execute `npm run dev` and then `npx decap-server` from a second terminal tab from the root of the project.
After this, navigate your browser to [localhost:4321/admin](localhost:4321/admin) and start administrating your content.

When "publishing" your changes they will be saved to your computer's disk only.

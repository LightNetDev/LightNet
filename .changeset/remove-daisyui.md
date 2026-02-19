---
lightnet: major
---

Remove DaisyUI from LightNet's built-in Tailwind configuration.

## Breaking changes

- LightNet no longer ships DaisyUI styles by default.
- If your site uses DaisyUI classes (including the `dy-` prefixed classes), those styles will no longer be generated unless you configure DaisyUI in your project.

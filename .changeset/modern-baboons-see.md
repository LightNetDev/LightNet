---
"lightnet": minor
---

Remove client router

We have been relying on [Astro's ClientRouter](https://docs.astro.build/en/reference/modules/astro-transitions/#clientrouter-) for
view transitions between different pages.
With this release we remove the use of ClientRouter and switch to the browser built-in [ViewTransitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API).

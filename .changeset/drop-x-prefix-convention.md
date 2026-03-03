---
"lightnet": minor
---

User translation keys no longer need the `x.` prefix. You can now use direct keys like `site.title` and `home.bbq.title` while built-in LightNet keys remain under `ln.*`.

Example:

```yml
# before
x.home.title: "Welcome"

# after
home.title: "Welcome"
```

## Breaking changes

- None.

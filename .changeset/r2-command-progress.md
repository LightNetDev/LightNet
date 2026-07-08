---
"@lightnet/cli": minor
---

Add a `--progress` option to `lightnet r2 cp`, `lightnet r2 mv`, and `lightnet r2 rm`.

When `--progress` is provided, the command shows a Clack progress bar while the requested R2 operations run. Progress advances once for each top-level source or target path handled by the command. For example, `lightnet r2 cp --progress a.jpg b.jpg r2:archive/` advances once for `a.jpg` and once for `b.jpg`.

For recursive prefix operations, the progress bar tracks the top-level recursive operation rather than every object inside the prefix.

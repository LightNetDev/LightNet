---
"@lightnet/cli": minor
---

Update `lightnet r2 mv` to use safer Unix-like move semantics inside the configured R2 bucket.

`lightnet r2 mv` remains R2-only: bare paths are treated as R2 object or prefix paths, and local filesystem paths are rejected. The command now accepts multiple source paths followed by one destination path, so commands like `lightnet r2 mv a.jpg b.jpg archive/` move both objects into the `archive/` prefix.

Moving a directory or prefix now merges into the destination instead of deleting and replacing an existing destination prefix. For example, `lightnet r2 mv old-prefix archive/` moves `old-prefix` to `archive/old-prefix/` while keeping unrelated existing objects under `archive/old-prefix/`.

Use `/.` to move the contents of a prefix instead of the prefix itself. For example, `lightnet r2 mv old-prefix/. archive/` moves the contents of `old-prefix` into `archive/`.

If a moved object would overwrite an existing destination object, the command prompts for confirmation unless `-f` is provided. Use `-n` or `--no-clobber` to skip existing destination objects without prompting or overwriting them. Whole-prefix replacement is no longer supported by `lightnet r2 mv`.

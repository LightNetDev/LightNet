---
"@lightnet/cli": minor
---

Update `lightnet r2 cp` to follow Unix-style copy semantics for files and directories.

Directory copies now require `-r`, `-R`, `-a`, or `--recursive`. Calling `lightnet r2 cp foo r2:` with a directory source now fails until a recursive flag is provided, matching Unix `cp` behavior. The `-a` archive flag is supported as a recursive copy alias for R2 paths.

Recursive directory copies now always merge into the destination instead of replacing an existing folder or R2 prefix. For example, `lightnet r2 cp -R abc r2:` copies the `abc` directory to `r2:abc/`, while keeping unrelated existing objects under `r2:abc/`. If a copied file would overwrite an existing destination file, the command prompts for confirmation unless `-f` is provided.

Use `/.` to copy the contents of a directory instead of the directory itself. For example, `lightnet r2 cp -R ./. r2:` copies the current directory contents into the R2 root, and `lightnet r2 cp -R abc/. r2:` copies the contents of `abc` into the R2 root. These commands merge with existing R2 objects and do not delete objects that are not present locally.

Use `-n` or `--no-clobber` to skip existing destination files without prompting or overwriting them, for example `lightnet r2 cp -Rn ./. r2:`.

`lightnet r2 cp` also accepts multiple source paths followed by one destination, so shell-expanded commands like `lightnet r2 cp *.jpg r2:` copy all matching files into the destination prefix.

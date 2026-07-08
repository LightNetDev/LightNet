---
"@lightnet/cli": minor
---

Update `lightnet r2 rm` to follow safer Unix-like delete semantics inside the configured R2 bucket.

`lightnet r2 rm` now accepts multiple R2 paths in one command, for example `lightnet r2 rm a.jpg b.jpg c.jpg`.

The command now checks each target before deleting it. Removing an R2 prefix or directory without `-r` or `--recursive` now fails with a clear message, matching Unix `rm` behavior. Use `lightnet r2 rm -r prefix` to delete a prefix recursively.

The `-f` and `--force` flag now also ignores missing paths, so commands like `lightnet r2 rm -f missing.jpg` complete without error. For existing targets, `-f` continues to skip confirmation. `lightnet r2 rm -rf prefix` deletes a prefix recursively without confirmation.

Bucket root cleanup remains specially protected. `lightnet r2 rm -rf /` still requires interactive confirmation, and non-interactive bucket cleanup still requires the long `--force` flag.

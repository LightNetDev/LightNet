---
"@lightnet/cli": patch
---

Delete orphaned R2 objects from `check-files --fix --r2` in batches instead of spawning one rclone process per file.

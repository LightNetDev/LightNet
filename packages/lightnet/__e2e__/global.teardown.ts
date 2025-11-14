import { test } from "@playwright/test"

import { teardown } from "./basics-fixture"

test("Stop LightNet server", async () => {
  await teardown()
})

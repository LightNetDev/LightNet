import { test } from "@playwright/test"
import { teardown } from "./test-utils"

test("Stop LightNet server", async () => {
  await teardown()
})

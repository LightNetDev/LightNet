import { teardownAstroFixtures } from "@internal/e2e-test-utils"

export default async function globalTeardown() {
  await teardownAstroFixtures()
}

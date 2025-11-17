import { teardown } from "./basics-fixture"

export default async function globalTeardown() {
  await teardown()
}

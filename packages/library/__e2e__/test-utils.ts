/**
 * This code is based on https://github.com/withastro/starlight/blob/main/packages/starlight/__e2e__/test-utils.ts
 * Here is the source license of the original code.
 *
 * MIT License
 *
 * Copyright (c) 2023 [Astro contributors](https://github.com/withastro/starlight/graphs/contributors)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { fileURLToPath } from "node:url"

import { type Page, test as baseTest } from "@playwright/test"
import { build, preview } from "astro"

export { expect, type Locator } from "@playwright/test"

process.env.ASTRO_TELEMETRY_DISABLED = "true"
process.env.ASTRO_DISABLE_UPDATE_CHECK = "true"

export function lightnetTest(fixturePath: string) {
  const root = fileURLToPath(new URL(fixturePath, import.meta.url))

  let server: Server | null = null
  const test = baseTest.extend<{
    startLightnet: (path?: string) => Promise<LightNetPage>
  }>({
    startLightnet: ({ page }, use) =>
      use(async (path) => {
        if (!server) {
          await build({ logLevel: "error", root })
          server = await preview({ logLevel: "error", root })
        }
        const ln = new LightNetPage(server, page)
        await ln.goto(path ?? "/")
        return ln
      }),
  })

  test.afterAll(async () => {
    await server?.stop()
  })

  return test
}

// A Playwright test fixture accessible from within all tests.
class LightNetPage {
  constructor(
    private readonly server: Server,
    private readonly page: Page,
  ) {}

  // Navigate to a URL relative to the server used during a test run and return the resource response.
  goto(path: string) {
    const url = `http://localhost:${this.server.port}${path.replace(/^\/?/, "/")}`
    return this.page.goto(url)
  }
}

type Server = Awaited<ReturnType<typeof preview>>

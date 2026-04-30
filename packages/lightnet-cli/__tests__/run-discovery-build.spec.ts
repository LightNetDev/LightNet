import { describe, expect, test, vi } from "vitest"

import { runDiscoveryBuild } from "../src/core/build/run-discovery-build"
import { LightnetCliError } from "../src/core/errors"

type ChildHandlers = {
  error?: (error: Error) => void
  exit?: (code: number | null) => void
}

const childHandlers = vi.hoisted(() => ({}) as ChildHandlers)
const stdoutDataListeners = vi.hoisted(
  () => [] as Array<(chunk: string) => void>,
)
const stderrDataListeners = vi.hoisted(
  () => [] as Array<(chunk: string) => void>,
)
const spawnMock = vi.hoisted(() => vi.fn())

vi.mock("node:child_process", () => ({
  spawn: spawnMock,
}))

const resetChild = () => {
  stdoutDataListeners.length = 0
  stderrDataListeners.length = 0
  childHandlers.error = undefined
  childHandlers.exit = undefined

  spawnMock.mockImplementation(() => ({
    stdout: {
      on: (event: string, listener: (chunk: string) => void) => {
        if (event === "data") {
          stdoutDataListeners.push(listener)
        }
      },
    },
    stderr: {
      on: (event: string, listener: (chunk: string) => void) => {
        if (event === "data") {
          stderrDataListeners.push(listener)
        }
      },
    },
    on: (
      event: string,
      listener: ((error: Error) => void) | ((code: number | null) => void),
    ) => {
      if (event === "error") {
        childHandlers.error = listener as (error: Error) => void
      }
      if (event === "exit") {
        childHandlers.exit = listener as (code: number | null) => void
      }
    },
  }))
}

describe("runDiscoveryBuild", () => {
  test("Should invoke astro build with translation discovery enabled", async () => {
    resetChild()

    const promise = runDiscoveryBuild({
      packageManager: "pnpm",
      root: "/repo",
      verbose: false,
    })

    expect(spawnMock).toHaveBeenCalledWith("pnpm", ["exec", "astro", "build"], {
      cwd: "/repo",
      env: expect.objectContaining({
        LIGHTNET_TRANSLATION_DISCOVERY: "1",
      }),
      stdio: "pipe",
    })

    childHandlers.exit?.(0)

    await expect(promise).resolves.toBeUndefined()
  })

  test("Should include captured output when build exits with an error", async () => {
    resetChild()

    const promise = runDiscoveryBuild({
      packageManager: "npm",
      root: "/repo",
      verbose: false,
    })

    stdoutDataListeners.forEach((listener) => listener("build output"))
    stderrDataListeners.forEach((listener) => listener("\nerror output"))
    childHandlers.exit?.(1)

    await expect(promise).rejects.toThrow(
      new LightnetCliError("Astro build failed.\n\nbuild output\nerror output"),
    )
  })

  test("Should include process errors when spawn fails before exit", async () => {
    resetChild()

    const promise = runDiscoveryBuild({
      packageManager: "pnpm",
      root: "/repo",
      verbose: false,
    })

    childHandlers.error?.(new Error("spawn failed"))

    await expect(promise).rejects.toThrow(
      new LightnetCliError("Astro build failed.\n\nspawn failed"),
    )
  })

  test("Should inherit stdio in verbose mode", async () => {
    resetChild()

    const promise = runDiscoveryBuild({
      packageManager: "pnpm",
      root: "/repo",
      verbose: true,
    })

    expect(spawnMock).toHaveBeenCalledWith("pnpm", ["exec", "astro", "build"], {
      cwd: "/repo",
      env: expect.objectContaining({
        LIGHTNET_TRANSLATION_DISCOVERY: "1",
      }),
      stdio: "inherit",
    })

    childHandlers.exit?.(0)

    await expect(promise).resolves.toBeUndefined()
  })
})

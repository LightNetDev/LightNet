declare module "node:child_process" {
  export type SpawnOptions = {
    cwd?: string
    env?: Record<string, string | undefined>
    stdio?: "inherit" | "pipe"
  }

  export type SpawnedProcess = {
    stdout?: {
      on(event: "data", listener: (chunk: Uint8Array | string) => void): void
    }
    stderr?: {
      on(event: "data", listener: (chunk: Uint8Array | string) => void): void
    }
    on(event: "exit", listener: (code: number | null) => void): void
    on(event: "error", listener: (error: Error) => void): void
  }

  export function spawn(
    command: string,
    args?: string[],
    options?: SpawnOptions,
  ): SpawnedProcess
}

declare module "node:fs/promises" {
  export function access(path: string): Promise<void>
  export function mkdir(
    path: string,
    options?: { recursive?: boolean },
  ): Promise<void>
  export function mkdtemp(prefix: string): Promise<string>
  export function readFile(path: string, encoding: string): Promise<string>
  export function rm(
    path: string,
    options?: { force?: boolean; recursive?: boolean },
  ): Promise<void>
  export function unlink(path: string): Promise<void>
  export function writeFile(
    path: string,
    data: string,
    encoding?: string,
  ): Promise<void>
}

declare module "node:os" {
  export function tmpdir(): string
}

declare module "node:path" {
  export function dirname(path: string): string
  export function join(...paths: string[]): string
  export function resolve(...paths: string[]): string
}

declare module "node:url" {
  export function fileURLToPath(url: string | URL): string
}

declare const process: {
  argv: string[]
  cwd(): string
  env: Record<string, string | undefined>
  exit(code?: number): never
  exitCode?: number
  stderr: { write(chunk: string): void }
  stdout: { write(chunk: string): void }
}

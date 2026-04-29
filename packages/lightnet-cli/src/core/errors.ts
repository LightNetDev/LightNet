export class LightnetCliError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "LightnetCliError"
  }
}

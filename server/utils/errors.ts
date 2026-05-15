export type ErrorCode
  = | 'urn:archimulant:scenario-not-found'
    | 'urn:archimulant:invalid-input'
    | 'urn:archimulant:internal-error'

export class AdapterError extends Error {
  readonly code: ErrorCode
  constructor(code: ErrorCode, message: string, cause?: unknown) {
    super(message, { cause })
    this.name = 'AdapterError'
    this.code = code
  }
}

export class ApplicationError extends Error {
  readonly code: ErrorCode
  constructor(code: ErrorCode, message: string, cause?: unknown) {
    super(message, { cause })
    this.name = 'ApplicationError'
    this.code = code
  }
}

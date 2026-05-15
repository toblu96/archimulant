export type ErrorCode
  = | 'urn:archimulant:scenario-not-found'
    | 'urn:archimulant:invalid-input'
    | 'urn:archimulant:internal-error'

export interface ErrorOptions {
  cause?: unknown
  why?: string
  fix?: string
}

export class AdapterError extends Error {
  readonly code: ErrorCode
  readonly why?: string
  readonly fix?: string
  constructor(code: ErrorCode, message: string, options?: ErrorOptions) {
    super(message, { cause: options?.cause })
    this.name = 'AdapterError'
    this.code = code
    this.why = options?.why
    this.fix = options?.fix
  }
}

export class ApplicationError extends Error {
  readonly code: ErrorCode
  readonly why?: string
  readonly fix?: string
  constructor(code: ErrorCode, message: string, options?: ErrorOptions) {
    super(message, { cause: options?.cause })
    this.name = 'ApplicationError'
    this.code = code
    this.why = options?.why
    this.fix = options?.fix
  }
}

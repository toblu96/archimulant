export type ErrorCode
  = | 'urn:archimulant:scenario-not-found'
    | 'urn:archimulant:invalid-scenario-id'
    | 'urn:archimulant:invalid-input'
    | 'urn:archimulant:internal-error'

export interface AppErrorOptions {
  cause?: unknown
  why?: string // optional explanation
  fix?: string // optional actionable hint for the caller
}

export class AppError extends Error {
  readonly code: ErrorCode
  readonly why?: string
  readonly fix?: string
  constructor(code: ErrorCode, message: string, options?: AppErrorOptions) {
    super(message, { cause: options?.cause })
    this.name = 'AppError'
    this.code = code
    this.why = options?.why
    this.fix = options?.fix
  }
}

// Walks the cause chain to find an AppError regardless of how deeply h3 has
// wrapped it. Use this from the global error handler.
export function findAppError(err: unknown): AppError | null {
  let current: unknown = err
  while (current) {
    if (current instanceof AppError) return current
    current = (current as { cause?: unknown }).cause
  }
  return null
}

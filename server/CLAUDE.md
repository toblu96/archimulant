# Server Architecture — Hexagonal (Ports & Adapters) on Nitro

This server applies the **Hexagonal Architecture (Ports & Adapters)** pattern on Nuxt 4 + Nitro. The dependency rules below are strict; violations break the architecture and must be rejected in review.

## Layers and dependency rule

Dependencies flow **inward only**. Outer layers know about inner layers; inner layers never import from outer ones.

```
adapters ──► ports ◄── application ──► domain
                          │
                          └─► domain
```

| Layer | May import from | Imported by | Concern |
|---|---|---|---|
| `domain/` | nothing (pure TS) | application, adapters | business invariants, types |
| `ports/` | `domain/` | application, adapters | interfaces only |
| `application/` | `domain/`, `ports/` | inbound adapters | use-case orchestration |
| `adapters/` (outbound) | `domain/`, `ports/` | composition root only | technology (fs, DB, HTTP clients, …) |
| `api/` (inbound) | `application/`, `domain/` | Nitro runtime | HTTP translation |

The **domain has zero framework imports**: no `h3`, no `nitro`, no `node:*`, no `zod`. Pure TypeScript.

## Directory layout

```
server/
├── domain/                       # Pure types, invariants, factories. No I/O.
│   ├── errors.ts                 # AppError class + ErrorCode union.
│   ├── auth/
│   │   └── user.ts               # User entity + UserId (what OUR domain cares about).
│   └── <feature>/
│       └── <entity>.ts
├── ports/                        # Interfaces (driving + driven). No implementations.
│   ├── logger.ts                 # Logger (request-scoped) + AppLogger (app-scoped) ports.
│   ├── session-resolver.ts       # Resolves headers → User | null.
│   └── <feature>-repository.ts
├── application/                  # Use cases. Plain async functions.
│   ├── auth/
│   │   └── guards.ts             # requireUser, requireOwner — type-narrowing checks.
│   └── <feature>/
│       └── <verb>.usecase.ts
├── adapters/
│   └── outbound/                 # Implementations of driven ports.
│       ├── evlog-logger.ts       # Adapts evlog's useLogger(event) to the Logger port.
│       ├── better-auth.ts        # better-auth instance + SessionResolver adapter.
│       └── <tech>-<feature>-repository.ts
├── api/                          # Inbound HTTP adapters. Nitro route files.
│   ├── auth/
│   │   └── [...all].ts           # Mounts better-auth's catch-all handler.
│   └── <feature>/
│       └── [id].get.ts
├── plugins/
│   └── 00.composition.ts         # Composition root. Runs once at server boot.
├── middleware/
│   └── 00.context.ts             # Per-request scope + session resolution.
├── error.ts                      # Global Nitro error handler. RFC 9457 mapping.
├── container.ts                  # Container factory + AppContainer/RequestContainer types.
├── types/
│   └── h3.d.ts                   # Augments H3EventContext with `scope`.
└── AGENTS.md                     # This file.
```

`auth.config.ts` at the **repo root** (not under `server/`) is a CLI-only file consumed by `pnpm dlx auth@latest generate`. See the Authentication section for details.

## Wiring — Nitro primitives mapped to roles

### `server/container.ts` — the only file that knows the bindings

```ts
export interface AppContainer {
  scenarios: ScenarioRepository
  // … singletons go here
}

export interface RequestContainer extends AppContainer {
  currentUser: User | null
  logger: Logger
  // … request-scoped values go here
}

export const buildAppContainer = (config: RuntimeConfig): AppContainer => ({
  scenarios: createJsonFileScenarioRepository(config.scenariosDir),
  // …
})
```

This is the **composition point**. To swap an adapter (Postgres → in-memory, JSON file → S3), change this file and nothing else.

### `server/plugins/00.composition.ts` — composition root

Runs once at startup. Builds singletons, attaches them to `nitroApp`, registers shutdown.

```ts
export default defineNitroPlugin((nitroApp) => {
  const config = useRuntimeConfig()
  const container = buildAppContainer(config)
  nitroApp.container = container
  nitroApp.hooks.hookOnce('close', async () => {
    await container.dispose?.()
  })
})
```

### `server/middleware/00.context.ts` — request scope

Runs on every request. Builds the request-scoped container and attaches it to `event.context.scope`.

```ts
export default defineEventHandler((event) => {
  const app = useNitroApp()
  event.context.scope = {
    ...app.container,
    currentUser: null,                              // populated by auth middleware
    logger: app.container.logger.child({ reqId: crypto.randomUUID() }),
  } satisfies RequestContainer
})
```

### `server/types/h3.d.ts` — type augmentation

```ts
import type { RequestContainer } from '~/server/container'
declare module 'h3' {
  interface H3EventContext { scope: RequestContainer }
}
```

This gives `event.context.scope` full type inference in every handler. No accessor function needed.

## Code patterns

Patterns are presented inner-to-outer, matching the dependency rule. Each layer below only references types from the layers above it.

### Domain — pure types and invariants

The domain uses **Zod schemas as the source of truth**. Types are derived via `z.infer`, and each value object has an ergonomic factory that wraps the schema with a typed domain error.

```ts
// server/domain/scenario/scenario.ts
import { z } from 'zod'
import { AppError } from '~/server/domain/errors'

// --- ScenarioId: branded, validating ---

export const ScenarioIdSchema = z.string()
  .regex(/^[a-z0-9-]+$/, 'Scenario id must be lowercase alphanumeric with dashes')
  .brand<'ScenarioId'>()

export type ScenarioId = z.infer<typeof ScenarioIdSchema>

export const ScenarioId = (raw: string): ScenarioId => {
  const parsed = ScenarioIdSchema.safeParse(raw)
  if (!parsed.success) {
    throw new AppError('urn:archimulant:invalid-scenario-id', `Invalid scenario id: ${raw}`)
  }
  return parsed.data
}

// --- Metrics: value object with range invariants ---

export const MetricsSchema = z.object({
  availability: z.number().min(0).max(1),
  throughputRps: z.number().nonnegative(),
  latencyMs: z.number().nonnegative(),
})
export type Metrics = z.infer<typeof MetricsSchema>

// --- Node / Edge / Scenario ---

export const NodeKindSchema = z.enum(['service', 'actor', 'datastore'])
export type NodeKind = z.infer<typeof NodeKindSchema>

export const NodeSchema = z.object({
  id: z.string().min(1),
  kind: NodeKindSchema,
  metrics: MetricsSchema,
})
export type Node = z.infer<typeof NodeSchema>

export const EdgeSchema = z.object({
  from: z.string().min(1),   // Node.id
  to: z.string().min(1),     // Node.id
  protocol: z.string().min(1),
})
export type Edge = z.infer<typeof EdgeSchema>

export const ScenarioSchema = z.object({
  id: ScenarioIdSchema,
  name: z.string().min(1),
  description: z.string(),
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
  targetMetrics: MetricsSchema,
})
export type Scenario = z.infer<typeof ScenarioSchema>

// Domain projection — pick the summary fields from the full schema so they
// stay in sync automatically.
export const ScenarioSummarySchema = ScenarioSchema.pick({
  id: true,
  name: true,
  description: true,
})
export type ScenarioSummary = z.infer<typeof ScenarioSummarySchema>
```

- **Schema is source of truth.** Define the schema, derive the type with `z.infer`. One definition, two artifacts.
- **Factories wrap schemas** to provide an ergonomic throwing constructor with a coded domain error (`AppError`, see Error handling below). Use the factory in application code; use the schema for parsing.
- **Branded types** via `.brand<>()` make domain identifiers non-interchangeable with raw strings.
- **Interfaces, not classes.** Behaviour over domain types lives in colocated pure functions if needed (e.g. `compute-metrics.ts`).
- **Only `zod` and `AppError` are allowed as external imports.** No I/O, no framework, no `node:*`, no adapters, no application code.

### Ports — interfaces only

```ts
// server/ports/scenario-repository.ts
import type { Scenario, ScenarioId, ScenarioSummary } from '~/server/domain/scenario/scenario'

export interface ScenarioRepository {
  findById(id: ScenarioId): Promise<Scenario | null>
  listAll(): Promise<ScenarioSummary[]>
}
```

- Named after the **domain concept**, never the technology.
- Method signatures use only domain types.
- One port per file.

### Use cases — plain async functions, deps as first argument

```ts
// server/application/scenario/get-scenario.usecase.ts
import { type Scenario, ScenarioId } from '~/server/domain/scenario/scenario'
import { AppError } from '~/server/domain/errors'
import type { ScenarioRepository } from '~/server/ports/scenario-repository'

export const getScenario = async (
  deps: { scenarios: ScenarioRepository },
  rawId: string,
): Promise<Scenario> => {
  const id = ScenarioId(rawId)                              // throws AppError(invalid-scenario-id) on bad input
  const scenario = await deps.scenarios.findById(id)
  if (!scenario) {
    throw new AppError(
      'urn:archimulant:scenario-not-found',
      `Scenario ${rawId} not found`,
      { fix: 'Check the id or call GET /scenarios to list available ones' },
    )
  }
  return scenario
}
```

- First parameter is **always** `deps`, an object of ports.
- Other parameters are domain types or primitives.
- Returns domain types.
- Never imports from `h3`, `nitro`, `node:*`, or any adapter.

### Outbound adapters — factory functions returning the port type

```ts
// server/adapters/outbound/json-file-scenario-repository.ts
import { z } from 'zod'
import { ScenarioId, type Scenario } from '~/server/domain/scenario/scenario'
import type { ScenarioRepository } from '~/server/ports/scenario-repository'

// The adapter owns the WIRE FORMAT schema. This is distinct from the domain
// schema: it describes what's on disk today, may include legacy fields, and
// gets versioned independently as the file format evolves.
const ScenarioFileV1Schema = z.object({
  id: z.string(),                           // raw — branded via domain factory below
  name: z.string(),
  description: z.string(),
  nodes: z.array(/* … */),
  edges: z.array(/* … */),
  targetMetrics: /* … */,
})

const toDomain = (file: z.infer<typeof ScenarioFileV1Schema>): Scenario => ({
  ...file,
  id: ScenarioId(file.id),                  // validate + brand via domain factory
})

export const createJsonFileScenarioRepository = (
  scenariosDir: string,
): ScenarioRepository => ({
  async findById(id) { /* readFile → ScenarioFileV1Schema.parse → toDomain */ },
  async listAll() { /* … */ },
})
```

- One file per `(technology × port)` combination.
- Return type is the port interface, not a concrete class.
- **Owns its own schema** for the wire format. The domain schema describes "what is a valid Scenario in our model"; the adapter schema describes "what does the JSON file on disk look like today". They often coincide on day one and diverge with versioning.
- Maps wire format → domain via the domain factories (`ScenarioId(raw)`, etc.), not by re-validating against the domain schema.
- May construct domain values; may NOT call domain operations.
- Throws domain errors out, never `ZodError` or `ENOENT`. Wrap technology errors at the adapter boundary.

### Inbound HTTP adapters — `server/api/`

```ts
// server/api/scenarios/[id].get.ts
import { AppError } from '~/server/domain/errors'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  try {
    return await getScenario(event.context.scope, id)
  } catch (err) {
    // Map endpoint-specific codes here. Cross-cutting codes (invalid-input,
    // internal-error) are mapped by the global error handler — let them through.
    if (err instanceof AppError && err.code === 'urn:archimulant:scenario-not-found') {
      throw createError({
        statusCode: 404,
        statusMessage: err.message,
        data: { type: err.code, title: 'Scenario Not Found', why: err.why, fix: err.fix },
      })
    }
    throw err
  }
})
```

- Read deps from `event.context.scope` directly. No accessor wrappers.
- Translate HTTP → use-case call → response.
- Map **endpoint-specific** error codes to HTTP statuses via `createError({ data })`. Let cross-cutting codes fall through to the global error handler.
- **No business logic.** If the body of a handler contains anything other than parsing, calling, and translating, it belongs in a use case.

### Error handling — single `AppError` class, code-driven

All layers throw the same class. The `code` carries the meaning. RFC 9457 Problem Details is the response format.

```ts
// server/domain/errors.ts
export type ErrorCode =
  | 'urn:archimulant:scenario-not-found'
  | 'urn:archimulant:invalid-scenario-id'
  | 'urn:archimulant:invalid-input'
  | 'urn:archimulant:internal-error'

export interface AppErrorOptions {
  cause?: unknown
  why?: string                    // optional explanation
  fix?: string                    // optional actionable hint for the caller
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
```

The global Nitro error handler maps cross-cutting codes to HTTP status and emits RFC 9457 Problem Details. Endpoint-specific codes are not in this catalog — they are handled in route handlers.

```ts
// server/error.ts (or wherever defineNitroErrorHandler lives)
const GENERIC_CATALOG: Partial<Record<ErrorCode, { title: string, status: number }>> = {
  'urn:archimulant:invalid-input':   { title: 'Invalid Input', status: 400 },
  'urn:archimulant:internal-error':  { title: 'Internal Server Error', status: 500 },
}
```

- **One class, not many.** No `AdapterError` vs `ApplicationError` split. The `code` is the discriminator.
- **All layers use `AppError`.** Domain throws it from factories; use cases throw it on business rule violations; adapters throw it (with `internal-error`) when infrastructure fails.
- **Walk the cause chain to detect.** Use `findAppError(err)` rather than `err instanceof AppError` or name-based checks — h3 wraps errors and may bury yours under one or more levels of `cause`.
- **Adapters wrap technology errors.** Catch `ZodError`, `ENOENT`, `PgError`, etc., and re-throw as `new AppError('urn:archimulant:internal-error', '…', { cause: original })`. Never let raw technology errors escape an adapter.
- **Endpoint-specific codes are mapped in the route.** Cross-cutting codes are mapped in `server/error.ts`. Don't put `scenario-not-found` in the global catalog — different endpoints may want different statuses or titles for the same code.
- **Response shape is RFC 9457.** Body is `application/problem+json` with `type`, `title`, `status`, `detail`, `instance`, plus optional extensions `why` and `fix`. Include the request id (from `event.context.scope.logger`) so user-reported errors can be grepped in logs.
- **Security headers on errors.** `nosniff`, `frame-ancestors 'none'`, `cache-control: no-cache`. The global handler is the single place this is enforced.

### Logging — evlog wide events behind two ports

Logging uses **evlog**, a wide-event logger. One request emits one log line at the end, with context accumulated throughout via `log.set({ … })`. This is intentionally NOT a pino-style "info/warn/error log everywhere" model. Capture context at boundaries and decision points, not by tracing function flow.

evlog provides three APIs. The architecture uses two of them:

- **`useLogger(event)` from `evlog/nitro/v3`** — request-scoped wide events. `set()` accumulates, framework emits at request end. Wraps to the `Logger` port.
- **`log.info(...)` from `evlog`** — fire-and-forget structured logs. One call, one emitted line. Wraps to the `AppLogger` port.

We deliberately do **not** use `createLogger()` from evlog. `createLogger()` is shaped for "one wide event per unit of work" (script, job, workflow) — each instance accumulates context and emits once, then is sealed. It's the wrong shape for discrete lifecycle events like "pool created" or "migration applied", which are individual structured events. Using `createLogger()` for lifecycle events produces `log.set() called after the wide event was emitted` warnings as the sealed instance is reused.

The two ports model the right semantics for each use case:

- **`Logger`** (one method, `set()`) — request-scoped. Lives on `event.context.scope.logger`. Used by use cases and per-request adapter calls. Framework handles emission.
- **`AppLogger`** (one method, `log()`) — app-scoped. Lives on `AppContainer.appLogger`. Used by singletons, lifecycle events, plugin hooks, and out-of-request callbacks. Each call emits one structured log line immediately via `evlog.log.info`.

```ts
// server/ports/logger.ts

/**
 * Request-scoped logger. Accumulates structured context across the request;
 * the framework emits one log line automatically at request end.
 * Use in handlers, use cases, and adapters called during a request.
 */
export interface Logger {
  set(data: Record<string, unknown>): void
}

/**
 * App-scoped logger. Each call emits one discrete log line immediately.
 * No accumulation, no emission boundary.
 * Use in singletons, lifecycle events, plugin hooks, and callbacks that
 * fire outside a request.
 */
export interface AppLogger {
  log(data: Record<string, unknown>): void
}
```

```ts
// server/adapters/outbound/evlog-logger.ts
import { log as evlogLog } from 'evlog'
import type { useLogger } from 'evlog/nitro/v3'
import type { Logger, AppLogger } from '~/server/ports/logger'

type EvlogRequestLog = ReturnType<typeof useLogger>

// Request-scoped: framework emits the wide event at request end.
export const createEvlogLoggerAdapter = (evlog: EvlogRequestLog): Logger => ({
  set: (data) => evlog.set(data),
})

// App-scoped: each log() call is a fire-and-forget structured event.
// Uses evlog's simple log API (log.info), NOT createLogger — createLogger is
// for accumulated wide events per unit of work, which is the wrong shape for
// discrete lifecycle events. `defaults` merge into every emitted event.
export const createEvlogAppLoggerAdapter = (
  defaults: Record<string, unknown> = {},
): AppLogger => ({
  log: (data) => evlogLog.info({ ...defaults, ...data }),
})
```

```ts
// server/container.ts
import { createEvlogAppLoggerAdapter } from '~/server/adapters/outbound/evlog-logger'

export interface AppContainer {
  appLogger: AppLogger                  // singleton, for lifecycle events
  // … other singletons (pools, gateways, repositories)
}

export interface RequestContainer extends AppContainer {
  logger: Logger                        // request-scoped, set in middleware
  currentUser: User | null
  reqId: string
}

export const buildAppContainer = (config: RuntimeConfig): AppContainer => {
  const appLogger = createEvlogAppLoggerAdapter({ scope: 'app' })
  // pass appLogger to any adapter that has lifecycle behaviour
  return {
    appLogger,
    // …
  }
}
```

```ts
// server/middleware/00.context.ts
import { useLogger } from 'evlog/nitro/v3'
import { createEvlogLoggerAdapter } from '~/server/adapters/outbound/evlog-logger'

export default defineEventHandler((event) => {
  const app = useNitroApp()
  const reqId = crypto.randomUUID()
  const evlog = useLogger(event)
  evlog.set({ reqId })

  event.context.scope = {
    ...app.container,                   // includes appLogger
    currentUser: null,
    reqId,
    logger: createEvlogLoggerAdapter(evlog),
  } satisfies RequestContainer
})
```

#### When to use which

The decision is mechanical — ask *when can this event fire?*

- **Only ever inside a request** → use `logger` (request-scoped). Examples: use-case decisions, validation outcomes, audit events tied to a user action.
- **Can fire outside a request** → use `appLogger`. Examples: pool lifecycle events, plugin boot/shutdown, scheduled jobs, callbacks on long-lived objects.
- **Both** → use `appLogger`. Pool errors during idle and pool errors mid-request both describe "the pool had a problem"; correlation via request id (when relevant) is already in the request wide event.

#### Pattern: lifecycle events in singleton adapters

Adapters with lifecycle (pool, message bus, watcher) take `appLogger` at construction. **Lifecycle events** go to `appLogger`. **Query/operation failures** are thrown as `AppError`, not logged — they bubble to the global error handler, which attaches them to the request wide event.

```ts
// server/adapters/outbound/postgres-pool.ts
export const createPostgresPool = (config: {
  connectionString: string
  appLogger: AppLogger
}): DbPool => {
  const pool = new pg.Pool({ connectionString: config.connectionString })

  pool.on('error', (err) => {
    config.appLogger.log({
      event: 'db.pool.idle_client_error',
      error: { message: err.message, code: (err as { code?: string }).code },
    })
  })

  config.appLogger.log({ event: 'db.pool.created' })

  return {
    async query(sql, params) {
      try {
        return await pool.query(sql, params)
      } catch (err: any) {
        // Query failure: throw, don't log here. The global error handler
        // attaches the AppError to the request wide event automatically.
        throw new AppError('urn:archimulant:internal-error', `DB query failed: ${err.message}`, { cause: err })
      }
    },
    async shutdown() {
      config.appLogger.log({ event: 'db.pool.shutdown' })
      await pool.end()
    },
  }
}
```

#### Use cases — receive `logger` only when needed

```ts
export const getScenario = async (
  deps: { scenarios: ScenarioRepository, logger: Logger },
  rawId: string,
): Promise<Scenario> => {
  const id = ScenarioId(rawId)
  const scenario = await deps.scenarios.findById(id)
  deps.logger.set({ scenario: { found: !!scenario, id: rawId } })
  if (!scenario) throw new AppError('urn:archimulant:scenario-not-found', `Scenario ${rawId} not found`)
  return scenario
}
```

Most use cases don't need a logger. evlog's value is the auto-captured wide event at request boundaries plus error context from the global handler. Add `logger` to a use case's `deps` only when it has decisions or stats worth recording separately.

#### Errors flow into the wide event

The global error handler attaches `AppError` context to the request wide event so successes and failures are equally observable:

```ts
// in server/error.ts, inside defineNitroErrorHandler
const appError = findAppError(error)
if (appError) {
  event.context.scope?.logger.set({
    error: { code: appError.code, why: appError.why, fix: appError.fix },
  })
  // … existing RFC 9457 response logic
}
```

- **Wide events, not log levels.** Use `set(...)` (request) or `log(...)` (app) to attach structured context. Don't add `info`/`warn`/`error` methods to either port; severity is determined by the response status and any attached error.
- **Two ports, different semantics.** `Logger` has `set()` only — request-scoped, framework emits at request end. `AppLogger` has `log()` only — app-scoped, each call emits one line. Don't try to unify them.
- **Singleton adapters log lifecycle, throw operation errors.** Pool created/closed/idle-error → `appLogger.log(...)`. Query failure → `throw new AppError(...)`, no logging at the adapter.
- **Don't bridge appLogger → request wide event.** evlog's Nitro adapter doesn't use AsyncLocalStorage, so callbacks on long-lived objects can't know which request triggered them. Don't build your own ALS to fake it.
- **Inject `logger` into a use case only when needed.** Most use cases don't log; auto-captured boundary context is enough.
- **Multi-step app tasks get a one-off `createLogger`.** For a background task that genuinely is "one unit of work emitting one wide event with accumulated context" (a sync job, a simulation run, a batch import), use evlog's `createLogger({ ... })` directly in that task — `set()` as you go, `emit()` at the end. This is the only legitimate use of `createLogger` in the codebase. Do NOT wire `createLogger` into `AppLogger`; it has the wrong shape for discrete lifecycle events and will produce `called after emit` warnings.
- **Use evlog's `createError` if you want `why`/`fix` auto-captured into the wide event from `throw`.** Otherwise call `logger.set({ error: { … } })` explicitly. Both work — pick one and be consistent.

### Authentication & authorization — better-auth behind a port

Authentication uses **better-auth**, which owns its own HTTP routes (`/api/auth/*`), DB tables, and session model. To avoid coupling the application to it, the public surface is wrapped behind a `SessionResolver` port. The application speaks our domain `User`, not better-auth's session shape.

The split is:

- **Authentication** (who is making this request?) — resolved once per request in middleware, attached to `event.context.scope.currentUser`.
- **Authorization** (is this user allowed to do this?) — enforced in use cases via thin guards, never in HTTP middleware (URL-coupled enforcement is brittle).

#### Domain — our `User`

```ts
// server/domain/auth/user.ts
import { z } from 'zod'
import { AppError } from '~/server/domain/errors'

export const UserIdSchema = z.string().min(1).brand<'UserId'>()
export type UserId = z.infer<typeof UserIdSchema>
export const UserId = (raw: string): UserId => {
  const parsed = UserIdSchema.safeParse(raw)
  if (!parsed.success) throw new AppError('urn:archimulant:invalid-input', `Invalid user id: ${raw}`)
  return parsed.data
}

export const UserSchema = z.object({
  id: UserIdSchema,
  email: z.string().email(),
  name: z.string(),
  emailVerified: z.boolean(),
})
export type User = z.infer<typeof UserSchema>
```

Contains **only** the fields use cases actually need. Don't add provider info, avatar URLs, `createdAt`, or anything else that doesn't drive a domain rule. Each field is a contract you commit to.

#### Port — `SessionResolver`

```ts
// server/ports/session-resolver.ts
import type { User } from '~/server/domain/auth/user'

export interface SessionResolver {
  resolve(headers: Headers): Promise<User | null>
}
```

`headers` is the standard Web `Headers` (h3's `event.headers`), not Node's `IncomingHttpHeaders`.

#### Adapter — better-auth instance + resolver

```ts
// server/adapters/outbound/better-auth.ts
import { betterAuth } from 'better-auth'
import { UserId, type User } from '~/server/domain/auth/user'
import type { SessionResolver } from '~/server/ports/session-resolver'

export interface AuthAdapterConfig {
  baseURL: string
  google: { clientId: string, clientSecret: string }
  github: { clientId: string, clientSecret: string }
  // database, secret, etc.
}

export const createAuthInstance = (config: AuthAdapterConfig) =>
  betterAuth({
    baseURL: config.baseURL,
    socialProviders: { google: config.google, github: config.github },
    // database adapter wired here (Prisma/Drizzle/etc.)
  })

export type AuthInstance = ReturnType<typeof createAuthInstance>

export const createBetterAuthSessionResolver = (auth: AuthInstance): SessionResolver => ({
  async resolve(headers) {
    const session = await auth.api.getSession({ headers })
    if (!session?.user) return null
    return {
      id: UserId(session.user.id),
      email: session.user.email,
      name: session.user.name,
      emailVerified: session.user.emailVerified ?? false,
    }
  },
})
```

Adapter owns the mapping from better-auth's session shape to our domain `User`. better-auth's full session never enters the application layer.

#### Container — wires both

```ts
// server/container.ts
export interface AppContainer {
  appLogger: Logger
  authInstance: AuthInstance              // exposed only for the catch-all mount
  sessionResolver: SessionResolver
  // …
}

export interface RequestContainer extends AppContainer {
  logger: Logger
  reqId: string
  currentUser: User | null
}

export const buildAppContainer = (config: RuntimeConfig): AppContainer => {
  const authInstance = createAuthInstance(config.auth)
  return {
    appLogger: createEvlogLoggerAdapter(createLogger({ scope: 'app' })),
    authInstance,
    sessionResolver: createBetterAuthSessionResolver(authInstance),
    // …
  }
}
```

#### Inbound — the catch-all mount

```ts
// server/api/auth/[...all].ts
export default defineEventHandler((event) => {
  return useNitroApp().container.authInstance.handler(toWebRequest(event))
})
```

The only file that knows better-auth handles HTTP routes. Sign-in, OAuth callbacks, session refresh — all handled by better-auth via this single route.

#### Build-time — `auth.config.ts` for the better-auth CLI

The better-auth CLI (`pnpm dlx auth@latest generate ...`) needs a top-level `auth` export to introspect the schema. Our factory pattern doesn't satisfy it directly. Add a thin CLI-only config file at the repo root that calls the same factory:

```ts
// auth.config.ts (repo root — CLI-only, NOT imported at runtime)
import 'dotenv/config'
import { createAuthInstance } from './server/adapters/outbound/better-auth'

export const auth = createAuthInstance({
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? 'cli-placeholder',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? 'cli-placeholder',
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID ?? 'cli-placeholder',
    clientSecret: process.env.GITHUB_CLIENT_SECRET ?? 'cli-placeholder',
  },
  // database adapter — schema generation needs to see this
})
```

Run schema generation with `pnpm dlx auth@latest generate --config ./auth.config.ts`. The placeholder secrets are fine; the CLI only introspects the config shape (database adapter, plugins, providers) and doesn't make network calls. Both runtime (via `container.ts`) and CLI (via this file) call the same `createAuthInstance`, so the config shape can't drift.

#### Schema migrations — applied at server startup for SQLite

Better-auth ships two ways to apply schema changes:

- **CLI** — `auth migrate --config ./auth.config.ts --yes` introspects the live DB, diffs against the auth config, and applies missing tables/columns. Idempotent. Available only for the built-in Kysely adapter (SQLite/Postgres/MySQL/MSSQL); for Prisma/Drizzle, use the ORM's own migration tool.
- **Programmatic** — `getMigrations(options)` from `better-auth/db/migration` returns `{ toBeCreated, toBeAdded, runMigrations }`. Same logic as the CLI, callable from code.

For **SQLite local dev**, run migrations from the composition root so the server is never up against a stale schema. This is safe for SQLite because it's a single-process file DB; for Postgres in production, disable this toggle and run migrations via CI/CD instead.

```ts
// server/plugins/00.composition.ts
import { getMigrations } from 'better-auth/db/migration'

export default defineNitroPlugin(async (nitroApp) => {
  const config = useRuntimeConfig()
  const container = buildAppContainer(config)

  if (config.auth.autoMigrate) {
    const { runMigrations, toBeCreated, toBeAdded } = await getMigrations(
      container.authInstance.options,
    )
    if (toBeCreated.length || toBeAdded.length) {
      await runMigrations()
      container.appLogger.log({
        event: 'auth.migrations.applied',
        created: toBeCreated.map((t) => t.name),
        altered: toBeAdded.length,
      })
    } else {
      container.appLogger.log({ event: 'auth.migrations.up_to_date' })
    }
  }

  nitroApp.container = container
  container.appLogger.log({ event: 'app.started' })
  nitroApp.hooks.hookOnce('close', async () => {
    container.appLogger.log({ event: 'app.shutting_down' })
  })
})
```

Toggle in `nuxt.config.ts`:

```ts
runtimeConfig: {
  auth: {
    autoMigrate: process.env.AUTH_AUTO_MIGRATE === 'true',
  },
}
```

Set `AUTH_AUTO_MIGRATE=true` in `.env` for local dev. Leave unset in production.

Also add `package.json` scripts for explicit CLI use — schema inspection, manual production deploys, or as a fallback:

```json
{
  "scripts": {
    "auth:generate": "auth generate --config ./auth.config.ts --yes",
    "auth:migrate":  "auth migrate  --config ./auth.config.ts --yes"
  }
}
```

- **Auto-migrate is dev-only for shared databases.** SQLite local files are safe; Postgres/MySQL with multiple server instances are not — concurrent `CREATE TABLE` attempts can collide.
- **Migrations run before the container is published.** The plugin is `async`; Nitro doesn't open the port until it resolves. No race between server-accepting-traffic and schema-being-ready.
- **`getMigrations` only works with the Kysely adapter.** With Prisma/Drizzle, use their migration tools (`prisma migrate deploy`, `drizzle-kit migrate`) — the CLI/programmatic path doesn't apply.

#### Middleware — resolve session, populate `currentUser`

```ts
// server/middleware/00.context.ts
import { useLogger } from 'evlog/nitro/v3'
import { createEvlogLoggerAdapter } from '~/server/adapters/outbound/evlog-logger'
import { getRequestURL } from 'h3'

// Paths where session resolution is unnecessary or would recurse.
const SKIP_AUTH_PATHS = ['/api/auth/', '/api/health']

export default defineEventHandler(async (event) => {
  const app = useNitroApp()
  const reqId = crypto.randomUUID()
  const evlog = useLogger(event)
  evlog.set({ reqId })

  const path = getRequestURL(event).pathname
  const skipAuth = SKIP_AUTH_PATHS.some((p) => path.startsWith(p))
  const currentUser = skipAuth
    ? null
    : await app.container.sessionResolver.resolve(event.headers)

  if (currentUser) evlog.set({ user: { id: currentUser.id } })

  event.context.scope = {
    ...app.container,
    currentUser,
    reqId,
    logger: createEvlogLoggerAdapter(evlog),
  } satisfies RequestContainer
})
```

`SKIP_AUTH_PATHS` is mandatory for `/api/auth/` — resolving the session on better-auth's own routes would recurse. Health/public routes save a DB query.

#### Application — guards in use cases

```ts
// server/application/auth/guards.ts
import { AppError } from '~/server/domain/errors'
import type { User, UserId } from '~/server/domain/auth/user'

export function requireUser(currentUser: User | null): User {
  if (!currentUser) throw new AppError('urn:archimulant:unauthorized', 'Authentication required')
  return currentUser
}

export function requireOwner<T extends { ownerId: UserId }>(resource: T, user: User): T {
  if (resource.ownerId !== user.id) {
    throw new AppError('urn:archimulant:forbidden', 'You do not own this resource')
  }
  return resource
}
```

In a use case:

```ts
import { requireUser, requireOwner } from '~/server/application/auth/guards'

export const deleteScenario = async (
  deps: { scenarios: ScenarioRepository, currentUser: User | null },
  rawId: string,
): Promise<void> => {
  const user = requireUser(deps.currentUser)              // narrows User | null → User
  const id = ScenarioId(rawId)
  const scenario = await deps.scenarios.findById(id)
  if (!scenario) throw new AppError('urn:archimulant:scenario-not-found', `Scenario ${rawId} not found`)
  requireOwner(scenario, user)
  await deps.scenarios.delete(id)
}
```

`requireUser` does double duty: it enforces the rule AND narrows the type so the rest of the function works with `User`, not `User | null`.

For domain-level policy rules, put a pure function in `domain/<feature>/policies.ts` and let the application call it:

```ts
// server/domain/scenario/policies.ts
export const canEditScenario = (scenario: Scenario, userId: UserId): boolean =>
  scenario.ownerId === userId || scenario.collaborators.includes(userId)
```

Domain owns the rule; application applies it.

#### Error codes for auth

Add two cross-cutting codes to `server/domain/errors.ts`:

```ts
export type ErrorCode =
  | 'urn:archimulant:scenario-not-found'
  | 'urn:archimulant:invalid-scenario-id'
  | 'urn:archimulant:invalid-input'
  | 'urn:archimulant:internal-error'
  | 'urn:archimulant:unauthorized'        // no session
  | 'urn:archimulant:forbidden'           // session, but operation not allowed
```

And to `GENERIC_CATALOG` in `server/error.ts`:

```ts
'urn:archimulant:unauthorized': { title: 'Unauthorized', status: 401 },
'urn:archimulant:forbidden':    { title: 'Forbidden',    status: 403 },
```

Both are cross-cutting — every protected use case throws these codes the same way, so they belong in the global catalog and never need per-route mapping.

- **Domain `User` contains only fields use cases use.** Avatar URLs, provider info, `createdAt` — keep them in better-auth, don't surface them.
- **`SessionResolver` is the only port for auth.** The application never imports `better-auth` directly. No "AuthService", no "AuthProvider" — one port, `resolve(headers)`.
- **Session resolution happens in middleware exactly once per request.** Use cases read `currentUser` from `deps`; they never call the resolver themselves.
- **`SKIP_AUTH_PATHS` must include `/api/auth/`** to prevent recursion. Add public/health routes for performance.
- **Authorization is in the use case, not the route.** HTTP middleware doesn't know domain rules; use cases do. Routes stay thin even for protected operations.
- **Use type-narrowing guards.** `requireUser(deps.currentUser)` returns `User`, not `void` — it's both a check and a refinement.
- **Domain policy rules are pure functions in `domain/<feature>/policies.ts`.** Application guards combine them with `requireUser`/`requireOwner` and translate to `AppError`.

## Strict rules — MUST follow

- **Domain is pure.** Zero imports from `h3`, `nitro`, `node:*`, or anything in `adapters/` or `application/`. Pure validation libraries (`zod`) are allowed: they have no I/O and no framework coupling, and they express invariants — which is what the domain owns.
- **Application is framework-free.** Use cases receive `deps`, never `event` or `H3Event`.
- **Ports are domain-specific.** `ScenarioRepository`, not `FileSystemPort` or generic `Repository<T>`.
- **Composition happens in one place.** All wiring lives in `server/container.ts`. Use cases and adapters never instantiate each other.
- **Factory functions only.** No classes for use cases, adapters, or services. `AppError` is the one allowed class (it must extend `Error`).
- **Handlers stay thin.** Parse → call use case → translate. Everything else is a use case.
- **Adapters own their mapping.** The on-disk/over-the-wire shape stays inside the adapter; only domain types cross the boundary.
- **One error class.** Every layer throws `AppError` with a `code`. No `AdapterError`/`ApplicationError` split, no per-concept error subclasses.
- **Adapters wrap technology errors.** Catch `ZodError`, `ENOENT`, `PgError`, etc., and re-throw as `AppError` with the original in `cause`. Raw technology errors never leave an adapter.
- **Two logger ports.** `Logger` (`set()` only) is request-scoped, lives on `event.context.scope.logger`, framework emits at request end. `AppLogger` (`log()` only) is app-scoped, lives on `AppContainer.appLogger`, emits per call. Use cases receive `logger` via `deps` only when needed; singletons receive `appLogger` at construction.
- **Auth goes through `SessionResolver`.** The `better-auth` instance is owned by one adapter file and one inbound mount route. Application code never imports `better-auth`; it reads `currentUser` from `deps`. Authorization is enforced in use cases via `requireUser`/`requireOwner` guards, never in HTTP middleware.

## Forbidden patterns — DO NOT do these

- ❌ Importing `H3Event`, `useEvent`, or anything from `h3`/`nitro` inside `application/` or `domain/`.
- ❌ Generic technology-named ports: `FileSystem`, `Database`, `Repository<T>`, `HttpClient`. Always name after the domain.
- ❌ Calling `useNitroApp()` outside `plugins/` and `middleware/`.
- ❌ Instantiating an adapter inside a use case (`createJsonFileScenarioRepository(...)` from `getScenario`). Wiring is forbidden outside `container.ts`.
- ❌ `defineEventHandler` outside `server/api/` and `server/middleware/`.
- ❌ Mutating `event.context` from inside a use case. Context is set in middleware, read in handlers.
- ❌ NestJS-style decorators (`@Injectable`, `@Inject`, `Reflect.metadata`). We do not use a DI container.
- ❌ Classes for use cases, adapters, or services. Factory functions returning plain objects only. (`AppError` is the single exception — it must extend `Error`.)
- ❌ Leaking on-disk JSON shape, ORM row shape, or DTO shape into the domain types.
- ❌ Throwing technology errors (`PgError`, `ZodError`, `ENOENT`) out of an adapter. Wrap as `AppError` at the adapter boundary, preserve original in `cause`.
- ❌ Putting accessor functions like `useScenarioRepository(event)` in `server/utils/`. Handlers read `event.context.scope.scenarios` directly.
- ❌ Calling a port from `domain/`. Ports are called by use cases, never by domain code.
- ❌ Calling domain operations (`scenario.activate()`, `computeMetrics(scenario)`) from an adapter or a handler. That logic belongs in a use case.
- ❌ Per-concept error subclasses (`ScenarioNotFoundError`, `InvalidScenarioIdError`). Use `AppError` with an `ErrorCode`.
- ❌ Detecting errors by `err.name === 'AppError'`. Use `findAppError(err)` from `~/server/domain/errors`; it walks the cause chain.
- ❌ Putting endpoint-specific codes (e.g. `scenario-not-found`) in the global error catalog. Map them in the route handler.
- ❌ Importing `useLogger` from `evlog/nitro/v3` or `createLogger` from `evlog` inside `application/` or `domain/`. Use the `Logger` port via `deps.logger` or `deps.appLogger`.
- ❌ Using `createLogger()` from `evlog` inside `createEvlogAppLoggerAdapter` or anywhere that emits multiple discrete events. `createLogger` is a one-shot wide-event-per-instance API; reusing one instance for many events produces `called after emit` warnings. Use `log.info(...)` for lifecycle events; reserve `createLogger` for genuine multi-step tasks.
- ❌ Adding `info`/`warn`/`error` methods to either logger port. evlog is wide-event based — use `set()` (request) or `log()` (app) to attach context.
- ❌ Calling `appLogger.set(...)` (it doesn't exist on `AppLogger`). Standalone evlog doesn't auto-emit. Use `appLogger.log(...)` for one-shot events.
- ❌ Calling `logger.log(...)` (it doesn't exist on `Logger`). Request-scoped evlog accumulates and auto-emits. Use `logger.set(...)`.
- ❌ Using `appLogger` from inside a use case or per-request handler. In-request code uses `logger`. `appLogger` is for singletons, lifecycle, and background work.
- ❌ Logging query/operation failures from inside an adapter. Throw `AppError`; the global error handler attaches it to the request wide event.
- ❌ Building your own AsyncLocalStorage to forward singleton callback events into the current request's wide event. evlog's Nitro adapter is event-bound; respect that boundary.
- ❌ Sprinkling `logger.set(...)` calls throughout a use case for low-value events. Capture context at decision points and boundaries; don't trace the function flow.
- ❌ Importing `better-auth` from `application/`, `domain/`, or any handler other than `server/api/auth/[...all].ts`. Use the `SessionResolver` port and read `currentUser` from `deps`.
- ❌ Calling `auth.api.getSession()` from a use case or handler. Session resolution happens once in middleware; downstream code reads `currentUser` from the scope.
- ❌ HTTP-level auth middleware that checks login by URL pattern. Authorization lives in the use case where the rule applies.
- ❌ Putting better-auth's full session shape into the domain `User`. The adapter maps to our minimal User shape; the domain doesn't know about providers, sessions, or cookies.
- ❌ Removing `/api/auth/` from `SKIP_AUTH_PATHS`. Resolving sessions on better-auth's own routes recurses indefinitely.

## Checklist — adding a new feature

1. Define domain types in `server/domain/<feature>/`. No I/O.
2. Define the port interface in `server/ports/<feature>-repository.ts` using domain types only.
3. Write the use case in `server/application/<feature>/<verb>.usecase.ts` as `async (deps, …args) => …`.
4. Implement the outbound adapter in `server/adapters/outbound/<tech>-<feature>-repository.ts` as a factory returning the port type.
5. Register the binding in `server/container.ts` inside `buildAppContainer`.
6. Add the HTTP route in `server/api/<feature>/<route>.<method>.ts`. Keep it thin.
7. Write a use-case unit test using an in-memory port fake. No Nitro, no fs, no DB.

## Testing

- **Use-case tests**: import the use case, pass an in-memory fake of the port, assert. No framework setup.
- **Adapter tests**: integration-test the adapter against the real technology (test DB, fixture files).
- **Route tests**: only for HTTP-translation concerns (status codes, headers). Business logic is already covered by use-case tests.

## Verification before commit

- `pnpm typecheck` — must pass
- `pnpm test` — all use-case tests pass
- `pnpm lint` — import-boundary rules pass (see `eslint.config.ts`)

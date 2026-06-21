---
title: Retry & Backoff
group: availability
summary: Automatically retry transient failures - but with growing delays and jitter, so you recover without hammering a struggling service.
tags:
  - resilience
  - fault-tolerance
canonicalPattern: Retry
usedIn: []
goDeeper:
  - label: "Azure - Retry pattern"
    url: https://learn.microsoft.com/en-us/azure/architecture/patterns/retry
  - label: "AWS - Exponential Backoff and Jitter"
    url: https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
order: 25
---

## The problem

Many failures in a distributed system are **transient**: a brief network blip, a momentary timeout, a quick spike the dependency recovers from in milliseconds. Giving up on the first error turns a recoverable hiccup into a user-facing failure. But the naive fix - retry immediately, maybe in a tight loop - is worse: when a service is already struggling, a flood of instant retries from every caller is exactly what keeps it down. This is a **retry storm**, and it can turn a small wobble into a full outage.

## How it works

Retry transient failures, but **space the attempts out**:

- **Exponential backoff** - wait longer between each attempt (e.g. 100ms, 200ms, 400ms, 800ms). Early retries catch quick blips; later ones give a genuinely struggling service room to recover.
- **Jitter** - add a small random offset to each delay. Without it, thousands of clients that failed at the same instant retry in synchronised waves; jitter spreads them out.
- **A retry budget** - cap the number of attempts and the total time, then fail cleanly. Retrying forever just relocates the failure.
- **Retry only what's safe** - retries assume the operation is **idempotent** (safe to repeat). Retrying a non-idempotent "charge card" can double-charge.

## Impact on metrics

| Metric | Effect | Why |
| --- | --- | --- |
| **Availability** | ⬆️ improves | Transient failures recover invisibly instead of surfacing as errors |
| **Latency** | ⬇️ worse on the failing path | A retried request takes the sum of its waits before it succeeds |
| **Throughput** | ➡️ risk under stress | Done well it's neutral; done badly (no backoff) retries amplify load |
| **Cost** | ➡️ negligible | A client-side concern |

## Trade-offs & when *not* to use it

- **Retries amplify load at the worst moment.** Without backoff, jitter, and a cap, they make an overloaded service's problem worse - the opposite of the intent.
- **Only for transient faults.** Retrying a deterministic error (bad input, 404, auth failure) wastes time and resources - it will never succeed.
- **Idempotency is a prerequisite.** If repeating the call can double an effect, you need idempotency keys before you retry.

Retry is the other half of the **circuit breaker**: retry the blip, but once the breaker trips, stop retrying and fail fast until the dependency is healthy again.

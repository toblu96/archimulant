---
title: Circuit Breaker
group: availability
summary: Stop calling a failing dependency so a slow service in one corner of the system can't drag the whole thing down.
tags:
  - resilience
  - fault-tolerance
canonicalPattern: Circuit Breaker
usedIn:
  - microservices-cascade-failure
goDeeper:
  - label: "Azure - Circuit Breaker pattern"
    url: https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker
  - label: "Martin Fowler - CircuitBreaker"
    url: https://martinfowler.com/bliki/CircuitBreaker.html
order: 20
---

## The problem

When one service calls another over the network, that call can fail slowly: the dependency is overloaded, so it takes 30 seconds to time out instead of failing fast. Every caller now holds a thread or connection open, waiting. Under load those waiting requests pile up, exhaust the caller's own resources, and the caller starts failing too. The fault **cascades** outward from the original sick service until large parts of the system are down - even the parts that had nothing wrong with them.

Retrying makes it worse: hammering a struggling service with retries is exactly what keeps it from recovering.

## How it works

A circuit breaker is a wrapper around a remote call that watches for failures, modelled on the electrical fuse. It has three states:

- **Closed** - calls flow through normally. The breaker counts failures.
- **Open** - once failures cross a threshold, the breaker "trips". Further calls fail *immediately* without touching the dependency, usually returning a fallback (a cached value, a default, or a clean error). This gives the sick service room to recover and frees the caller's resources.
- **Half-open** - after a cooldown, the breaker lets a few trial calls through. If they succeed, it closes again; if they fail, it re-opens.

The key shift is **failing fast instead of failing slow**. A tripped breaker turns a 30-second hang into an instant, contained response.

## Impact on metrics

| Metric | Effect | Why |
| --- | --- | --- |
| **Availability** | ⬆️ improves overall | Contains failures so they don't cascade; the rest of the system keeps serving |
| **Latency** | ⬆️ much lower *during a fault* | Tripped calls return instantly instead of waiting for a timeout |
| **Throughput** | ⬆️ protected | Caller threads aren't tied up waiting, so it keeps processing healthy traffic |
| **Cost** | ➡️ negligible | A library-level concern, not new infrastructure |

The breaker does nothing on a healthy system - its value shows up precisely when a dependency degrades.

## Trade-offs & when *not* to use it

- **It hides the dependency while open.** Callers get fallbacks or errors, not real data. You need a sensible fallback, and your product has to tolerate degraded answers for that path.
- **Tuning is real work.** Thresholds, cooldown, and trial counts that are too eager trip on normal blips; too lax and the cascade happens anyway.
- **It adds a failure mode to reason about.** "Why am I getting fallbacks?" is a new question for on-call.
- **Skip it for in-process calls.** The pattern is for *remote* dependencies that can fail independently. A local function call can't cascade across the network, so wrapping it adds complexity for nothing.

Circuit breakers pair naturally with **retry-and-backoff** (retry transient blips, but stop retrying once the breaker opens) and with the **bulkhead** pattern (isolate the resources each dependency can consume).

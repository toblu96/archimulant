---
title: Bulkhead
group: availability
summary: Partition resources into isolated pools so a failure in one part of the system can't sink the whole ship.
tags:
  - resilience
  - isolation
canonicalPattern: Bulkhead
usedIn:
  - microservices-cascade-failure
goDeeper:
  - label: "Azure - Bulkhead pattern"
    url: https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead
order: 30
---

## The problem

Most services share a single pool of finite resources - a connection pool, a thread pool, a fixed number of worker slots - across everything they do. When one downstream dependency gets slow, calls to it pile up and **hold those shared resources while they wait**. Before long every thread is stuck on the one sick dependency, and the service can no longer serve the *other*, perfectly healthy work. One slow dependency has sunk the whole service.

## How it works

The pattern is named after a ship's hull, divided into watertight **bulkhead** compartments so a breach in one doesn't flood the rest. Apply the same idea to resources: give each dependency (or class of work) its **own isolated pool**.

- Calls to Payment draw from the Payment pool; calls to Search draw from the Search pool.
- If Payment hangs and exhausts *its* pool, those requests fail - but Search still has its full pool and keeps working.

The failure is **contained** to the compartment that sprang the leak. You trade a little peak efficiency (resources can't be freely shared) for isolation.

## Impact on metrics

| Metric | Effect | Why |
| --- | --- | --- |
| **Availability** | ⬆️ improves | A failing dependency degrades one feature, not the entire service |
| **Throughput** | ⬆️ protected | Healthy paths keep their capacity instead of being starved |
| **Latency** | ⬆️ better for healthy paths | They aren't queued behind a saturated shared pool |
| **Cost** | ⬇️ minor | Partitioned pools may need a little more headroom overall |

## Trade-offs & when *not* to use it

- **Sizing is the hard part.** Pools too small waste capacity and throttle healthy traffic; too large and a single compartment can still consume enough to hurt - defeating the isolation.
- **More pools, more to tune and monitor.** Each compartment is another knob.
- **Overkill for a simple service** with one dependency or low load - the isolation buys nothing.

Bulkheads and the **circuit breaker** are a classic pair: the bulkhead caps how many resources a sick dependency can tie up, and the breaker stops calling it altogether once it's clearly failing.

---
title: CQRS (Read/Write Split)
group: decoupling
summary: Separate the model that reads data from the model that writes it, so each can be optimised and scaled on its own.
tags:
  - data
  - scaling
  - patterns
canonicalPattern: CQRS
usedIn: []
goDeeper:
  - label: "Azure - CQRS pattern"
    url: https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs
  - label: "Martin Fowler - CQRS"
    url: https://martinfowler.com/bliki/CQRS.html
order: 20
---

## The problem

Reads and writes often want opposite things. Writes want a normalised, consistent model that enforces invariants. Reads want denormalised, pre-shaped data that's fast to query - often in wildly different shapes for different screens. Forcing both through **one model** means compromise: queries get complex and slow, write logic gets polluted with read concerns, and the two contend for the same database even though they scale very differently (most systems read far more than they write).

## How it works

**CQRS** - Command Query Responsibility Segregation - splits the system into two sides:

- **Commands (writes)** go through a model focused on validation, business rules, and consistency.
- **Queries (reads)** are served by one or more **read models** shaped exactly for how they're consumed - denormalised, pre-joined, even stored in a different database optimised for reads.

The write side publishes changes; the read side is **updated from them**, often asynchronously. The two sides can then be scaled, optimised, and even technology-chosen independently. It pairs naturally with [database replication](/learn/database-replication) (reads off replicas) and event-driven updates.

## Impact on metrics

| Metric | Effect | Why |
| --- | --- | --- |
| **Throughput** | ⬆️ each side scales alone | Read-heavy load scales the read side without touching writes |
| **Latency** | ⬆️ faster reads | Queries hit purpose-built, denormalised read models |
| **Availability** | ⬆️ isolation | Heavy reporting reads can't lock up the write path |
| **Cost** | ⬇️ more moving parts | Separate models/stores and the sync between them cost more to run |

## Trade-offs & when *not* to use it

- **Eventual consistency.** If the read side updates asynchronously, a just-written value may not appear in queries immediately - the application and users must tolerate the lag.
- **Significant complexity.** Two models plus the synchronisation between them is far more than one table; it's easy to over-apply.
- **Only where read and write needs genuinely diverge.** For simple CRUD, one model is simpler, cheaper, and perfectly fine - CQRS would be pure overhead.

CQRS is a targeted tool for read-heavy, query-diverse parts of a system, not a default. Reach for it when a single model is visibly buckling under conflicting read and write demands.

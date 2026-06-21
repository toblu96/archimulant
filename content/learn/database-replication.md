---
title: Database Replication
group: availability
summary: Keep copies of your data on multiple nodes to survive a database failure and spread read load.
tags:
  - data
  - availability
  - scaling
canonicalPattern: Replication / Read Replica
usedIn:
  - ecommerce-peak-traffic
goDeeper:
  - label: "AWS - Read replicas (RDS)"
    url: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html
order: 40
---

## The problem

A single database is two problems at once. It's a **single point of failure** - if it goes down, everything that depends on it goes down too. And it's a **read bottleneck** - every read and every write contends for the same machine, so under load reads slow down or time out. In a read-heavy system (most are), one database becomes the wall the whole system hits.

## How it works

Keep one or more **copies** of the data on separate nodes:

- The **primary** accepts all writes.
- One or more **read replicas** continuously copy the primary's changes and serve read queries. Reads spread across replicas, multiplying read capacity.
- If the primary fails, a replica can be **promoted** to take over - a failover target that turns a catastrophic outage into a brief blip.

Replication can be **synchronous** (the write waits until a replica confirms - safer, slower) or **asynchronous** (the primary confirms immediately and replicas catch up - faster, but a replica can briefly lag).

## Impact on metrics

| Metric | Effect | Why |
| --- | --- | --- |
| **Availability** | ⬆️ improves | A replica can take over when the primary fails |
| **Throughput** | ⬆️ reads scale | Read load spreads across multiple nodes |
| **Latency** | ⬆️ better for reads | More nodes sharing reads means less contention |
| **Cost** | ⬇️ more nodes | Each replica is another database instance to run |

## Trade-offs & when *not* to use it

- **Replication lag means stale reads.** With async replication a replica may be milliseconds-to-seconds behind, so a read right after a write can miss it. Fine for a product listing; not fine for "did my payment go through?".
- **Writes don't scale this way.** All writes still funnel through the single primary. A write-bottlenecked system needs sharding or a different model, not replicas.
- **More moving parts** - failover, promotion, and split-brain prevention are real operational work.

When reads dominate, replication is one of the highest-leverage moves; when writes dominate, look elsewhere. Pairs with **CQRS** to route reads to replicas cleanly.

---
title: Caching Strategies
group: performance
summary: Keep hot data close to where it's used to cut latency and shield the database from repeated reads.
tags:
  - performance
  - data
canonicalPattern: Cache-Aside
usedIn:
  - ecommerce-peak-traffic
  - loan-origination-strain
goDeeper:
  - label: "Azure - Cache-Aside pattern"
    url: https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside
order: 10
---

## The problem

A lot of what a system does is **repeated and unchanging**: the same product page, the same user profile, the same query result, fetched thousands of times. Recomputing or re-reading it from the database every single time burns latency on the request path and piles avoidable load onto the datastore - the very component least able to scale.

## How it works

A **cache** is a fast, in-memory store holding a copy of hot data close to where it's used. The most common approach is **cache-aside**:

1. On a read, check the cache first.
2. **Hit** → return the cached value immediately (fast, no database touch).
3. **Miss** → read from the database, store the result in the cache, then return it.

Subsequent reads of the same data are served from memory. Because the cache can't hold everything, an **eviction policy** (e.g. least-recently-used) drops cold entries, and a **TTL** (time-to-live) expires entries so they're eventually refreshed from the source. The lever that decides whether caching is worth it is the **hit rate** - the fraction of reads served from cache.

## Impact on metrics

| Metric | Effect | Why |
| --- | --- | --- |
| **Latency** | ⬆️ much lower for hits | A memory read is orders of magnitude faster than a database round-trip |
| **Throughput** | ⬆️ effective increase | Cached reads never touch the database, freeing its capacity |
| **Availability** | ⬆️ slightly | The cache absorbs spikes and shields a struggling database |
| **Cost** | ⬇️ adds a cache tier | A Redis/Memcached instance - usually cheap relative to the load it removes |

## Trade-offs & when *not* to use it

- **Invalidation is the hard problem.** A cached copy can go stale the moment the source changes. You must decide how stale is acceptable and how/when to invalidate - one of the genuinely hard problems in computing.
- **Low hit rates are pure overhead.** Caching rarely-repeated or highly personalised data adds a tier and a consistency risk while saving almost nothing.
- **Another component to run and monitor** - and a cold cache (after a restart) briefly sends full load to the database.

Caching is a top lever for read-heavy, latency-sensitive paths; pair it with a **CDN** for static content at the edge.

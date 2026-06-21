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
goDeeper:
  - label: "Azure - Cache-Aside pattern"
    url: https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside
order: 10
---

> 🚧 Draft - full write-up coming soon.

## The problem

_Recomputing or re-fetching the same data on every request wastes latency and hammers the datastore._

## How it works

_Cache-aside reads: check cache, miss falls through to the store and populates the cache. Eviction and TTLs._

## Impact on metrics

_Latency down and effective throughput up for cacheable reads; absorbs spikes._

## Trade-offs & when *not* to use it

_Stale data and invalidation are the hard parts; low hit rates add cost without benefit._

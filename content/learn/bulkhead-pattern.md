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

> 🚧 Draft - full write-up coming soon.

## The problem

_How one greedy or failing dependency exhausts a shared resource pool and takes everything else down with it._

## How it works

_Separate connection/thread pools per dependency, modelled on a ship's watertight compartments._

## Impact on metrics

_Availability: contains the blast radius so unrelated traffic keeps flowing._

## Trade-offs & when *not* to use it

_Pools sized too small waste capacity; too large defeats the isolation. Pairs with the circuit breaker._

---
title: Asynchronous Messaging
group: performance
summary: Put a queue between producer and consumer so spikes are buffered and a slow consumer can't block the caller.
tags:
  - decoupling
  - throughput
  - resilience
canonicalPattern: Queue-Based Load Leveling
usedIn:
  - microservices-cascade-failure
goDeeper:
  - label: "Azure - Queue-Based Load Leveling"
    url: https://learn.microsoft.com/en-us/azure/architecture/patterns/queue-based-load-leveling
order: 30
---

> 🚧 Draft - full write-up coming soon.

## The problem

_Synchronous calls couple caller and callee in time: a slow or down consumer stalls the producer and drops load spikes._

## How it works

_A queue buffers work; consumers process at their own pace. Load leveling and competing consumers._

## Impact on metrics

_Smooths throughput and improves resilience; trades immediate consistency for eventual processing._

## Trade-offs & when *not* to use it

_Adds latency and operational surface (the broker); not for request/response that needs an immediate answer._

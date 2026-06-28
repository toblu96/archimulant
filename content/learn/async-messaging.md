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
  - loan-origination-strain
  - microservices-cascade-failure
goDeeper:
  - label: "Azure - Queue-Based Load Leveling"
    url: https://learn.microsoft.com/en-us/azure/architecture/patterns/queue-based-load-leveling
order: 30
---

## The problem

A synchronous call couples caller and callee **in time**: the producer holds a thread open and waits for the consumer to finish. When the consumer is slow, overloaded, or down, that wait blocks the producer too - and a sudden 10× spike has nowhere to go but straight into a service that can't absorb it. The result is timeouts, dropped requests, and back-pressure that propagates upstream.

## How it works

Insert a **queue** (or message broker) between producer and consumer. The producer publishes a message and returns immediately; the consumer pulls work and processes it at its own steady pace. That does two jobs:

- **Load leveling** - the queue is a buffer. A burst fills the queue; the consumer drains it over time instead of being overwhelmed. Peaks become a longer tail, not a failure.
- **Competing consumers** - add more consumer instances reading the same queue to drain the backlog faster when it grows.

The two sides are now decoupled: the producer doesn't care whether the consumer is fast, slow, or briefly down - the message waits safely in the queue.

## Impact on metrics

| Metric | Effect | Why |
| --- | --- | --- |
| **Throughput** | ⬆️ smoother under spikes | The queue absorbs bursts; consumers process at a sustainable rate |
| **Availability** | ⬆️ improves | A down consumer no longer fails the producer; work resumes on recovery |
| **Latency** | ⬇️ worse end-to-end | Work is now eventual - a message may sit in the queue before it's processed |
| **Cost** | ⬇️ adds the broker | New infrastructure to run, monitor, and secure |

## Trade-offs & when *not* to use it

- **It's eventual, not immediate.** The caller gets an acknowledgement, not a result. Anything that needs an answer *now* (a price to show, a synchronous validation) is the wrong fit.
- **The broker is a new dependency** to operate - and a new potential single point of failure unless it's made redundant.
- **At-least-once delivery** means duplicates happen, so consumers must be **idempotent**; strict ordering is extra work.
- **A growing backlog is a silent failure.** If consumers can't keep up *on average* (not just at peak), the queue grows without bound - monitor queue depth.

Pairs naturally with **rate limiting** (shed load before it reaches the queue) and the **bulkhead** (isolate each consumer pool).

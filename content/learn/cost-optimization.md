---
title: Cost & Trade-offs
group: cost
summary: Every quality improvement has a price - and every cost cut buys back risk. Learn to read the trade-off.
tags:
  - cost
  - trade-offs
canonicalPattern: Cost Optimization
usedIn:
  - ecommerce-peak-traffic
  - loan-origination-strain
  - microservices-cascade-failure
goDeeper:
  - label: "Azure Well-Architected - Cost Optimization"
    url: https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/
order: 10
---

## The problem

Quality isn't free, and neither is waste. Over-provisioned servers, an oversized database tier, a cache nobody hits, redundancy on a path that doesn't need it - all of it shows up on the bill every month. But the opposite is just as dangerous: cutting cost blindly hands back the availability, latency, or throughput you paid to gain. The job is to spend where it buys outcomes and trim where it doesn't.

## How it works

Cost optimization is the disciplined version of the "cost-saving" cards in the game:

- **Right-sizing** - match capacity to actual demand instead of peak-of-peak guesses; drop the database tier running at 10% utilisation.
- **Remove waste** - delete unused replicas, turn off a cache with a near-zero hit rate, retire idle services.
- **Deliberate degradation** - on paths the business can tolerate, accept lower quality for lower cost (a slower batch job, a cheaper provider).

The discipline is to read every cost change **against the other three metrics**, never in isolation. A move that saves money is only good if it doesn't push availability, latency, or throughput below target. For the underlying mindset, see [Trade-offs & Budgets](/learn/trade-offs-and-budgets).

## Impact on metrics

| Metric | Effect | Why |
| --- | --- | --- |
| **Cost** | ⬆️ lower | Less capacity, fewer components, cheaper tiers |
| **Availability** | ⬇️ often the price | Removing redundancy/health checks reimports failure risk |
| **Throughput** | ⬇️ often the price | Smaller instances and dropped replicas cap capacity |
| **Latency** | ⬇️ often the price | Cheaper tiers and removed caches are slower |

The arrows tell the story: cost optimization usually **moves cost in your favour by moving another metric against you**. The skill is doing it only where there's genuine slack.

## Trade-offs & when *not* to use it

- **Never cut on the critical path under load.** The few dollars saved by disabling caching or dropping a replica are dwarfed by the outage it causes during a spike - or a recruiter's visit.
- **"Cheaper" can cost more overall.** A budget database with high latency can breach an SLA whose penalty far exceeds the saving.
- **Premature cost-cutting hides real needs.** Optimise once you understand the load, not before.

Spend deliberately: meet every target, then trim the slack - not the other way round. The constructive counterpart is **right-sizing & autoscaling**.

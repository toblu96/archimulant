---
title: Trade-offs & Budgets
group: foundations
summary: There is no free quality. Every improvement buys one thing by spending another - money, complexity, or a different metric.
tags:
  - basics
  - cost
  - trade-offs
goDeeper:
  - label: "Azure Well-Architected - Cost Optimization"
    url: https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/
  - label: "Azure - Cloud design patterns (trade-offs)"
    url: https://learn.microsoft.com/en-us/azure/architecture/patterns/
order: 3
---

## The first law of architecture

> Everything in software architecture is a trade-off.

Every improvement you apply pays for one quality by spending something else. Caching cuts latency but risks serving stale data. Horizontal scaling adds throughput but adds cost and coordination complexity. A read replica raises availability but introduces replication lag. If a change looks free, you usually haven't found what it costs yet.

The job isn't to find the "best" architecture - there isn't one. It's to find the architecture whose trade-offs you can *live with* for your particular targets and constraints.

## Two kinds of money

Archimulant splits cost the way real projects do:

- **One-time investment** - the upfront cost to build or set something up (migration, configuration, initial hardware). Paid once.
- **Yearly operational cost** - what it costs to keep running, every year (servers, licences, managed services). Paid forever.

Both have a **budget limit**, and both start with a **baseline** (what the system already costs before you touch it). A cheap one-time change with a high recurring cost can be worse than an expensive one-off - operational cost compounds. Watch both bars, not just the sticker price.

## Reading a trade-off

When you weigh an improvement, ask three questions:

1. **What does it move, and is that what I'm short on?** Adding throughput doesn't help if your problem is availability.
2. **What does it cost - one-time, yearly, or both?** Map it against the budget you have left.
3. **What does it cost in *other* qualities?** Look for the side effect - the latency hit, the consistency risk, the new failure mode.

A good move is one that closes the gap on your weakest target without blowing the budget or breaking another target you'd already met.

## The cost-saving trap

Some cards in the game *save* money - and quietly hand back the risk you paid to remove: disabling caching, dropping a replica, downgrading the database. They're not traps because they're wrong; they're there because **cutting cost is also a trade-off**. On a non-critical path, shedding cost is smart. On the critical path during peak traffic, the few dollars you save are dwarfed by the outage you cause.

That tension - quality versus cost, on every component - is the whole game. See how the numbers actually combine in [Topology & Dependencies](/learn/topology-and-dependencies).

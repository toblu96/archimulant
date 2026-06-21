---
title: Topology & Dependencies
group: foundations
summary: How the simulation turns a diagram into numbers - series availability multiplies, latency adds up, and throughput is capped by the bottleneck.
tags:
  - basics
  - simulation
  - metrics
goDeeper:
  - label: "Fallacies of distributed computing"
    url: https://en.wikipedia.org/wiki/Fallacies_of_distributed_computing
  - label: "Availability in series and parallel systems"
    url: https://en.wikipedia.org/wiki/Reliability_engineering
order: 4
---

## From diagram to numbers

A scenario's **topology** is a graph of **nodes** (components) joined by **edges** (connections). Each node and edge carries its own little metrics - an availability, a latency, a throughput. The simulation walks the whole graph and combines them into the three system metrics you're scored on. Three simple rules do all the work. Understanding them tells you exactly *where* to spend.

> The model is deliberately simplified - it aims for educational plausibility, not scientific precision. The rules below are the real ones the game uses.

## Availability: series dependencies multiply

When component A depends on B, a request needs **both** to work. Probabilities of independent events multiply, so availabilities **multiply** down a chain:

```
system availability = A_node1 × A_node2 × A_node3 × …   (then ×100 for a %)
```

A service at 99% in front of a database at 99.5% yields `0.99 × 0.995 = 0.985` → **98.5%**, *lower than either part*. This is the most important and least intuitive rule: **every component you add in series drags availability down.** Two 99.9% services in a chain can't beat 99.8% together.

The way out is **redundancy**: a backup that can take over means the system survives if *either* copy works, which multiplies the *failure* odds down instead. In Archimulant, redundancy-style improvements (replicas, extra instances, health checks with auto-restart) show up as boosts to a node's availability.

## Latency: it adds up along the path

Latency is simpler - every hop costs time, so the simulation **sums** the latency of every node and every edge a request passes through:

```
system latency = Σ node latencies + Σ edge latencies
```

More components and more network hops mean more milliseconds. To cut latency, shorten the path or speed up whatever sits on it - caching answers near the caller, scaling a slow service so it stops queuing.

## Throughput: the bottleneck wins

A chain can only push as many requests per second as its **narrowest** point. The simulation takes the **minimum** throughput across all nodes and edges:

```
system throughput = min(all node throughputs, all edge bandwidths)
```

This is why profiling matters: **improving anything except the bottleneck does nothing.** If your database caps at 150 RPS, upgrading a 250-RPS service to 500 RPS won't move the system number one bit - you have to widen the actual constraint.

## Cost: baseline plus what you add

Cost is just addition: the scenario's **baseline** running cost plus the cost of every improvement you apply, tracked separately for yearly-operational and one-time spend (see [Trade-offs & Budgets](/learn/trade-offs-and-budgets)).

## Putting it to work

Read any topology with these three questions:

- **Availability too low?** Find the long series chain - shorten it or add redundancy where it hurts most.
- **Latency too high?** Add up the path; attack the biggest single contributor.
- **Throughput too low?** Find the one minimum value - that, and only that, is your bottleneck.

That diagnosis loop is the core skill every scenario is training.

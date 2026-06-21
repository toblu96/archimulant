---
title: Vertical Scaling
group: performance
summary: Give a component a bigger machine - more CPU, memory, IOPS. Simple and effective, until you hit the ceiling.
tags:
  - scaling
  - throughput
canonicalPattern: Vertical Scaling
usedIn: []
goDeeper:
  - label: "Azure - Scaling up vs scaling out"
    url: https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/scale-partition
order: 28
---

## The problem

A component is running out of resources - CPU pegged, memory exhausted, disk I/O saturated - and it's slowing down or failing under load. You need more capacity, and you need it without re-architecting the system or rewriting the service to run as a stateless fleet.

## How it works

**Vertical scaling** ("scale up") means moving the component to a **bigger machine**: more CPU cores, more RAM, faster disks, higher network bandwidth. The application usually doesn't change at all - you just give it more headroom.

It's the natural first response, and for good reason:

- **No code changes** - a stateful service or a single database that can't easily be cloned just gets a bigger box.
- **No new complexity** - no load balancer, no coordination, no statelessness requirement. One machine, just a stronger one.
- **Immediate** - often a config change and a restart.

It contrasts with **horizontal scaling** ("scale out"), which adds *more* machines instead of a bigger one.

## Impact on metrics

| Metric | Effect | Why |
| --- | --- | --- |
| **Throughput** | ⬆️ more, up to a ceiling | A bigger machine handles more work - until you hit the largest size available |
| **Latency** | ⬆️ better | More CPU and memory mean less queuing and contention |
| **Availability** | ➡️ no improvement | It's still **one** machine - a single point of failure, now just a bigger one |
| **Cost** | ⬇️ rises, often steeply | Top-tier instances cost disproportionately more per unit of capacity |

## Trade-offs & when *not* to use it

- **There's a hard ceiling.** You can only buy so big; once you're on the largest instance, scaling up is over.
- **It doesn't help availability.** One bigger box is still one box, with no redundancy. If that's your concern, you need horizontal scaling or redundancy instead.
- **Diminishing returns on cost.** The biggest instances charge a premium; past a point, several smaller machines are cheaper for the same capacity.
- **Often means downtime** to resize, unless the platform supports live resizing.

Vertical scaling is the right first move for stateful components and quick wins; reach for **horizontal scaling** when you need redundancy or capacity beyond a single machine.

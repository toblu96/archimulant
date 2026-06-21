---
title: Redundancy & Failover
group: availability
summary: Run more than one of everything critical, so the system survives when a single component dies.
tags:
  - reliability
  - availability
canonicalPattern: Redundancy
usedIn: []
goDeeper:
  - label: "Azure Well-Architected - Redundancy"
    url: https://learn.microsoft.com/en-us/azure/well-architected/reliability/redundancy
  - label: "AWS - Regions and Availability Zones"
    url: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html
order: 15
---

## The problem

Any single component will eventually fail - a server crashes, a disk dies, a whole data centre loses power. If there's exactly one of something on the critical path, its failure is the system's failure. And as [Topology & Dependencies](/learn/topology-and-dependencies) shows, stringing components in series only makes it worse: each one you add **multiplies** the chance that something in the chain is down.

## How it works

Eliminate single points of failure by running **more than one** of each critical component, arranged so the system survives if *any* copy works rather than requiring *all* of them:

- **Redundancy** - keep spare capacity: a second server, a standby database, a duplicate network path.
- **Failover** - detect a failure and shift traffic to a healthy copy automatically. **Active-active** runs all copies serving traffic; **active-passive** keeps a standby ready to take over.
- **Spread copies across fault domains** - different machines, racks, or **availability zones** - so one physical failure can't take out every copy at once.

Mathematically this flips the availability sum in your favour: two parallel components at 99% each give the *pair* about 99.99%, because both must fail at the same moment to cause an outage.

## Impact on metrics

| Metric | Effect | Why |
| --- | --- | --- |
| **Availability** | ⬆️ improves sharply | The system survives any single component failure; parallel copies multiply away downtime |
| **Throughput** | ⬆️ often a bonus | Active-active copies share load as well as provide backup |
| **Latency** | ➡️ neutral | Redundancy doesn't speed up a healthy request |
| **Cost** | ⬇️ you pay for the spare | Redundant capacity costs money even when idle |

## Trade-offs & when *not* to use it

- **You pay for capacity you hope never to use.** An active-passive standby sits idle most of its life - insurance billed monthly.
- **Failover must be tested.** An untested standby is a guess; "it'll take over" has sunk many systems that found the replica stale or the promotion broken at the worst moment.
- **Redundancy needs independence.** Two copies sharing one power supply, network link, or dependency aren't really redundant - the shared piece is still a single point of failure.
- **Not everything needs it.** Reserve the spend for the critical path; full redundancy on a non-essential batch job is wasted money.

It's the foundation under **horizontal scaling**, **replication**, and **load balancing** - each is redundancy applied to a specific component.

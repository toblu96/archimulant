---
title: Horizontal Scaling
group: performance
summary: Add more instances behind a load balancer instead of one bigger box - more throughput and no single point of failure.
tags:
  - scaling
  - throughput
  - availability
canonicalPattern: Horizontal Scaling
usedIn:
  - ecommerce-peak-traffic
  - microservices-cascade-failure
goDeeper:
  - label: "AWS - Auto Scaling"
    url: https://docs.aws.amazon.com/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html
order: 20
---

## The problem

A single instance has a ceiling. As traffic grows it saturates - throughput flatlines, latency climbs - and it's also a **single point of failure**: when it dies, the whole service dies. You can buy a bigger machine (**vertical scaling**), but that runs out of headroom, costs disproportionately at the top end, and still leaves you with exactly one box to lose.

## How it works

Run **many instances** of the service and put a **load balancer** in front to spread requests across them - "scale out" instead of "scale up":

- Total throughput is roughly the sum of the instances - need more, add more.
- Any one instance can die and the rest carry on, so redundancy comes for free.
- Add and remove instances to match demand (the basis of autoscaling).

The catch is that instances must be **stateless** - no request-specific data kept in local memory - so any instance can handle any request. Session and other state moves to a shared store (cache or database).

## Impact on metrics

| Metric | Effect | Why |
| --- | --- | --- |
| **Throughput** | ⬆️ scales with count | Load spreads across N workers instead of one |
| **Availability** | ⬆️ improves | Surviving instances absorb traffic when one fails |
| **Latency** | ⬆️ better under load | Requests stop queuing behind a saturated single instance |
| **Cost** | ⬇️ grows with count | Every instance is more compute to pay for |

## Trade-offs & when *not* to use it

- **State is the enemy.** A service that keeps important state in local memory can't simply be cloned; you have to externalise state first.
- **You move the bottleneck, you don't delete it.** Ten app instances all hammering one database just relocate the wall to the database (see **replication** and **caching**).
- **Cost and coordination grow** with the fleet - more instances to deploy, observe, and pay for.

Horizontal scaling is the default answer for stateless, throughput-bound services; it leans on **load balancing** to distribute traffic and **health checks** to route around bad instances.

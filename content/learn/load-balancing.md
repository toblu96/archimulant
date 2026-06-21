---
title: Load Balancing
group: performance
summary: Spread incoming requests across many instances so no single one is overwhelmed - and dead instances are skipped automatically.
tags:
  - scaling
  - throughput
  - availability
canonicalPattern: Load Balancing
usedIn: []
goDeeper:
  - label: "Azure - Load-balancing options"
    url: https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/load-balancing-overview
  - label: "NGINX - What is load balancing?"
    url: https://www.nginx.com/resources/glossary/load-balancing/
order: 25
---

## The problem

Running many instances of a service (see [Horizontal Scaling](/learn/horizontal-scaling)) only helps if traffic is actually **spread across them**. Point every client at one instance and the others sit idle while that one melts. You also need something to notice when an instance dies and stop sending it requests - otherwise a fraction of users hit a black hole.

## How it works

A **load balancer** sits in front of the instance pool and distributes incoming requests across healthy instances:

- **Distribution algorithm** - round-robin, least-connections, or latency-based, deciding which instance gets the next request.
- **Health-aware** - it uses [health checks](/learn/health-checks) to route only to instances that are ready, and skips ones that fail.
- **Layer 4 vs Layer 7** - it can balance at the transport level (TCP) or the application level (HTTP), where it can also route by path, terminate TLS, and more.

The result: traffic fills the whole pool evenly, and a failed instance is quietly removed from rotation without the client ever knowing.

## Impact on metrics

| Metric | Effect | Why |
| --- | --- | --- |
| **Throughput** | ⬆️ unlocks the pool | Work actually spreads across all instances, so the fleet's capacity is usable |
| **Availability** | ⬆️ improves | Requests route around failed instances automatically |
| **Latency** | ⬆️ better under load | No single instance saturates while others idle |
| **Cost** | ⬇️ adds the balancer | A managed load balancer is a small, usually cheap addition |

## Trade-offs & when *not* to use it

- **It can become a single point of failure** - the one thing all traffic flows through. Production load balancers are themselves made redundant for exactly this reason.
- **Stateful sessions complicate it.** If a user must return to the same instance ("sticky sessions"), you lose some of the even-spreading benefit; better to make instances stateless.
- **It distributes, it doesn't create capacity.** A balancer in front of one instance, or in front of a pool that all hits one overloaded database, doesn't solve a capacity problem.

Load balancing is the partner of **horizontal scaling** and **health checks** - together they turn a pile of instances into one resilient, scalable service.

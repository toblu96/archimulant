---
title: Health Checks & Auto-restart
group: availability
summary: Let the platform detect unhealthy instances and replace them automatically, before users notice the outage.
tags:
  - reliability
  - operations
canonicalPattern: Health Endpoint Monitoring
usedIn:
  - ecommerce-peak-traffic
  - microservices-cascade-failure
goDeeper:
  - label: "Azure - Health Endpoint Monitoring"
    url: https://learn.microsoft.com/en-us/azure/architecture/patterns/health-endpoint-monitoring
order: 10
---

## The problem

An instance can be **running but broken**: the process is up, so the load balancer keeps sending it traffic, but it's deadlocked, out of memory, or stuck waiting on a dependency. Every request routed to it fails or hangs. Without a way to *ask* an instance whether it's actually well, bad instances stay in rotation and quietly erode availability - and a human has to notice and intervene before users do.

## How it works

Each instance exposes a **health endpoint** that the platform probes on a schedule. Two kinds of probe answer two different questions:

- **Liveness** - "are you alive?" If it fails, the orchestrator **restarts** the instance. Fixes deadlocks and unrecoverable states.
- **Readiness** - "are you ready for traffic?" If it fails, the load balancer **stops routing** to the instance without killing it. Lets an instance warm up, or shed traffic while a dependency is unavailable, then rejoin.

A good check verifies the instance can actually do its job (e.g. reach its database), not just that the process answers. The platform then detects and replaces bad instances automatically, usually before anyone notices.

## Impact on metrics

| Metric | Effect | Why |
| --- | --- | --- |
| **Availability** | ⬆️ improves | Bad instances are detected and replaced in seconds, shrinking unplanned downtime |
| **Latency** | ⬆️ slightly better | Traffic stops hitting hung instances that would have timed out |
| **Throughput** | ➡️ neutral | Capacity is restored, not increased |
| **Cost** | ➡️ negligible | A cheap endpoint plus orchestrator configuration |

## Trade-offs & when *not* to use it

- **A bad probe is worse than none.** Too strict and healthy instances get killed (restart loops, flapping in and out of rotation); too shallow and it reports "healthy" while the instance can't serve a real request.
- **Probes cost something to run** - keep them cheap and side-effect-free; don't run an expensive query on every check.
- **Cascading readiness.** If the check fails an instance whenever a shared dependency blips, an outage in that one dependency can drain *every* instance at once. Tune what the check actually depends on.

It only helps when something can replace the instance - so it's most powerful combined with **horizontal scaling** and **redundancy**.

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

> 🚧 Draft - full write-up coming soon.

## The problem

_Why unhealthy instances that stay in rotation quietly erode availability._

## How it works

_Liveness vs readiness probes; orchestrator restarts and removes bad instances._

## Impact on metrics

_Mainly availability: faster detection and recovery shrinks unplanned downtime._

## Trade-offs & when *not* to use it

_Bad probes cause restart loops or flapping; probes must be cheap and meaningful._

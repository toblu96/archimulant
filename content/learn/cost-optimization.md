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
  - microservices-cascade-failure
goDeeper:
  - label: "Azure Well-Architected - Cost Optimization"
    url: https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/
order: 10
---

> 🚧 Draft - full write-up coming soon.

## The problem

_There is no free quality. Redundancy, caching and replication all cost money; cutting them saves money but reimports the risk you paid to remove._

## How it works

_Right-sizing, removing unused capacity, and deliberately accepting lower quality where the business can tolerate it. Read cost against availability/latency/throughput, not in isolation._

## Impact on metrics

_Cost down, but usually at the expense of availability, latency or throughput - the "cost-saving" cards in the game make this trade explicit._

## Trade-offs & when *not* to use it

_Cutting cost on a critical path is false economy; an outage during a recruiter visit costs more than the instance you saved._

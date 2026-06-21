---
title: Database per Service
group: decoupling
summary: Give each service its own database so teams can change schemas independently and a shared DB stops being a chokepoint.
tags:
  - microservices
  - data
  - coupling
canonicalPattern: Database per Service
usedIn:
  - microservices-cascade-failure
goDeeper:
  - label: "microservices.io - Database per Service"
    url: https://microservices.io/patterns/data/database-per-service.html
order: 10
---

> 🚧 Draft - full write-up coming soon.

## The problem

_A shared database couples services: one schema change or one heavy query affects everyone, and it becomes a single bottleneck and failure point._

## How it works

_Each service owns its data and exposes it only through its API; no cross-service table access._

## Impact on metrics

_Better isolation and independent scaling/availability; cross-service queries and transactions get harder._

## Trade-offs & when *not* to use it

_No more joins across services; consistency goes eventual (sagas). Overkill for a small, cohesive system._

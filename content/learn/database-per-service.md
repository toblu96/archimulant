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

## The problem

When many services share **one database**, they become invisibly coupled through it. One team's schema change can break another team's queries. One service's heavy report can lock tables and slow everyone down. And the shared database is a single bottleneck and a single failure point for the whole system. The services look independent on the diagram, but the shared store quietly welds them together.

## How it works

Each service **owns its own database**, and no other service is allowed to touch it directly:

- A service's data is private. Others reach it only through that service's **API**, never by reading its tables.
- Each team can choose the right store for their job (relational, document, key-value) and evolve their schema on their own schedule.
- Faults and load are isolated to each service's store.

This is a defining trait of a true microservices architecture - it's what lets services be deployed and scaled independently.

## Impact on metrics

| Metric | Effect | Why |
| --- | --- | --- |
| **Availability** | ⬆️ isolated | One service's database trouble no longer takes down the others |
| **Throughput** | ⬆️ scales per service | Each store is sized and scaled for its own service's load |
| **Latency** | ➡️ mixed | Local reads are fast, but data spanning services now needs API calls |
| **Cost** | ⬇️ more stores | Several databases to run instead of one |

## Trade-offs & when *not* to use it

- **No more cross-service joins or transactions.** Data that used to be one `JOIN` is now several API calls, and keeping it consistent means **eventual consistency** and patterns like sagas.
- **More operational surface** - many databases to back up, patch, and monitor.
- **Overkill for a small, cohesive app.** If one team owns everything and the data is tightly related, a single well-structured database is simpler and faster. This pattern earns its cost at organisational scale.

It's the data half of splitting a monolith, and usually arrives alongside **async messaging** to keep services in sync without tight coupling.

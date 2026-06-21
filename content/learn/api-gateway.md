---
title: API Gateway
group: decoupling
summary: A single front door for many services - one entry point that handles routing, auth, and cross-cutting concerns.
tags:
  - microservices
  - gateway
  - coupling
canonicalPattern: API Gateway / Gateway Routing
usedIn: []
goDeeper:
  - label: "microservices.io - API Gateway"
    url: https://microservices.io/patterns/apigateway.html
  - label: "Azure - Gateway Routing pattern"
    url: https://learn.microsoft.com/en-us/azure/architecture/patterns/gateway-routing
order: 5
---

## The problem

Once a system is split into many services, clients face a mess. Which of the twenty services do I call for this screen? How do I authenticate against each one? What happens when a service moves, splits, or gets renamed? Letting every client talk directly to every service couples the client to your internal structure and forces each service to re-implement the same cross-cutting concerns - auth, rate limiting, logging - over and over.

## How it works

An **API gateway** is a single entry point that sits between clients and your services and routes each request to the right one:

- **Routing** - one public endpoint; the gateway forwards `/orders` to the order service, `/payments` to the payment service, and so on. Internal structure stays hidden.
- **Cross-cutting concerns in one place** - authentication, rate limiting, TLS termination, request logging, and caching handled at the gateway instead of in every service.
- **Aggregation** - it can fan a single client request out to several services and combine the results, so a mobile screen makes one call instead of ten.

The client depends only on the gateway's stable contract, not on how many services sit behind it or where they live.

## Impact on metrics

| Metric | Effect | Why |
| --- | --- | --- |
| **Latency** | ➡️ small extra hop | One more network hop, often offset by aggregation and edge caching |
| **Availability** | ⬆️ enables protection | A central place to apply rate limiting, retries, and circuit breaking |
| **Throughput** | ➡️ neutral to positive | Offloads TLS/auth from services; can cache common responses |
| **Cost** | ⬇️ adds the gateway | One more component to run, usually a managed service |

## Trade-offs & when *not* to use it

- **It's a single point of failure and a potential bottleneck** - everything flows through it, so it must be made redundant and scaled like any critical path.
- **It can become a dumping ground.** Pile too much business logic in and it turns into a new monolith ("god gateway"); keep it to routing and cross-cutting concerns.
- **Overkill for a single service** - you don't need a gateway to front one API.

The gateway is where many resilience patterns naturally live - **rate limiting**, **circuit breaker**, **retry** - and it's the public face of a **database-per-service** style microservices system.

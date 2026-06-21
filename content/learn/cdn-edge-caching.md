---
title: CDN & Edge Caching
group: performance
summary: Serve static and cacheable content from servers close to the user, cutting latency and offloading your origin.
tags:
  - performance
  - caching
  - latency
canonicalPattern: Static Content Hosting / CDN
usedIn: []
goDeeper:
  - label: "Azure - Static Content Hosting pattern"
    url: https://learn.microsoft.com/en-us/azure/architecture/patterns/static-content-hosting
  - label: "Cloudflare - What is a CDN?"
    url: https://www.cloudflare.com/learning/cdn/what-is-a-cdn/
order: 15
---

## The problem

Physics sets a floor on latency: a request from a user in Sydney to a server in Frankfurt crosses the planet and back, no matter how fast your code is. For the parts of your traffic that are the **same for everyone** - images, scripts, stylesheets, videos, cacheable API responses - making every user round-trip to a single origin wastes both their time and your origin's capacity.

## How it works

A **Content Delivery Network (CDN)** is a fleet of caching servers (**edge** locations) spread around the world. Cacheable content is copied to the edge and served from whichever location is nearest the user:

- The **first request** for an asset is fetched from your **origin** and cached at the edge.
- **Subsequent requests** from that region are served straight from the edge - close, fast, and never touching your origin.
- Freshness is controlled with **cache headers** (`Cache-Control`, `ETag`) and a **TTL**; you can also actively **purge** the edge when content changes.

It's [caching](/learn/caching-strategies) applied geographically: instead of keeping hot data in memory next to the service, you keep it in servers next to the user.

## Impact on metrics

| Metric | Effect | Why |
| --- | --- | --- |
| **Latency** | ⬆️ much lower | Content is served from an edge near the user instead of a distant origin |
| **Throughput** | ⬆️ origin offloaded | Cached requests never reach your servers, freeing their capacity |
| **Availability** | ⬆️ improves | The edge can keep serving cached content even if the origin is briefly down |
| **Cost** | ⬇️ usually net positive | CDN bandwidth is cheap and offsets origin compute and egress |

## Trade-offs & when *not* to use it

- **Only for cacheable content.** Per-user, frequently-changing, or sensitive responses generally can't be cached at a shared edge.
- **Invalidation lag.** A stale asset can linger at the edge until its TTL expires or you purge it; cache-busting (versioned filenames) is the usual fix.
- **Another system in the path.** Misconfigured cache headers can serve stale or private data, or cache nothing at all.

A CDN is the highest-leverage latency win for static-heavy, geographically spread traffic - and it pairs naturally with an **API gateway** in front of dynamic requests.

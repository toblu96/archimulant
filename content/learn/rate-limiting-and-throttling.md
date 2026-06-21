---
title: Rate Limiting & Throttling
group: availability
summary: Cap how much load a client or the system as a whole can place, so a spike or abusive caller can't take everyone down.
tags:
  - resilience
  - protection
canonicalPattern: Rate Limiting / Throttling
usedIn: []
goDeeper:
  - label: "Azure - Throttling pattern"
    url: https://learn.microsoft.com/en-us/azure/architecture/patterns/throttling
  - label: "Azure - Rate Limiting pattern"
    url: https://learn.microsoft.com/en-us/azure/architecture/patterns/rate-limiting-pattern
order: 35
---

## The problem

A system has finite capacity, but demand doesn't respect it. A traffic spike, a runaway client stuck in a retry loop, a misbehaving integration, or a deliberate flood can all push load past what the system can serve. Left unchecked, the overload doesn't just slow things down - it exhausts resources and brings the whole system down, so that *everyone* fails instead of just the excess requests.

## How it works

Put a deliberate **cap** on consumption and reject or delay anything over the line, keeping the system inside its safe operating range:

- **Rate limiting** - cap requests per client over a window (e.g. 100/minute per API key). Excess is rejected, usually with HTTP `429 Too Many Requests`. Common algorithms: token bucket, leaky bucket, sliding window.
- **Throttling** - protect the *system* as a whole: shed or slow load once total demand nears capacity, degrading gracefully rather than collapsing.
- **Prioritise** - drop low-value traffic first so critical requests still get through.

The mindset shift: it's better to **cleanly reject some requests** than to accept all of them and fail every one.

## Impact on metrics

| Metric | Effect | Why |
| --- | --- | --- |
| **Availability** | ⬆️ protects it | The system stays up for the requests it accepts instead of collapsing under all of them |
| **Throughput** | ➡️ capped on purpose | Sustained good throughput beats a brief spike followed by an outage |
| **Latency** | ⬆️ stays bounded | Keeping load within capacity avoids the latency blow-up of an overloaded system |
| **Cost** | ➡️ negligible | A gateway/middleware concern; can even *save* cost by capping autoscale |

## Trade-offs & when *not* to use it

- **You're rejecting real users.** Limits set too low turn away legitimate traffic; choosing the threshold is a product decision, not just a technical one.
- **Distributed counting is tricky.** Enforcing a global limit across many instances needs shared state (often the cache), which adds its own latency and failure modes.
- **It caps, it doesn't add capacity.** Rate limiting protects what you have; if you're permanently over capacity, you need to scale, not just throttle.

It's the front door's bouncer - pair it with **autoscaling** (add capacity for sustained demand) and **async messaging** (buffer accepted load). It usually lives at the **API gateway**.

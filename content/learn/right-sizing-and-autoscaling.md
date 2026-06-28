---
title: Right-sizing & Autoscaling
group: cost
summary: Match capacity to real demand - scale up for spikes and back down when idle - instead of paying for peak around the clock.
tags:
  - cost
  - scaling
  - efficiency
canonicalPattern: Autoscaling
usedIn:
  - loan-origination-strain
goDeeper:
  - label: "Azure - Autoscaling best practices"
    url: https://learn.microsoft.com/en-us/azure/architecture/best-practices/auto-scaling
  - label: "AWS - What is Auto Scaling?"
    url: https://docs.aws.amazon.com/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html
order: 20
---

## The problem

Demand isn't constant - it has daily peaks, quiet nights, and occasional spikes. If you provision for the **peak** and run it 24/7, you pay for capacity that sits idle most of the time. If you provision for the **average**, you fall over during spikes. Either way, a fixed capacity is the wrong fit for variable demand - and the mismatch is either pure waste or pure risk.

## How it works

**Right-sizing** is picking the correct capacity for actual demand; **autoscaling** makes that capacity track demand automatically:

- **Right-size first** - measure real utilisation and choose instance sizes and counts that fit, rather than guessing high "to be safe".
- **Scale out on signal** - add instances when a metric (CPU, request rate, queue depth) crosses a threshold, and remove them when it drops. You pay for peak capacity only during the peak.
- **Bound it** - keep a minimum for availability, cap a maximum to bound cost, and tune cooldowns so it doesn't thrash.

It's the constructive counterpart to the "cost-saving" cards: instead of bluntly cutting capacity and hoping, you let capacity **follow** demand. (See [Trade-offs & Budgets](/learn/trade-offs-and-budgets) for the underlying mindset.)

## Impact on metrics

| Metric | Effect | Why |
| --- | --- | --- |
| **Cost** | ⬆️ lower | You pay for capacity only when demand needs it, not for peak around the clock |
| **Availability** | ⬆️ maintained | Capacity grows to meet spikes instead of buckling - if floor and limits are set right |
| **Throughput** | ➡️ tracks demand | Scales out under load; the system keeps up without permanent over-provisioning |
| **Latency** | ➡️ steadier | Adding capacity before saturation avoids the latency spike of an overloaded fleet |

## Trade-offs & when *not* to use it

- **Scaling isn't instant.** New instances take time to start and warm up; a sudden spike can outrun the scaler, so you still need a sensible floor and often a buffer.
- **It requires statelessness** and the same discipline as **horizontal scaling** - autoscaling a stateful service doesn't work cleanly.
- **Thrashing wastes money and stability.** Badly tuned thresholds scale up and down repeatedly; cooldowns and good signals matter.
- **Scale-to-zero trades cost for cold-start latency** - fine for background work, not for a latency-critical path.

Right-sizing and autoscaling turn capacity from a fixed bet into a dial that follows demand - the disciplined way to hit your targets **and** your budget.

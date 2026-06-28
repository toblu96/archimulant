---
title: Quality Attributes
group: foundations
summary: Availability, latency, throughput and cost - the four numbers Archimulant tracks, and how they map to how the industry measures systems.
tags:
  - basics
  - metrics
canonicalPattern: ISO/IEC 25010
usedIn:
  - loan-origination-strain
goDeeper:
  - label: "ISO/IEC 25010 - product quality model"
    url: https://iso25000.com/index.php/en/iso-25000-standards/iso-25010
  - label: "Azure Well-Architected Framework"
    url: https://learn.microsoft.com/en-us/azure/well-architected/
order: 2
---

## Functional vs quality requirements

What a system *does* - take an order, process a payment - are its **functional** requirements. *How well* it does them - fast enough, reliably enough, cheaply enough - are its **quality attributes** (sometimes called non-functional requirements). Architecture is mostly about quality attributes: two systems can offer the same features but differ wildly in whether they stay up under load.

The industry standard catalogue of these is **ISO/IEC 25010**, which groups quality into characteristics like Reliability, Performance Efficiency, Maintainability and Security. Archimulant deliberately simplifies this down to **four numbers** you can feel as you play.

## The four Archimulant tracks

| Metric | Question it answers | ISO 25010 home | Better is |
| --- | --- | --- | --- |
| **Availability** | What fraction of requests succeed? | Reliability | Higher (→ 100%) |
| **Latency** | How long does a request take? | Performance Efficiency · Time behaviour | Lower (ms) |
| **Throughput** | How many requests/sec can it handle? | Performance Efficiency · Capacity | Higher (RPS) |
| **Cost** | What does it cost to run? | (a constraint, not a quality) | Lower (within budget) |

**Availability** is usually written as a percentage or in "nines": 99% means ~3.65 days of downtime a year; 99.9% ("three nines") means ~8.8 hours. Each extra nine is roughly ten times harder - and more expensive - to reach.

**Latency** is what a single user waits. **Throughput** is how much the system handles in aggregate. They're related but distinct: a system can be fast for one user yet fall over when a thousand arrive at once.

**Cost** isn't a quality attribute - it's the constraint that makes the others interesting. Anyone can hit 99.99% with an unlimited budget. The skill is hitting the target *within* the budget.

## Targets, SLAs, and "good enough"

Every scenario gives you **target metrics** - the win condition (e.g. availability ≥ 99.5%, latency ≤ 600ms, throughput ≥ 200 RPS). These mirror a real **SLA** (Service Level Agreement): the quality level you've promised users.

The key mindset: quality attributes are targets to *meet*, not maximise. Pushing availability to 99.999% when the target is 99.5% burns budget you needed elsewhere. Architecture is the art of hitting "good enough" on every axis at once - which is exactly what [Trade-offs & Budgets](/learn/trade-offs-and-budgets) is about.

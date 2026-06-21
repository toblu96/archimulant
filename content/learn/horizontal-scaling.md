---
title: Horizontal Scaling
group: performance
summary: Add more instances behind a load balancer instead of one bigger box - more throughput and no single point of failure.
tags:
  - scaling
  - throughput
  - availability
canonicalPattern: Horizontal Scaling
usedIn:
  - ecommerce-peak-traffic
  - microservices-cascade-failure
goDeeper:
  - label: "AWS - Auto Scaling"
    url: https://docs.aws.amazon.com/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html
order: 20
---

> 🚧 Draft - full write-up coming soon.

## The problem

_A single instance caps throughput and is a single point of failure; vertical scaling hits a ceiling._

## How it works

_Run N stateless instances behind a load balancer; scale the count with demand._

## Impact on metrics

_Throughput and availability up (redundancy); needs statelessness and adds coordination._

## Trade-offs & when *not* to use it

_Stateful services resist it; cost grows with instance count; shared dependencies become the new bottleneck._

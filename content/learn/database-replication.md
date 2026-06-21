---
title: Database Replication
group: availability
summary: Keep copies of your data on multiple nodes to survive a database failure and spread read load.
tags:
  - data
  - availability
  - scaling
canonicalPattern: Replication / Read Replica
usedIn:
  - ecommerce-peak-traffic
goDeeper:
  - label: "AWS - Read replicas (RDS)"
    url: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html
order: 40
---

> 🚧 Draft - full write-up coming soon.

## The problem

_A single database is both a single point of failure and a read bottleneck under load._

## How it works

_Primary handles writes; read replicas serve reads and provide a failover target. Sync vs async replication._

## Impact on metrics

_Availability (failover) and read throughput up; introduces replication lag._

## Trade-offs & when *not* to use it

_Replication lag means stale reads; writes don't scale this way. Mind consistency requirements._

---
title: What Is Software Architecture?
group: foundations
summary: The parts a system is made of, how they connect, and the qualities that emerge from those choices. Start here.
tags:
  - basics
  - orientation
goDeeper:
  - label: "C4 model - visualising software architecture"
    url: https://c4model.com/
  - label: "Azure - Architecture fundamentals"
    url: https://learn.microsoft.com/en-us/azure/architecture/guide/
order: 1
---

## The one-sentence version

Software architecture is **the set of structures you'd find hard to change later**: the major components a system is built from, how they talk to each other, and the trade-offs that decide whether the system is fast, reliable, and affordable.

You can rewrite a function in an afternoon. Splitting one database into three, or moving from one server to a fleet behind a load balancer, is architecture - it shapes everything downstream and is expensive to undo. That's why architects think about these choices up front.

## Components, connections, and the qualities that emerge

Every system in Archimulant is drawn as a **topology** - a diagram of two things:

- **Nodes** - the components: a client, a service, a database, a gateway, an external system.
- **Edges** - the connections between them: an HTTP request, a SQL query, a message on a queue.

Architecture isn't just the boxes. It's what *emerges* when you wire them together a particular way. Put a database behind a single service and you've created a bottleneck. Add a second service instance and you've removed a single point of failure. The structure produces the behaviour - and the behaviour is what your users actually feel.

## Why structure matters

The same set of components can be assembled into a system that survives Black Friday or one that collapses under it. Three forces make the difference:

- **Dependencies** - when A needs B to do its job, A is only as reliable as B. Chains of dependencies compound.
- **Bottlenecks** - a system is only as fast as its slowest part on the critical path.
- **Trade-offs** - every improvement costs something: money, complexity, or another quality attribute. There is no free lunch.

These three ideas are the spine of everything else in this section.

## How to use the learn section

- New to all this? Read the rest of **Foundations** next: [Quality Attributes](/learn/quality-attributes), [Trade-offs & Budgets](/learn/trade-offs-and-budgets), and [Topology & Dependencies](/learn/topology-and-dependencies).
- Playing a scenario? Each improvement card links straight to the concept page that explains it - that's the fastest way to learn, because you see the metric move as you read.

You don't need to memorise patterns. Aim to recognise *which problem* a pattern solves, and *what it costs* - the game will drill the rest.

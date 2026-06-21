---
title: Documenting Architecture with arc42
group: foundations
summary: A lightweight, proven template for architecture documentation - twelve sections that answer the questions every architecture doc should, without the blank-page paralysis.
tags:
  - documentation
  - arc42
  - communication
canonicalPattern: arc42
usedIn: []
goDeeper:
  - label: "arc42 - official site"
    url: https://arc42.org/
  - label: "arc42 - the 12 sections explained"
    url: https://docs.arc42.org/home/
  - label: "Architecture Decision Records (ADR)"
    url: https://adr.github.io/
  - label: "Archimulant's own arc42 documentation"
    url: https://github.com/toblu96/archimulant/blob/main/docs/arc42/arc42.md
order: 5
---

## What is arc42?

arc42 is a **template for documenting software architecture** - a battle-tested table of contents of twelve sections, each answering a specific question about a system. It's free, open, technology-neutral, and widely used across industry. Created by Gernot Starke and Peter Hruschka, it deliberately separates *structure* (the fixed set of sections) from *content* (what you write in them), so you never face a blank page wondering "what should an architecture document even contain?"

Crucially, arc42 is a **template, not a method**. It doesn't tell you *how* to design - it gives you a consistent place to record the structures and decisions you arrive at, however you got there.

## Why use it

- **No blank-page problem.** The twelve sections are a checklist of what's worth writing down. Fill what's relevant, skip what isn't.
- **Shared structure means fast onboarding.** Anyone who knows arc42 can open any arc42 doc and immediately find the deployment view, the decisions, the quality goals. New joiners orient in minutes.
- **Communication over ceremony.** It's intentionally lightweight - prose, diagrams, and tables, kept as lean as the system needs. Documentation should be *useful*, not exhaustive.
- **Decisions don't get lost.** Sections 9 (Decisions) and 11 (Risks) capture the *why* behind the system - context that is otherwise locked in someone's head and gone when they leave.
- **It scales down.** A small project might fill five sections in two pages; a large one fills all twelve. Same template either way.

## The twelve sections

| # | Section | The question it answers |
| --- | --- | --- |
| 1 | **Introduction & Goals** | What is this system for, and what are its top quality goals and key requirements? |
| 2 | **Constraints** | What rules and limitations must the architecture obey (technical, organisational, conventions)? |
| 3 | **Context & Scope** | Where are the system's boundaries? Who and what does it interact with? |
| 4 | **Solution Strategy** | What fundamental decisions and approaches shape everything else? |
| 5 | **Building Block View** | What are the static parts of the system, and how do they decompose (the "boxes")? |
| 6 | **Runtime View** | How do the parts collaborate at runtime for the important scenarios (the "interactions")? |
| 7 | **Deployment View** | What infrastructure does it run on, and how is software mapped onto it? |
| 8 | **Cross-cutting Concepts** | What overarching concepts apply everywhere (security, persistence, error handling, logging)? |
| 9 | **Architecture Decisions** | What important decisions were made, and *why* (often captured as ADRs)? |
| 10 | **Quality Requirements** | What are the concrete quality scenarios, usually organised as a quality tree? |
| 11 | **Risks & Technical Debt** | What are the known risks and shortcuts, made visible rather than hidden? |
| 12 | **Glossary** | What do the key domain and technical terms actually mean? |

A useful way to read them: **1-3 are context** (why and where), **4-7 are structure** (how it's built and runs), and **8-12 are the cross-cutting concepts and the record** (concepts, decisions, quality, risks, vocabulary).

## How to use it well

- **Don't fill every box for its own sake.** Empty or trivial sections are noise. Write a section when it earns its place.
- **Diagrams carry the load.** arc42 pairs naturally with the **C4 model** for the building-block, runtime, and deployment views, and with **ISO 25010** for naming quality attributes (see [Quality Attributes](/learn/quality-attributes)).
- **Capture decisions as you make them**, not months later. **ADRs** (Architecture Decision Records) are the usual format for section 9 - one short file per decision, recording the context, the choice, and the consequences.
- **Keep it close to the code.** Living in the repo as Markdown means it's versioned with the system and reviewed in pull requests, so it drifts from reality far less.

## Example: Archimulant itself

This very project is documented with arc42 - a good worked example because it's small enough to read in one sitting. A few of its sections:

- **§1 Quality Goals** ranks *Interaction Capability (learnability)* first - pedagogical clarity outranks simulation precision - which then justifies decisions downstream.
- **§4 Solution Strategy** records the big calls: a directed-graph topology, content-as-data, a monolith for simplicity.
- **§9 Decisions** lists ADRs such as "use VueFlow for the canvas" and "Nuxt Content (Markdown) for the learn section" - the decision behind this very page.
- **§10 Quality Requirements** turns the goals into concrete scenarios ("user applies an improvement → metrics update within 200ms").

Reading a real arc42 document end-to-end is the fastest way to see how the sections fit together - the link to Archimulant's own is below.

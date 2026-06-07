# Requirements Archimulant

## Overview

This requirement document describes the Archimulant application, which is a online architecture simulation which serves the purpose to reinforce what was learned during the Software Architecture CAS (e.g. arc42). It shows the different stages from planning, requirements, architecture, documentation, implementation to the finished product. The final application will be used in the personal portfolio website as an example pet project. Therefore it is important to show all stages in the process and provide information about it.

The main application includes an architecture mini-game, where you have a set of predefined system architectures presented as diagram. The diagram shows all system components and actors and some overall health and performance characteristics of the system such as availability, response time or RPS. It includes a given budget (initial investment and annual costs) which you can use to improve the system to meet a defined quality target. There is a list of available system changes to the system, which have a cost assigned and will improve or degrade parts of the overall system. The goal of the game is to improve the system with applying those changes and learn how each change can influence the system (e.g. introduce caching, add testing, redundant service deployment, etc.). In addition, there should be a learning section where the users can get some insights about possible improvement strategies and when to use which. Those strategies are general concepts and not directly related to the game, the game will include specific scenarios based on the theoretical part documented.

## Users

### Architecture Enthusiast

The Architecture Enthusiast will use the application primarily to play a fun game or to learn about different architecture concepts and the potential influence of applying them.

- Select predefined system architecture with quality target scenario
- Learn about architecture concepts from the theory doc section
- Create own system architecture scenario
- Create tournament based on a scenario
- Play tournaments from others
- Check his overall ranking based on scenario or tournament on leaderboard (SLA achieved, cost efficiency, technical dept, operational complexity)

### Potential Recruiter

The Potential Recruiter will probably click on the portfolio website and browse the projects. This one should be an eye catcher and support personal CV statements.

- See personal capabilities based on a fun application
- Check out architecture work done (docs, decisions, concepts)
- Play a fun game

## Assumptions

Consider the following assumptions:

- Target audience are people with basic understanding of software architecture (e.g., students, junior developers). There is no expectation to be able to play the game without prior knowledge.
- The simulation does not need to be scientifically precise. Simplified, easy-to-understand calculation models are used. What matters is educational plausibility, not precision.
- Tournament participants do not need a registered account. They join a room using a code or link and play under a nickname of their choice. The host needs an account.
- All predefined content (scenarios, improvement cards, theoretical content) is created by the system operator. In the first version, end users cannot publish their own content-only hosts can create their own system definitions for their tournaments.
- The platform is free to use and does not have a paid subscription model.
- The primary target platform is desktop browsers. A mobile view is desirable, but is not intended to provide an equivalent experience.
- Tournament rooms are temporary and are not permanently saved once a defined period has ended or expired. Results can be exported by the host.
- The platform's language is English for both the user interface and the content. Additional languages can be added in a second iteration.

## Timeline for Implementation

This application will be a pet project with no real priority, it will be mainly worked on during weekends and evening sessions. The timeline ensures to scope the requirements and show off something working as soon as possible.

- Phase 1: Documentation of concepts and architecture
- Phase 2: Implementation of basic requirements such as gameplay with fixed scenarios, login possibility and a basic UI. Deployment of application to the public
- Phase 3: Add learning resources to application
- Phase 4: Implementation of advanced features such as leaderboard, creation of own scenarios, tournaments
- Phase 5: Nitpick improvements such as visual designer to add new scenarios instead of json based definition

### Future Improvements

- Add real scenario (e.g., "Black Friday traffic causes Checkout API latency to exceed SLA) with realistic simulation mechanics (traffic spikes, cascading failures, partial outages, DB deadlocks) like a strategy game
- Introduce changing stakeholder requirements (e.g., new GDPR requirements, mobile users doubled, CEO wants multi-region, budget reduced by 30%)
- Different play modes (Incident Survival Mode with continuous evolvement and degradation, Blind Tradeoff Challenge - players only know business goals and partial metrics, not full internals)

## Nonfunctional Requirements

There is no expectation of massive user spikes on this application. Availability should be a focus to prevent downtime during a sporadic recruiter visit.

Performance metrics should be met according to best practices:

| Action        | Reaction Time |
| ------------- | ------------- |
| Welcome       | 0.3s          |
| Documentation | 0.5s          |
| Gameplay      | 1s            |

## Hardware- and Software Environment

There are some tooling and technologies defines according to the existing skills of the architect and developer. Main programming language is Typescript (backend and frontend), using [Nuxt](https://nuxt.com) (Vue.js based) for frontend and [Nitro](https://nitro.build) for backend.

The application can be hosted either in a homelab or using any cloud provider such as Cloudflare. Persistence shall be kept simple using SQLite or similar technologies preventing requirement of a massive infra setup just for a pet project.

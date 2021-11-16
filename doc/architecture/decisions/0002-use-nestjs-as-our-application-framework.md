# 2. Use NestJS as our application framework

Date: 2021-11-16

## Status

Accepted

## Context

We expect this application to be actively developed for a significant time, and
to continue to evolve to meet evolving user needs.

For a long-running project, it is helpful to have a well-defined application
structure and standard, covering concerns like established MVC patterns, TDD,
dependency injection, conventions over configuration, and toolchain. This helps
both the productivity of existing developers, but helps with knowledge transfer
around the team as new developers are brought on.

[Express](https://expressjs.com/) markets itself as the "Fast, unopinionated,
minimalist web framework for Node.js". While this provides a lot of flexibility
and freedom to follow your own path, it does not provide any guidance or
opinions around the application architecture, nor best practice patterns that
should be followed.

## Decision

We will use [NestJS](https://nestjs.com/) as an application framework for our
service, in order to boost development speed, productivity, and knowledge
transfer.

Although there are multiple application frameworks we could have chosen, we
believe that NestJS provides a well-defined application structure for our needs
and a consistent and well-documented developer experience. NestJS has a healthy
established community, good documentation, and is open source.

## Consequences

Choosing a widely-adopted, opinionated framework like NestJS that wraps around
Node and Express will allow the team to focus on delivering features at pace
without having to spend too long deciding on architecture and design choices.

Developers joining the project may be unfamiliar with NestJS. To mitigate this,
we will include setup scripts and link to NestJS documentation where helpful in
the README and commit messages to make onboarding as easy as possible. We
believe that this will provide a significantly clearer onboarding experience
than would exist for a self-written framework.
